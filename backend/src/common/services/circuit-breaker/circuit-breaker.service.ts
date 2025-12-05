import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes in half-open before closing
  timeout: number; // Time in ms before attempting to close circuit
}

export class CircuitBreakerOpenError extends Error {
  constructor(serviceName: string) {
    super(`Circuit breaker is OPEN for service: ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuits: Map<
    string,
    {
      state: CircuitState;
      failureCount: number;
      successCount: number;
      lastFailureTime: number;
      config: CircuitBreakerConfig;
    }
  > = new Map();

  private readonly defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
  };

  /**
   * Execute a function with circuit breaker protection
   * @param serviceName Unique identifier for the service
   * @param fn Function to execute
   * @param config Optional circuit breaker configuration
   * @returns Result of the function execution
   */
  async execute<T>(
    serviceName: string,
    fn: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>,
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(serviceName, config);

    // Check circuit state
    if (circuit.state === CircuitState.OPEN) {
      // Check if timeout has elapsed
      const now = Date.now();
      if (now - circuit.lastFailureTime >= circuit.config.timeout) {
        this.logger.log(
          `Circuit breaker for ${serviceName} transitioning to HALF_OPEN`,
        );
        circuit.state = CircuitState.HALF_OPEN;
        circuit.successCount = 0;
      } else {
        this.logger.warn(
          `Circuit breaker is OPEN for ${serviceName}. Rejecting request.`,
        );
        throw new CircuitBreakerOpenError(serviceName);
      }
    }

    try {
      const result = await fn();

      // Success - update circuit state
      this.onSuccess(serviceName);

      return result;
    } catch (error) {
      // Failure - update circuit state
      this.onFailure(serviceName);

      throw error;
    }
  }

  /**
   * Handle successful execution
   * @param serviceName Service identifier
   */
  private onSuccess(serviceName: string): void {
    const circuit = this.circuits.get(serviceName);
    if (!circuit) return;

    if (circuit.state === CircuitState.HALF_OPEN) {
      circuit.successCount++;

      if (circuit.successCount >= circuit.config.successThreshold) {
        this.logger.log(
          `Circuit breaker for ${serviceName} transitioning to CLOSED`,
        );
        circuit.state = CircuitState.CLOSED;
        circuit.failureCount = 0;
        circuit.successCount = 0;
      }
    } else if (circuit.state === CircuitState.CLOSED) {
      // Reset failure count on success
      circuit.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   * @param serviceName Service identifier
   */
  private onFailure(serviceName: string): void {
    const circuit = this.circuits.get(serviceName);
    if (!circuit) return;

    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    if (circuit.state === CircuitState.HALF_OPEN) {
      this.logger.warn(
        `Circuit breaker for ${serviceName} failed in HALF_OPEN state, transitioning to OPEN`,
      );
      circuit.state = CircuitState.OPEN;
      circuit.successCount = 0;
    } else if (
      circuit.state === CircuitState.CLOSED &&
      circuit.failureCount >= circuit.config.failureThreshold
    ) {
      this.logger.warn(
        `Circuit breaker for ${serviceName} failure threshold reached (${circuit.failureCount}/${circuit.config.failureThreshold}), transitioning to OPEN`,
      );
      circuit.state = CircuitState.OPEN;
    }
  }

  /**
   * Get or create a circuit for a service
   * @param serviceName Service identifier
   * @param config Optional configuration
   * @returns Circuit state object
   */
  private getOrCreateCircuit(
    serviceName: string,
    config?: Partial<CircuitBreakerConfig>,
  ) {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        config: { ...this.defaultConfig, ...config },
      });
    }

    return this.circuits.get(serviceName)!;
  }

  /**
   * Get the current state of a circuit
   * @param serviceName Service identifier
   * @returns Current circuit state
   */
  getState(serviceName: string): CircuitState {
    const circuit = this.circuits.get(serviceName);
    return circuit ? circuit.state : CircuitState.CLOSED;
  }

  /**
   * Manually reset a circuit to CLOSED state
   * @param serviceName Service identifier
   */
  reset(serviceName: string): void {
    const circuit = this.circuits.get(serviceName);
    if (circuit) {
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      circuit.successCount = 0;
      this.logger.log(`Circuit breaker for ${serviceName} manually reset`);
    }
  }
}
