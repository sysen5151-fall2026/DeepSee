'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  clearCases,
  decisionLabel,
  deleteCase,
  listCases,
  shortCaseId,
  type StoredCase,
} from '@/utils/caseHistory';
import { isNormalLabel } from '@/utils/predictions';
import { ArrowRight, Clock, History, LockKeyhole, Plus, Trash2 } from 'lucide-react';

export default function CasesPage() {
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCases(listCases());
    setLoaded(true);
  }, []);

  const openCase = (entry: StoredCase) => {
    sessionStorage.setItem('caseId', entry.id);
    sessionStorage.setItem('xrayResult', JSON.stringify(entry.result));
    sessionStorage.setItem('originalImageUrl', entry.thumbnail);
    if (entry.vitals) sessionStorage.setItem('patientVitals', JSON.stringify(entry.vitals));
    else sessionStorage.removeItem('patientVitals');
    router.push('/result');
  };

  const removeCase = (id: string) => {
    deleteCase(id);
    setCases(listCases());
  };

  const removeAll = () => {
    if (!window.confirm('Remove all locally saved reviews from this workstation?')) return;
    clearCases();
    setCases([]);
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0d766e]">
              <History className="h-4 w-4" /> Recent reviews
            </div>
            <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-[#17383f] sm:text-4xl">Saved on this workstation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#70858a]">
              Reviews are kept in this browser only. They are never uploaded, and clearing browser data removes them.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe3df] bg-white px-3 py-1.5 text-xs font-bold text-[#526f75] shadow-sm">
              <LockKeyhole className="h-3.5 w-3.5 text-[#0d766e]" /> Local storage only
            </span>
            <Link href="/analyze" className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d766e] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#075e58]">
              <Plus className="h-4 w-4" /> New review
            </Link>
          </div>
        </div>

        {!loaded ? null : cases.length === 0 ? (
          <div className="clinical-card p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3f0] text-[#0d766e]">
              <History className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-[#25474e]">No saved reviews yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#70858a]">
              Completed reviews appear here so you can reopen the differential, revisit the evidence, and record a decision.
            </p>
            <Link href="/analyze" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d766e] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#075e58]">
              Start a clinical review <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cases.map((entry) => {
                const normal = isNormalLabel(entry.topLabel);
                const decided = entry.decision?.status;
                return (
                  <article key={entry.id} className="clinical-card flex flex-col overflow-hidden">
                    <button onClick={() => openCase(entry)} className="group relative block bg-[#0c2227] p-2 text-left" aria-label={`Open review ${shortCaseId(entry.id)}`}>
                      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#07191d]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={entry.thumbnail} alt="Saved chest X-ray" className="h-full w-full object-contain transition group-hover:opacity-90" />
                      </div>
                      <span className="absolute left-4 top-4 rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold text-white/85 backdrop-blur">
                        Case {shortCaseId(entry.id)}
                      </span>
                    </button>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8b9da1]">Leading suggestion</p>
                          <p className={`mt-0.5 truncate text-base font-extrabold ${normal ? 'text-[#23845d]' : 'text-[#25474e]'}`}>{entry.topLabel}</p>
                        </div>
                        <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-black ${normal ? 'bg-[#e9f6ef] text-[#23845d]' : 'bg-[#fff2df] text-[#aa6a18]'}`}>
                          {Math.round(entry.topConfidence * 100)}%
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#7f9297]">
                        <Clock className="h-3.5 w-3.5" /> {new Date(entry.createdAt).toLocaleString()}
                      </div>

                      <span
                        className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] ${
                          decided === 'accepted'
                            ? 'bg-[#e9f6ef] text-[#23845d]'
                            : decided === 'rejected'
                            ? 'bg-[#fdecea] text-[#a1443f]'
                            : decided === 'indeterminate'
                            ? 'bg-[#fff2df] text-[#9b6110]'
                            : 'bg-[#eef2f1] text-[#7a8f94]'
                        }`}
                      >
                        {decisionLabel(decided)}
                      </span>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#e5eeeb] pt-3">
                        <button onClick={() => openCase(entry)} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0d766e] hover:underline">
                          Open review <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => removeCase(entry.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#8a9b9f] hover:bg-[#fdf2f1] hover:text-[#a1443f]" aria-label="Delete saved review">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#dbe7e3] bg-[#f8fbfa] p-4 sm:flex-row sm:items-center">
              <p className="text-xs leading-5 text-[#72888d]">
                Up to 12 reviews are retained. Older entries are dropped automatically. Use the export on each review to keep a PDF for the record.
              </p>
              <button onClick={removeAll} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#efc6c4] bg-white px-3.5 py-2 text-xs font-bold text-[#a1443f] hover:bg-[#fff5f4]">
                <Trash2 className="h-3.5 w-3.5" /> Clear all local reviews
              </button>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
