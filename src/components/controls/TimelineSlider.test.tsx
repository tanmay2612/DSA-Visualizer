import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimelineSlider } from './TimelineSlider';

describe('TimelineSlider', () => {
  it('renders nothing when there are no steps yet', () => {
    const { container } = render(
      <TimelineSlider currentIndex={-1} totalSteps={0} onJumpToStep={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the current step position out of the total', () => {
    render(<TimelineSlider currentIndex={11} totalSteps={38} onJumpToStep={vi.fn()} />);
    expect(screen.getByText('Step 12 / 38')).toBeInTheDocument();
  });

  it('shows "Step 0" before any step has been taken (currentIndex -1)', () => {
    render(<TimelineSlider currentIndex={-1} totalSteps={10} onJumpToStep={vi.fn()} />);
    expect(screen.getByText('Step 0 / 10')).toBeInTheDocument();
  });

  it('calls onJumpToStep with the target index (accounting for the -1 offset) when dragged', () => {
    const onJumpToStep = vi.fn();
    render(<TimelineSlider currentIndex={0} totalSteps={10} onJumpToStep={onJumpToStep} />);

    const slider = screen.getByLabelText('Execution timeline');
    fireEvent.change(slider, { target: { value: '5' } });

    // slider value 5 => currentIndex 4 (slider = currentIndex + 1)
    expect(onJumpToStep).toHaveBeenCalledWith(4);
  });

  it('can jump forward to the last step', () => {
    const onJumpToStep = vi.fn();
    render(<TimelineSlider currentIndex={0} totalSteps={10} onJumpToStep={onJumpToStep} />);

    const slider = screen.getByLabelText('Execution timeline');
    fireEvent.change(slider, { target: { value: '10' } });

    expect(onJumpToStep).toHaveBeenCalledWith(9);
  });

  it('can jump backward to the start', () => {
    const onJumpToStep = vi.fn();
    render(<TimelineSlider currentIndex={5} totalSteps={10} onJumpToStep={onJumpToStep} />);

    const slider = screen.getByLabelText('Execution timeline');
    fireEvent.change(slider, { target: { value: '0' } });

    expect(onJumpToStep).toHaveBeenCalledWith(-1);
  });
});
