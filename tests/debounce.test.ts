import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../src/lib/utils/debounce.ts';

describe('debounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('delays invocation by specified ms', () => {
    const fn = vi.fn();
    const d = debounce(fn, 200);
    d('hello');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('hello');
  });

  it('coalesces rapid calls into one', () => {
    const fn = vi.fn();
    const d = debounce(fn, 200);
    d('a'); d('b'); d('c');
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('fires again after another full delay has elapsed', () => {
    const fn = vi.fn();
    const d = debounce(fn, 200);
    d('first');
    vi.advanceTimersByTime(200);
    d('second');
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });
});
