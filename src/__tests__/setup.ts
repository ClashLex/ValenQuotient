import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically clean up components after each test run
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * jsdom does not implement HTMLCanvasElement.getContext. App.tsx paints the
 * grain-noise overlay on a canvas, so provide a minimal 2D stub rather than
 * letting every render log a "Not implemented" error.
 */
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
    }),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,');
}