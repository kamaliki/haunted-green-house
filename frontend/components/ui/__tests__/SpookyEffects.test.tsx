import { render, screen } from '@testing-library/react';
import {
  GhostParticles,
  CobwebDecorations,
  FogOverlay,
  DrippingSlime,
  HoverGlow,
  CriticalFlicker,
  PulseAlert,
} from '../SpookyEffects';

describe('SpookyEffects', () => {
  describe('GhostParticles', () => {
    it('renders the specified number of ghost particles', () => {
      const { container } = render(<GhostParticles count={3} />);
      const particles = container.querySelectorAll('.animate-ghost-particle');
      expect(particles.length).toBe(3);
    });

    it('renders with default count of 5', () => {
      const { container } = render(<GhostParticles />);
      const particles = container.querySelectorAll('.animate-ghost-particle');
      expect(particles.length).toBe(5);
    });
  });

  describe('CobwebDecorations', () => {
    it('renders cobwebs in specified corners', () => {
      const { container } = render(
        <CobwebDecorations corners={['top-right', 'bottom-left']} />
      );
      const cobwebs = container.querySelectorAll('.animate-cobweb-sway');
      expect(cobwebs.length).toBe(2);
    });

    it('renders in top-right corner by default', () => {
      const { container } = render(<CobwebDecorations />);
      const cobwebs = container.querySelectorAll('.animate-cobweb-sway');
      expect(cobwebs.length).toBe(1);
    });

    it('applies correct size classes', () => {
      const { container } = render(<CobwebDecorations size="lg" />);
      const cobweb = container.querySelector('.text-4xl');
      expect(cobweb).toBeInTheDocument();
    });
  });

  describe('FogOverlay', () => {
    it('renders fog overlay with animation', () => {
      const { container } = render(<FogOverlay />);
      const fog = container.querySelector('.animate-fog');
      expect(fog).toBeInTheDocument();
    });

    it('applies custom opacity', () => {
      const { container } = render(<FogOverlay opacity={0.5} />);
      const fog = container.querySelector('.animate-fog');
      expect(fog).toHaveStyle({ opacity: 0.5 });
    });
  });

  describe('DrippingSlime', () => {
    it('renders the specified number of drips', () => {
      const { container } = render(<DrippingSlime count={5} />);
      const drips = container.querySelectorAll('.animate-drip');
      expect(drips.length).toBe(5);
    });

    it('applies correct color class', () => {
      const { container } = render(<DrippingSlime color="purple" />);
      const drip = container.querySelector('.text-toxic-purple');
      expect(drip).toBeInTheDocument();
    });
  });

  describe('HoverGlow', () => {
    it('renders children with hover glow effect', () => {
      render(
        <HoverGlow color="green">
          <div>Test Content</div>
        </HoverGlow>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies correct glow color class', () => {
      const { container } = render(
        <HoverGlow color="red">
          <div>Test</div>
        </HoverGlow>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('hover:shadow-[0_0_30px_rgba(255,0,110,0.9),0_0_50px_rgba(255,0,110,0.5)]');
    });
  });

  describe('CriticalFlicker', () => {
    it('applies flicker animation when active', () => {
      const { container } = render(
        <CriticalFlicker active={true}>
          <div>Critical Warning</div>
        </CriticalFlicker>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('animate-flicker-intense');
    });

    it('does not apply animation when inactive', () => {
      const { container } = render(
        <CriticalFlicker active={false}>
          <div>Normal Content</div>
        </CriticalFlicker>
      );
      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass('animate-flicker-intense');
    });
  });

  describe('PulseAlert', () => {
    it('applies pulse-glow animation for critical severity', () => {
      const { container } = render(
        <PulseAlert severity="critical">
          <div>Critical Alert</div>
        </PulseAlert>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('animate-pulse-glow');
    });

    it('applies pulse animation for warning severity', () => {
      const { container } = render(
        <PulseAlert severity="warning">
          <div>Warning Alert</div>
        </PulseAlert>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('animate-pulse');
    });

    it('does not apply animation for info severity', () => {
      const { container } = render(
        <PulseAlert severity="info">
          <div>Info Alert</div>
        </PulseAlert>
      );
      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass('animate-pulse-glow');
      expect(wrapper).not.toHaveClass('animate-pulse');
    });
  });
});
