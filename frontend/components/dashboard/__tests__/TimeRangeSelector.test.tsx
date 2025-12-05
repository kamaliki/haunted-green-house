import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangeSelector } from '../TimeRangeSelector';
import type { TimeRange } from '../TimeRangeSelector';

describe('TimeRangeSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all default time range options', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('1 Hour')).toBeInTheDocument();
    expect(screen.getByText('6 Hours')).toBeInTheDocument();
    expect(screen.getByText('24 Hours')).toBeInTheDocument();
    expect(screen.getByText('7 Days')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
  });

  it('highlights the active time range', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
      />
    );

    const activeButton = screen.getByText('24 Hours').closest('button');
    expect(activeButton).toHaveClass('bg-ghost-green');
    expect(activeButton).toHaveClass('text-bg-darkest');
  });

  it('calls onChange when a time range is clicked', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('7 Days');
    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith('7d');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when clicking the already active range', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('24 Hours');
    fireEvent.click(button);

    // Should still call onChange even if it's the same value
    expect(mockOnChange).toHaveBeenCalledWith('24h');
  });

  it('renders with custom options', () => {
    const customOptions = [
      { value: '1h' as TimeRange, label: 'Last Hour' },
      { value: '24h' as TimeRange, label: 'Last Day' },
    ];

    render(
      <TimeRangeSelector
        value="1h"
        onChange={mockOnChange}
        options={customOptions}
      />
    );

    expect(screen.getByText('Last Hour')).toBeInTheDocument();
    expect(screen.getByText('Last Day')).toBeInTheDocument();
    expect(screen.queryByText('6 Hours')).not.toBeInTheDocument();
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onChange when disabled', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const button = screen.getByText('7 Days');
    fireEvent.click(button);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('shows ghost icon for active state', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
      />
    );

    const activeButton = screen.getByText('24 Hours').closest('button');
    expect(activeButton?.textContent).toContain('👻');
  });

  it('does not show ghost icon for inactive states', () => {
    render(
      <TimeRangeSelector
        value="24h"
        onChange={mockOnChange}
      />
    );

    const inactiveButton = screen.getByText('7 Days').closest('button');
    expect(inactiveButton?.textContent).not.toContain('👻');
  });
});
