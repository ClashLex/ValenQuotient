import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthPage from '../components/AuthPage';
import { AuthContext } from '../context/AuthContext';

describe('AuthPage', () => {
  it('renders auth modal correctly', () => {
    const mockOnClose = vi.fn();
    render(
      <AuthContext.Provider value={{ user: null, signInWithGoogle: vi.fn(), signOut: vi.fn(), loading: false }}>
        <AuthPage onClose={mockOnClose} />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/VALENQUOTIENT/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <AuthContext.Provider value={{ user: null, signInWithGoogle: vi.fn(), signOut: vi.fn(), loading: false }}>
        <AuthPage onClose={mockOnClose} />
      </AuthContext.Provider>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls signInWithGoogle when button is clicked', () => {
    const mockSignIn = vi.fn();
    render(
      <AuthContext.Provider value={{ user: null, signInWithGoogle: mockSignIn, signOut: vi.fn(), loading: false }}>
        <AuthPage onClose={vi.fn()} />
      </AuthContext.Provider>
    );

    const signInButton = screen.getByText(/Continue with Google/i);
    fireEvent.click(signInButton);
    expect(mockSignIn).toHaveBeenCalled();
  });
});
