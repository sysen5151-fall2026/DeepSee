'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  LockKeyhole,
  Network,
  ScanLine,
  Server,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  WifiOff,
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'Differential-first reasoning',
    description: 'Surfaces ranked possibilities instead of forcing a single automated diagnosis.',
  },
  {
    icon: Database,
    title: 'Evidence attached',
    description: 'Keeps supporting findings and biomedical references next to every suggestion.',
  },
  {
    icon: LockKeyhole,
    title: 'Private by architecture',
    description: 'Designed for local inference so identifiable clinical data never needs a public AI endpoint.',
  },
];

export default function Home() {
  const { isAuthenticatedUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-[#dbe7e3] bg-[#f8fbfa] soft-grid">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(13,118,110,0.10),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-14 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#cfe3df] bg-white px-3 py-1.5 text-xs font-bold text-[#47666c] shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dff1ed] text-[#0d766e]"><Sparkles className="h-3 w-3" /></span>
              Clinical support, not autonomous diagnosis
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.045em] text-[#15363d] sm:text-5xl lg:text-[62px] lg:leading-[1.04]">
              See the diagnosis you might otherwise miss.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-7 text-[#5f777d]">
              DeepSee brings imaging, patient context, and evidence into one calm clinical workspace—then surfaces a ranked differential for the clinician to review.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={isAuthenticatedUser ? '/analyze' : '/login'}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0d766e] px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(13,118,110,0.20)] transition hover:bg-[#075e58]"
              >
                {isAuthenticatedUser ? 'Start a clinical review' : 'Open clinician workspace'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-1.5 rounded-xl border border-[#d2e1de] bg-white px-5 py-3 text-sm font-bold text-[#36565d] transition hover:border-[#a9c8c2] hover:bg-[#fbfdfc]">
                How DeepSee works <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                [WifiOff, 'On-premise', 'No external AI call'],
                [ShieldCheck, 'Human review', 'Clinician stays in control'],
                [FileText, 'Traceable', 'Evidence with outputs'],
              ].map(([Icon, title, detail]) => {
                const I = Icon as typeof WifiOff;
                return (
                  <div key={String(title)} className="flex items-start gap-2.5 border-l-2 border-[#cfe3df] pl-3">
                    <I className="mt-0.5 h-4 w-4 text-[#0d766e]" />
                    <div>
                      <p className="text-xs font-extrabold text-[#31535a]">{String(title)}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-[#829499]">{String(detail)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[720px] self-center">
            <div className="absolute -inset-8 -z-10 rounded-[40px] bg-[#dfeeea]/70 blur-3xl" />
            <div className="overflow-hidden rounded-[22px] border border-[#cfdeda] bg-white shadow-[0_30px_90px_rgba(32,69,76,0.15)]">
              <div className="flex h-12 items-center justify-between border-b border-[#e2ebe8] bg-[#fbfdfc] px-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9e7e4]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9e7e4]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9e7e4]" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#688087]">
                  <LockKeyhole className="h-3 w-3 text-[#0d766e]" /> Local session · DS-0471
                </div>
              </div>

              <div className="grid min-h-[500px] md:grid-cols-[86px_1fr]">
                <aside className="hidden border-r border-[#e5eeeb] bg-[#f7faf9] p-3 md:block">
                  <div className="space-y-3">
                    {[Stethoscope, ScanLine, FileText, Network].map((Icon, index) => (
                      <div key={index} className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${index === 0 ? 'bg-[#0d766e] text-white shadow-sm' : 'text-[#789095]'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#809399]">Active case</p>
                      <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-[#1b3c43]">Clinical review</h2>
                    </div>
                    <span className="rounded-full bg-[#ecf7f2] px-2.5 py-1 text-[10px] font-extrabold text-[#287b5c]">Ready to review</span>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="overflow-hidden rounded-2xl bg-[#10282d] p-2 shadow-inner">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#07191d]">
                        <img src="/demo-xray.png" alt="Chest X-ray preview" className="h-full w-full object-cover opacity-90 grayscale" />
                        <div className="absolute left-[47%] top-[34%] h-24 w-20 rounded-full border border-[#f0b35b]/80 bg-[#f0b35b]/10 blur-[0.2px]" />
                        <div className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[9px] font-semibold text-white/80 backdrop-blur">PA view · 1024 × 1024</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-[#dce8e5] p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-[#36565d]">Differential diagnosis</p>
                          <span className="text-[10px] font-bold text-[#7a9095]">3 suggestions</span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {[
                            ['Pneumonia', 82, 'High'],
                            ['Atelectasis', 46, 'Moderate'],
                            ['Pleural effusion', 21, 'Low'],
                          ].map(([label, score, level], index) => (
                            <div key={String(label)}>
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-extrabold ${index === 0 ? 'bg-[#fdf1dd] text-[#9b6110]' : 'bg-[#edf3f2] text-[#61787e]'}`}>{index + 1}</span>
                                  <span className="font-bold text-[#315158]">{String(label)}</span>
                                </div>
                                <span className="font-extrabold text-[#365a61]">{Number(score)}%</span>
                              </div>
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#edf2f1]">
                                <div className={`h-full rounded-full ${index === 0 ? 'bg-[#e6a33d]' : 'bg-[#6fa49b]'}`} style={{ width: `${Number(score)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#dce8e5] bg-[#fbfdfc] p-4">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-[#34565d]">
                          <CheckCircle2 className="h-4 w-4 text-[#0d766e]" /> Supporting evidence
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-[#70868b]">Focal opacity aligns with reported cough and fever. Correlate with labs and clinical exam.</p>
                        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#0d766e]">View evidence trail <ChevronRight className="h-3 w-3" /></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[#d9e7e4] bg-[#f5f9f8] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0d766e] shadow-sm"><Server className="h-4 w-4" /></span>
                      <div>
                        <p className="text-[11px] font-extrabold text-[#37575e]">Local model engine</p>
                        <p className="text-[10px] text-[#829398]">No patient data leaves this workstation</p>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#35a977] shadow-[0_0_0_4px_rgba(53,169,119,0.12)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="clinical-kicker">Designed for the clinical moment</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[#183940] sm:text-4xl">Less interface. More signal.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#70858a]">The hierarchy is built around what a clinician needs to decide: patient context, ranked possibilities, why the model thinks so, and what deserves attention next.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="clinical-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-sm font-extrabold text-[#284a51]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#74898e]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#dbe7e3] bg-[#edf5f2]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="clinical-kicker">Workflow</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#183940]">A review path that mirrors clinical thinking.</h2>
          </div>
          {[
            ['01', 'Bring the case together', 'Upload imaging and add the relevant patient context before inference.'],
            ['02', 'Review the differential', 'See probabilities, areas of concern, and supporting evidence in one view.'],
            ['03', 'Make the clinical call', 'Accept, reject, or investigate suggestions. DeepSee never acts independently.'],
          ].map(([number, title, body]) => (
            <div key={number} className="border-l border-[#cbdeda] pl-5">
              <p className="text-xs font-black tracking-[0.12em] text-[#0d766e]">{number}</p>
              <h3 className="mt-3 text-base font-extrabold text-[#294b52]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#70858a]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[24px] bg-[#15383f] px-6 py-9 text-white sm:px-9 lg:flex lg:items-center lg:justify-between lg:px-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9fd1c9]"><ShieldCheck className="h-4 w-4" /> Human-in-the-loop by design</div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Put the co-pilot beside the clinician—not in the clinician’s seat.</h2>
          </div>
          <Link href={isAuthenticatedUser ? '/analyze' : '/login'} className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#15383f] transition hover:bg-[#edf5f2] lg:mt-0">
            Enter workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
