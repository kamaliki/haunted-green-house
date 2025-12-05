import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingSkeleton, LoadingOverlay } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders ghost spinner by default', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('👻')).toBeInTheDocument();
  });

  it('renders skull spinner when type is skull', () => {
    render(<LoadingSpinner type="skull" />);
    expect(screen.getByText('💀')).toBeInTheDocument();
  });

  it('renders bat spinner when type is bat', () => {
    render(<LoadingSpinner type="bat" />);
    expect(screen.getByText('🦇')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.text-2xl');
    expect(spinner).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.text-4xl');
    expect(spinner).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.text-6xl');
    expect(spinner).toBeInTheDocument();
  });
});

describe('LoadingSkeleton', () => {
  it('renders default number of skeleton lines', () => {
    const { container } = render(<LoadingSkeleton />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(3);
  });

  it('renders custom number of skeleton lines', () => {
    const { container } = render(<LoadingSkeleton lines={5} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(5);
  });
});

describe('LoadingOverlay', () => {
  it('renders with default message', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingOverlay message="Processing..." />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders spinner with specified type', () => {
    render(<LoadingOverlay type="skull" />);
    expect(screen.getByText('💀')).toBeInTheDocument();
  });
});
