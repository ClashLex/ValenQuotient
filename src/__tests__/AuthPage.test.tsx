import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthPage from '../components/AuthPage';
import { AuthContext } from '../context/AuthContext';
import { createAuthContextValue } from './testUtils';

describe('AuthPage', () => {
  it('renders auth modal correctly', () => {
    render(
      <AuthContext.Provider value={createAuthContextValue()}>
        <AuthPage onClose={vi.fn()} />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/VALENQUOTIENT/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <AuthContext.Provider value={createAuthContextValue()}>
        <AuthPage onClose={mockOnClose} />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls signInWithGoogle when button is clicked', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(undefined);
    render(
      <AuthContext.Provider
        value={{ ...createAuthContextValue(), signInWithGoogle: mockSignIn }}
      >
        <AuthPage onClose={vi.fn()} />
      </AuthContext.Provider>
    );

    // Google sign-in is async and the modal flips its loading state on settle,
    // so await the resulting render rather than asserting synchronously.
    await act(async () => {
      fireEvent.click(screen.getByText(/Continue with Google/i));
    });

    expect(mockSignIn).toHaveBeenCalled();
  });
});