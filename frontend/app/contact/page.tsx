'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { APP_VERSION, REPO_URL, getApiBaseUrl, getModeLabel } from '@/lib/config';
import { clearCases, listCases } from '@/utils/caseHistory';
import { Bug, Check, ClipboardList, Copy, ExternalLink, Github, LifeBuoy, LockKeyhole, Trash2 } from 'lucide-react';

const checklist = [
  'Which step you were on (imaging, patient context, review, or results).',
  'Whether the workspace showed "Demo mode" or "Local processing" in the header.',
  'What you expected to happen and what happened instead.',
  'The diagnostics block below. It contains no patient data.',
];

export default function SupportPage() {
  const [diagnostics, setDiagnostics] = useState<Record<string, string>>({});
  const [savedCases, setSavedCases] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSavedCases(listCases().length);
    setDiagnostics({
      'App version': APP_VERSION,
      Mode: getModeLabel(),
      'Inference service': getApiBaseUrl() || 'none (mock model in browser)',
      Browser: navigator.userAgent,
      Viewport: `${window.innerWidth} × ${window.innerHeight}`,
      'Saved reviews on this workstation': String(listCases().length),
      Time: new Date().toISOString(),
    });
  }, []);

  const diagnosticsText = Object.entries(diagnostics)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const copyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Clipboard unavailable:', error);
    }
  };

  const removeLocalData = () => {
    if (!window.confirm('Remove all locally saved reviews from this browser? This cannot be undone.')) return;
    clearCases();
    setSavedCases(0);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8">
        <p className="clinical-kicker">Support</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[#17383f] sm:text-4xl">Help, feedback, and diagnostics</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#70858a]">
          DeepSee is developed in the open for SYSEN 5151. Problems and suggestions are tracked on GitHub so the whole team can see them.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="clinical-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><Bug className="h-5 w-5" /></span>
              <div>
                <h2 className="text-sm font-extrabold text-[#2f5158]">Report a problem</h2>
                <p className="text-xs text-[#7f9297]">Open an issue on the project repository.</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {checklist.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-[#4f6a70]">
                  <ClipboardList className="mt-1 h-4 w-4 shrink-0 text-[#0d766e]" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`${REPO_URL}/issues/new`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#0d766e] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#075e58]">
                <Github className="h-4 w-4" /> Open a GitHub issue <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#d2e1de] bg-white px-4 py-2.5 text-sm font-bold text-[#36565d] hover:border-[#a9c8c2]">
                View repository
              </a>
            </div>
            <p className="mt-4 text-[11px] leading-5 text-[#8a9b9f]">Never include patient images, names, or identifiers in an issue.</p>
          </section>

          <section className="clinical-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><LifeBuoy className="h-5 w-5" /></span>
              <div>
                <h2 className="text-sm font-extrabold text-[#2f5158]">Common questions</h2>
                <p className="text-xs text-[#7f9297]">Short answers for the prototype.</p>
              </div>
            </div>
            <dl className="mt-5 divide-y divide-[#e5eeeb]">
              {[
                ['Why does the header say "Demo mode"?', 'No inference service is configured, so a mock model runs in the browser. Set NEXT_PUBLIC_API_URL to the local service to switch to connected mode.'],
                ['Where are my saved reviews?', 'In this browser only, under Recent reviews. They are never uploaded. Clearing browser data removes them.'],
                ['Can I trust the confidence number?', 'It reflects the classifier, not disease probability. Use it as a prompt for review, then record your decision.'],
                ['Why are there no citations?', 'The ontology-linked evidence layer is planned. The evidence trail marks it as not connected rather than inventing references.'],
              ].map(([question, answer]) => (
                <div key={question} className="py-3.5">
                  <dt className="text-sm font-extrabold text-[#35575e]">{question}</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#6d8489]">{answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="clinical-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#2f5158]">Session diagnostics</h2>
                <p className="text-xs text-[#7f9297]">Attach this to a report. Contains no patient data.</p>
              </div>
              <button onClick={copyDiagnostics} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d2e1de] bg-white px-3 py-1.5 text-xs font-bold text-[#36565d] hover:border-[#a9c8c2]">
                {copied ? <Check className="h-3.5 w-3.5 text-[#23845d]" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-[#f4f8f7] p-4 text-[11px] leading-5 text-[#4f6a70]">{diagnosticsText || 'Collecting…'}</pre>
          </section>

          <section className="clinical-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><LockKeyhole className="h-5 w-5" /></span>
              <div>
                <h2 className="text-sm font-extrabold text-[#2f5158]">Local data</h2>
                <p className="text-xs text-[#7f9297]">{savedCases} saved review{savedCases === 1 ? '' : 's'} in this browser.</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#6d8489]">
              Reviews, sign-in state, and drafts live in this browser&apos;s storage. Remove them when leaving a shared workstation.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/cases" className="inline-flex items-center gap-2 rounded-xl border border-[#d2e1de] bg-white px-4 py-2.5 text-sm font-bold text-[#36565d] hover:border-[#a9c8c2]">
                Manage reviews
              </Link>
              <button onClick={removeLocalData} className="inline-flex items-center gap-1.5 rounded-xl border border-[#efc6c4] bg-white px-4 py-2.5 text-sm font-bold text-[#a1443f] hover:bg-[#fff5f4]">
                <Trash2 className="h-4 w-4" /> Clear saved reviews
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
