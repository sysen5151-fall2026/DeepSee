'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/ui/LoginForm';
import useAuth from '@/hooks/useAuth';
import { Activity, BrainCircuit, FileText, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticatedUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticatedUser) router.push('/analyze');
  }, [isAuthenticatedUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0d766e]" />
          <p className="mt-3 text-sm font-semibold text-[#71878c]">Opening secure workspace…</p>
        </div>
      </div>
    );
  }
  if (isAuthenticatedUser) return null;

  return (
    <div className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-[#f5f8f7] soft-grid">
      <div className="absolute left-[-160px] top-[-180px] h-[500px] w-[500px] rounded-full bg-[#dcefe9] blur-3xl" />
      <div className="relative mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:py-16">
        <div className="hidden pr-10 lg:block">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d766e] text-white"><Activity className="h-5 w-5" /></span>
            <div>
              <p className="text-xl font-extrabold tracking-[-0.025em] text-[#17383f]">DeepSee</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7e9297]">Clinical AI workspace</p>
            </div>
          </div>
          <h1 className="mt-10 max-w-xl text-4xl font-extrabold tracking-[-0.045em] text-[#17383f] xl:text-5xl">Clinical context in. Explainable support out.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#667f85]">A private, clinician-controlled workspace for reviewing imaging and patient context with local AI decision support.</p>

          <div className="mt-9 space-y-4">
            {[
              [LockKeyhole, 'Local by default', 'Designed so protected health information does not need to leave the clinical environment.'],
              [BrainCircuit, 'Differential, not verdict', 'The model surfaces ranked possibilities for clinician interpretation.'],
              [FileText, 'Traceable reasoning', 'Evidence and supporting context stay adjacent to the model output.'],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof LockKeyhole;
              return (
                <div key={String(title)} className="flex max-w-lg gap-3 rounded-2xl border border-[#d6e5e1] bg-white/70 p-4 backdrop-blur">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><I className="h-4 w-4" /></span>
                  <div><p className="text-sm font-extrabold text-[#31545b]">{String(title)}</p><p className="mt-1 text-xs leading-5 text-[#74898e]">{String(text)}</p></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[470px]">
          <div className="clinical-card p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#0d766e] lg:hidden"><Activity className="h-4 w-4" /> DeepSee</div>
              <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#23464d]">Clinician sign in</h2>
              <p className="mt-2 text-sm leading-6 text-[#74898e]">Use your clinical workspace credentials to start or review a case.</p>
            </div>
            <LoginForm />
            <div className="mt-6 border-t border-[#e1ebe8] pt-5 text-center text-xs text-[#809398]">
              Need an account? <Link href="/register" className="font-extrabold text-[#0d766e] hover:underline">Create one</Link>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#829499]"><ShieldCheck className="h-3.5 w-3.5 text-[#0d766e]" /> Human-in-the-loop decision support only</div>
        </div>
      </div>
    </div>
  );
}
