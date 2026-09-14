'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye, EyeOff, FlaskConical, KeyRound, Loader2, LogIn, User } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { isDemoMode } from '@/lib/config';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const router = useRouter();
  const { login, error } = useAuth();
  const demo = isDemoMode();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const registered = sessionStorage.getItem('registrationSuccess') === 'true';
    const email = sessionStorage.getItem('registeredEmail') || '';
    if (!registered) return;

    setRegistrationSuccess(true);
    setRegisteredEmail(email);
    if (email.includes('@')) setUsername(email.split('@')[0]);
    sessionStorage.removeItem('registrationSuccess');
    sessionStorage.removeItem('registeredEmail');

    const timeoutId = setTimeout(() => setRegistrationSuccess(false), 8000);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) router.push('/analyze');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {registrationSuccess && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#cfe4da] bg-[#eff8f3] p-3.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#23845d]" />
          <div>
            <p className="text-sm font-extrabold text-[#287557]">Account created</p>
            <p className="mt-0.5 text-xs leading-5 text-[#3f7a63]">
              {registeredEmail ? `Registered ${registeredEmail}. ` : ''}Sign in with your credentials to open the workspace.
            </p>
          </div>
        </div>
      )}

      {demo && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#efd0ad] bg-[#fff8ee] p-3.5">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-[#b36a19]" />
          <div>
            <p className="text-sm font-extrabold text-[#80501a]">Demo mode</p>
            <p className="mt-0.5 text-xs leading-5 text-[#9b6f3c]">
              No inference service is connected. Enter any username and password to explore the workspace with a mock model.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#607b81]">
            Username
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba0a4]" />
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={`clinical-input pl-10 ${error ? 'border-[#e6a5a1]' : ''}`}
              placeholder={demo ? 'e.g. dr.rivera' : ''}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#607b81]">
            Password
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba0a4]" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`clinical-input pl-10 pr-11 ${error ? 'border-[#e6a5a1]' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8ba0a4] hover:bg-[#f3f7f6] hover:text-[#0d766e]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[#efc6c4] bg-[#fff5f4] px-4 py-3 text-sm font-medium text-[#a1443f]">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d766e] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(13,118,110,0.16)] transition hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#9fb4af]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {isLoading ? 'Opening workspace…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
