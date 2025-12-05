import { Injectable, Logger } from '@nestjs/common';
import {
  PredictionResult,
  TimeSeriesPoint,
  ForecastConfig,
} from '../interfaces/analytics.interface';

@Injectable()
export class PredictionEngine {
  private readonly logger = new Logger(PredictionEngine.name);

  /**
   * Generate forecasts for time-series data
   * @param historicalData Historical time-series data points
   * @param hoursAhead Number of hours to forecast ahead
   * @param config Forecast configuration
   * @returns PredictionResult with forecasted values and confidence intervals
   */
  forecast(
    historicalData: TimeSeriesPoint[],
    hoursAhead: number,
    config: ForecastConfig,
  ): PredictionResult {
    this.logger.debug(
      `Generating forecast for ${hoursAhead} hours using ${config.method}`,
    );

    if (!historicalData || historicalData.length === 0) {
      throw new Error('Historical data is required for forecasting');
    }

    if (hoursAhead <= 0) {
      throw new Error('Hours ahead must be greater than 0');
    }

    // Sort data by timestamp to ensure chronological order
    const sortedData = [...historicalData].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    // Generate predicted values based on the selected method
    let predictedValues: number[];
    switch (config.method) {
      case 'moving_average':
        predictedValues = this.movingAverage(sortedData, hoursAhead);
        break;
      case 'exponential_smoothing':
        predictedValues = this.exponentialSmoothing(sortedData, hoursAhead);
        break;
      case 'linear_regression':
        predictedValues = this.linearRegression(sortedData, hoursAhead);
        break;
      default:
        throw new Error(`Unsupported forecast method: ${config.method}`);
    }

    // Calculate confidence intervals
    const confidenceIntervals = this.calculateConfidenceInterval(
      predictedValues,
      sortedData,
      config.confidenceLevel,
    );

    // Generate timestamps for predictions (hourly intervals)
    const lastTimestamp = sortedData[sortedData.length - 1].timestamp;
    const predictions = predictedValues.map((value, index) => ({
      timestamp: new Date(
        lastTimestamp.getTime() + (index + 1) * 60 * 60 * 1000,
      ),
      value,
      confidenceInterval: confidenceIntervals[index],
    }));

    return {
      metric: 'forecast',
      predictions,
      generatedAt: new Date(),
      dataPointsUsed: sortedData.length,
    };
  }

  /**
   * Calculate confidence intervals for predictions
   * @param predictions Array of predicted values
   * @param historicalData Historical data for variance calculation
   * @param confidenceLevel Confidence level (0.0 to 1.0)
   * @returns Array of confidence intervals
   */
  calculateConfidenceInterval(
    predictions: number[],
    historicalData: TimeSeriesPoint[],
    confidenceLevel: number,
  ): Array<{ lower: number; upper: number }> {
    this.logger.debug(
      `Calculating confidence intervals at ${confidenceLevel} level`,
    );

    if (confidenceLevel < 0 || confidenceLevel > 1) {
      throw new Error('Confidence level must be between 0 and 1');
    }

    // Calculate standard deviation of historical data
    const values = historicalData.map((point) => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    // Z-score for confidence level (approximation)
    // 0.95 -> 1.96, 0.90 -> 1.645, 0.99 -> 2.576
    const zScore = this.getZScore(confidenceLevel);
    const margin = zScore * stdDev;

    return predictions.map((value) => ({
      lower: value - margin,
      upper: value + margin,
    }));
  }

  /**
   * Moving average forecast
   * Uses the average of the last N values to predict future values
   */
  private movingAverage(
    data: TimeSeriesPoint[],
    hoursAhead: number,
  ): number[] {
    const windowSize = Math.min(10, data.length); // Use last 10 points or all available
    const recentValues = data.slice(-windowSize).map((point) => point.value);
    const average =
      recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

    // Return the same average for all future predictions
    return Array(hoursAhead).fill(average);
  }

  /**
   * Exponential smoothing forecast
   * Gives more weight to recent observations
   */
  private exponentialSmoothing(
    data: TimeSeriesPoint[],
    hoursAhead: number,
  ): number[] {
    const alpha = 0.3; // Smoothing factor (0 < alpha < 1)
    const values = data.map((point) => point.value);

    // Calculate smoothed values
    let smoothed = values[0];
    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed;
    }

    // Use the last smoothed value for all predictions
    return Array(hoursAhead).fill(smoothed);
  }

  /**
   * Linear regression forecast
   * Fits a line to the data and extrapolates
   */
  private linearRegression(
    data: TimeSeriesPoint[],
    hoursAhead: number,
  ): number[] {
    const n = data.length;
    const values = data.map((point) => point.value);

    // Use indices as x values (0, 1, 2, ...)
    const xValues = Array.from({ length: n }, (_, i) => i);

    // Calculate means
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = values.reduce((sum, y) => sum + y, 0) / n;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (values[i] - yMean);
      denominator += Math.pow(xValues[i] - xMean, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Generate predictions
    const predictions: number[] = [];
    for (let i = 0; i < hoursAhead; i++) {
      const x = n + i; // Continue from where data ends
      predictions.push(slope * x + intercept);
    }

    return predictions;
  }

  /**
   * Get Z-score for a given confidence level
   */
  private getZScore(confidenceLevel: number): number {
    // Common confidence levels
    if (confidenceLevel >= 0.99) return 2.576;
    if (confidenceLevel >= 0.95) return 1.96;
    if (confidenceLevel >= 0.90) return 1.645;
    if (confidenceLevel >= 0.80) return 1.282;
    if (confidenceLevel >= 0.68) return 1.0;
    return 1.96; // Default to 95%
  }
}
