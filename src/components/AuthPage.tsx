import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Leaf, AlertCircle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const friendlyError = (code: string): string => {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName.trim());
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(1,8,40,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to ValenQuotient"
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(0,4,29,0.97)',
          boxShadow: '0 0 80px rgba(111,255,0,0.06), 0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top edge shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Close button */}
        <button
          id="auth-modal-close"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-cream/30 hover:text-cream hover:bg-white/8 transition-all duration-200 cursor-pointer z-10"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        {/* Logo header */}
        <div className="flex flex-col items-center pt-7 pb-4 px-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-neon to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-neon/20 mb-2.5">
            <div className="w-full h-full rounded-xl bg-[#010828] flex items-center justify-center font-bold font-grotesk text-neon text-sm">
              VQ
            </div>
          </div>
          <h2 className="font-grotesk text-base text-cream uppercase tracking-widest">
            VALENQUOTIENT
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <Leaf size={8} className="text-neon" />
            <span className="font-mono text-[8px] text-neon/60 uppercase tracking-widest">
              Save your progress across devices
            </span>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-y border-white/5">
          {(['signin', 'signup'] as AuthMode[]).map((m) => (
            <button
              key={m}
              id={`auth-tab-${m}`}
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                mode === m
                  ? 'text-neon border-b-2 border-neon bg-neon/5'
                  : 'text-cream/40 hover:text-cream/70'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Google OAuth Button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-cream transition-all duration-300 mb-5 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-mono text-[11px] uppercase tracking-wider group-hover:text-neon transition-colors">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="font-mono text-[9px] text-cream/30 uppercase tracking-widest">
              or email
            </span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {mode === 'signup' && (
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/30 pointer-events-none"
                />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 font-mono text-[12px] text-cream placeholder:text-cream/25 focus:outline-none focus:border-neon/50 focus:bg-neon/[0.03] transition-all duration-300"
                  autoComplete="name"
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/30 pointer-events-none"
              />
              <input
                id="auth-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 font-mono text-[12px] text-cream placeholder:text-cream/25 focus:outline-none focus:border-neon/50 focus:bg-neon/[0.03] transition-all duration-300"
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <Lock
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/30 pointer-events-none"
              />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Password (min. 6 chars)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-10 py-3 font-mono text-[12px] text-cream placeholder:text-cream/25 focus:outline-none focus:border-neon/50 focus:bg-neon/[0.03] transition-all duration-300"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/60 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <AlertCircle size={12} className="text-red-400 shrink-0" />
                <span className="font-mono text-[10px] text-red-400 leading-relaxed">{error}</span>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon text-[#010828] font-grotesk text-[11px] uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-lg shadow-neon/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1 group"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#010828]/30 border-t-[#010828] rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center font-mono text-[9px] text-cream/30">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-neon hover:text-white transition-colors cursor-pointer underline underline-offset-2"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
