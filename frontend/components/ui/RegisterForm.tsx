'use client';

import { useMemo, useState } from 'react';
import { AtSign, Eye, EyeOff, KeyRound, Loader2, User, UserPlus } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const MIN_PASSWORD_LENGTH = 8;

/**
 * useAuth reports backend validation problems as a message followed by
 * "field: detail" lines. Split those back into a summary and per-field notes.
 */
function parseAuthError(message: string | null): { summary?: string; fields: Record<string, string> } {
  if (!message) return { fields: {} };
  const [first, ...rest] = message.split('\n');
  const fields: Record<string, string> = {};
  rest.forEach((line) => {
    const [field, ...detail] = line.split(':');
    if (field && detail.length) fields[field.trim()] = detail.join(':').trim();
  });
  if (message.toLowerCase().includes('username') && message.toLowerCase().includes('exists')) {
    fields.username = fields.username || 'A user with that username already exists.';
    return { summary: 'Username is already taken', fields };
  }
  return { summary: first || 'Registration failed', fields };
}

const RegisterForm = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, error } = useAuth();

  const apiError = useMemo(() => parseAuthError(error), [error]);
  const displayError = validationError || apiError.summary;
  const fieldErrors = validationError ? {} : apiError.fields;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setValidationError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setValidationError('All fields are required.');
      return;
    }
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.username.trim(), formData.email.trim(), formData.password);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: string) => `clinical-input pl-10 ${fieldErrors[field] ? 'border-[#e6a5a1]' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#607b81]">Username</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba0a4]" />
          <input id="username" name="username" type="text" autoComplete="username" required value={formData.username} onChange={handleChange} className={inputClass('username')} aria-invalid={!!fieldErrors.username} />
        </div>
        {fieldErrors.username && <p className="mt-1 text-xs font-medium text-[#a1443f]">{fieldErrors.username}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#607b81]">Work email</label>
        <div className="relative">
          <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba0a4]" />
          <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputClass('email')} aria-invalid={!!fieldErrors.email} />
        </div>
        {fieldErrors.email && <p className="mt-1 text-xs font-medium text-[#a1443f]">{fieldErrors.email}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#607b81]">Password</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba0a4]" />
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={`${inputClass('password')} pr-11`} aria-invalid={!!fieldErrors.password} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8ba0a4] hover:bg-[#f3f7f6] hover:text-[#0d766e]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-xs font-medium text-[#a1443f]">{fieldErrors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#607b81]">Confirm</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba0a4]" />
            <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={inputClass('confirmPassword')} />
          </div>
        </div>
      </div>
      <p className="-mt-2 text-[11px] text-[#8a9b9f]">At least {MIN_PASSWORD_LENGTH} characters. Avoid reusing a hospital system password.</p>

      {displayError && (
        <div className="rounded-xl border border-[#efc6c4] bg-[#fff5f4] px-4 py-3 text-sm font-medium text-[#a1443f]">{displayError}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d766e] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(13,118,110,0.16)] transition hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#9fb4af]"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {isLoading ? 'Creating account…' : 'Create clinician account'}
      </button>
    </form>
  );
};

export default RegisterForm;
