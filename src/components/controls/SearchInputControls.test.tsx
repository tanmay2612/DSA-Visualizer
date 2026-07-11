import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchInputControls } from './SearchInputControls';

/**
 * Regression coverage for the bug reported after Phase 10 shipped:
 * ArrayInputControls (which only ever produces a plain `number[]`)
 * was being rendered for Linear Search and Binary Search too, even
 * though both need `{ values, target }`. There was no way to set a
 * custom target at all, and worse, using the custom-array field or
 * any "input shape" button crashed (`values.map is not a function`
 * inside binarySearch/linearSearch's generators) because `target`
 * was missing entirely. SearchInputControls replaces
 * ArrayInputControls for searching algorithms and always supplies
 * both fields together.
 */
describe('SearchInputControls', () => {
  it('calls onApply with both values and a numeric target', () => {
    const onApply = vi.fn();
    render(<SearchInputControls requiresSortedArray={false} onApply={onApply} />);

    fireEvent.change(screen.getByLabelText('Custom array input'), {
      target: { value: '5, 2, 8, 1' },
    });
    fireEvent.change(screen.getByLabelText('Custom target input'), {
      target: { value: '8' },
    });
    fireEvent.click(screen.getByText('Use this'));

    expect(onApply).toHaveBeenCalledWith({ values: [5, 2, 8, 1], target: 8 });
  });

  it('sorts the array before applying when requiresSortedArray is true (binary search)', () => {
    const onApply = vi.fn();
    render(<SearchInputControls requiresSortedArray onApply={onApply} />);

    fireEvent.change(screen.getByLabelText('Custom array input'), {
      target: { value: '5, 2, 8, 1' },
    });
    fireEvent.change(screen.getByLabelText('Custom target input'), {
      target: { value: '8' },
    });
    fireEvent.click(screen.getByText('Use this'));

    expect(onApply).toHaveBeenCalledWith({ values: [1, 2, 5, 8], target: 8 });
  });

  it('does not call onApply when the target field is empty', () => {
    const onApply = vi.fn();
    render(<SearchInputControls requiresSortedArray={false} onApply={onApply} />);

    fireEvent.change(screen.getByLabelText('Custom array input'), {
      target: { value: '1, 2, 3' },
    });
    fireEvent.click(screen.getByText('Use this'));

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByText(/numeric target/i)).toBeInTheDocument();
  });

  it('does not call onApply when the array field is invalid', () => {
    const onApply = vi.fn();
    render(<SearchInputControls requiresSortedArray={false} onApply={onApply} />);

    fireEvent.change(screen.getByLabelText('Custom array input'), {
      target: { value: 'not numbers' },
    });
    fireEvent.change(screen.getByLabelText('Custom target input'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByText('Use this'));

    expect(onApply).not.toHaveBeenCalled();
  });

  it('submits on Enter from either field', () => {
    const onApply = vi.fn();
    render(<SearchInputControls requiresSortedArray={false} onApply={onApply} />);

    fireEvent.change(screen.getByLabelText('Custom array input'), {
      target: { value: '4, 5, 6' },
    });
    fireEvent.change(screen.getByLabelText('Custom target input'), {
      target: { value: '5' },
    });
    fireEvent.keyDown(screen.getByLabelText('Custom target input'), { key: 'Enter' });

    expect(onApply).toHaveBeenCalledWith({ values: [4, 5, 6], target: 5 });
  });
});
