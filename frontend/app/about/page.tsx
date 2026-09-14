'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  FileText,
  Github,
  LockKeyhole,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Workflow,
  XCircle,
} from 'lucide-react';
import { REPO_URL } from '@/lib/config';

const doesDo = [
  'Ranks possible findings for a chest X-ray and shows model confidence for each.',
  'Combines the image result with vitals and reported symptoms using explicit Bayesian rules.',
  'Shows an evidence trail so the clinician can see what drove each suggestion.',
  'Records whether the clinician accepted, rejected, or left a suggestion indeterminate.',
  'Runs on-premise. No image or patient context is sent to a public AI service.',
];

const doesNotDo = [
  'Make a diagnosis, write orders, or start treatment.',
  'Replace radiologist interpretation or institutional protocols.',
  'Localise disease. The attention overlay is an interpretability aid, not a segmentation.',
  'Cite literature yet. The ontology-linked citation layer is on the roadmap, not in this prototype.',
];

const layers = [
  {
    icon: ScanLine,
    title: 'Clinician workspace',
    stack: 'Next.js 15 · React 19 · TypeScript · Tailwind',
    body: 'Guided review flow: imaging, patient context, ranked differential, evidence trail, decision capture, PDF export, and a local case history kept in the browser.',
  },
  {
    icon: Cpu,
    title: 'Local inference service',
    stack: 'Django REST · TensorFlow · JWT auth',
    body: 'Receives the image and vitals over the local network, runs the CNN, applies the knowledge base, and returns the ranked differential. Nothing leaves the deployment boundary.',
  },
  {
    icon: Database,
    title: 'Knowledge layer',
    stack: 'Bayesian priors and likelihoods · ontology (planned)',
    body: 'Symptom and vital-sign likelihoods update the prior for pneumonia and COVID-19. Future work links findings to biomedical ontologies and returns source citations.',
  },
];

const modelCard = [
  ['Task', 'Binary classification: pneumonia vs normal on frontal chest X-rays'],
  ['Architecture', 'Five convolutional blocks with batch normalisation, max pooling and dropout; 128-unit dense layer; sigmoid output'],
  ['Training data', 'Kaggle chest X-ray pneumonia dataset, about 5,000 images, augmented'],
  ['Reported performance', '89.9% accuracy with balanced F1 on the held-out split'],
  ['Input', 'Greyscale, resized to 150 × 150, scaled to 0–1'],
  ['Known limitations', 'Small and class-imbalanced dataset, single finding, no localisation, no external clinical validation'],
];

const status = [
  ['Imaging upload and review flow', 'Working'],
  ['Patient context (vitals, symptoms)', 'Working'],
  ['Ranked differential and evidence trail', 'Working'],
  ['Clinician decision capture and PDF export', 'Working'],
  ['Local case history', 'Working (browser storage)'],
  ['CNN inference via local service', 'Working when the service is running'],
  ['Attention overlay', 'Prototype approximation'],
  ['Ontology-linked citations', 'Planned'],
  ['Multi-finding model (NIH ChestX-ray14 labels)', 'Planned'],
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-[#dbe7e3] bg-[#f8fbfa] soft-grid">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="clinical-kicker">System information</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.045em] text-[#15363d] sm:text-5xl">
            On-premise decision support for the diagnoses that get missed.
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-7 text-[#5f777d]">
            DeepSee puts a ranked, explainable differential next to the clinician at the moment of review. It is built to sit inside a hospital network, keep protected health information local, and leave every decision with a person.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#0d766e] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#075e58]">
              Open the workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#d2e1de] bg-white px-5 py-3 text-sm font-bold text-[#36565d] transition hover:border-[#a9c8c2]">
              <Github className="h-4 w-4" /> Source on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
        <p className="clinical-kicker">System boundaries</p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#183940] sm:text-3xl">What DeepSee does, and what it leaves to the clinician.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="clinical-card p-6">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#23845d]"><ShieldCheck className="h-4 w-4" /> The system does</div>
            <ul className="mt-4 space-y-3">
              {doesDo.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-[#4f6a70]">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#23845d]" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="clinical-card p-6">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#a1443f]"><ShieldAlert className="h-4 w-4" /> The system does not</div>
            <ul className="mt-4 space-y-3">
              {doesNotDo.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-[#4f6a70]">
                  <XCircle className="mt-1 h-4 w-4 shrink-0 text-[#c0625d]" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dbe7e3] bg-[#edf5f2]">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
          <p className="clinical-kicker">Architecture</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#183940] sm:text-3xl">Three layers, one deployment boundary.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {layers.map(({ icon: Icon, title, stack, body }) => (
              <div key={title} className="clinical-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-sm font-extrabold text-[#284a51]">{title}</h3>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a9b9f]">{stack}</p>
                <p className="mt-3 text-xs leading-5 text-[#74898e]">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#d5e4e0] bg-white p-4">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#0d766e]" />
            <p className="text-sm leading-6 text-[#4f6a70]">
              <strong className="text-[#284a51]">Privacy boundary.</strong> The workspace talks only to the inference service address it is configured with. In demo mode there is no network call at all; the mock model runs in the browser. Saved reviews are stored in the browser on the clinician&apos;s workstation.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="clinical-kicker">Model card</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#183940] sm:text-3xl">The current image model, stated plainly.</h2>
            <p className="mt-4 text-sm leading-6 text-[#70858a]">
              The prototype ships the CNN from the original Cairo University CDSS project. It is a useful first signal and a placeholder for a multi-finding model trained on NIH ChestX-ray14 labels.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#efd0ad] bg-[#fff8ee] p-4">
              <BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-[#b36a19]" />
              <p className="text-xs leading-5 text-[#9b6f3c]">Model confidence is a property of the classifier, not the probability that a patient has the disease. Treat it as a prompt for review.</p>
            </div>
          </div>
          <div className="clinical-card overflow-hidden">
            <dl className="divide-y divide-[#e5eeeb]">
              {modelCard.map(([term, detail]) => (
                <div key={term} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[170px_1fr] sm:gap-4">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a9b9f]">{term}</dt>
                  <dd className="text-sm leading-6 text-[#4f6a70]">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-[#dbe7e3] bg-[#f8fbfa]">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="clinical-kicker">Prototype status</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-[#183940] sm:text-3xl">What works today.</h2>
              <p className="mt-4 text-sm leading-6 text-[#70858a]">
                This build is the SYSEN 5151 course prototype. It extends the open-source CDSS chest X-ray project by Mahmoud Mansy and team (Cairo University, Faculty of Engineering) with the DeepSee clinical hierarchy, privacy signalling, decision capture, and local history.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  [Workflow, 'Review path mirrors clinical thinking: case, differential, evidence, decision.'],
                  [BookOpenCheck, 'Every screen distinguishes model suggestion from clinician decision.'],
                  [FileText, 'Exported reports carry the decision and the decision-support disclaimer.'],
                  [Stethoscope, 'Vitals and symptoms feed explicit, inspectable rules rather than a black box.'],
                ].map(([Icon, text]) => {
                  const I = Icon as typeof Workflow;
                  return (
                    <div key={String(text)} className="flex items-start gap-3 text-sm leading-6 text-[#4f6a70]">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e7f3f0] text-[#0d766e]"><I className="h-3.5 w-3.5" /></span>
                      {String(text)}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="clinical-card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbfdfc] text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a9b9f]">
                  <tr>
                    <th className="px-5 py-3">Capability</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeeb]">
                  {status.map(([capability, state]) => (
                    <tr key={capability}>
                      <td className="px-5 py-3 text-[#4f6a70]">{capability}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] ${state.startsWith('Working') ? 'bg-[#e9f6ef] text-[#23845d]' : state.startsWith('Prototype') ? 'bg-[#fff2df] text-[#9b6110]' : 'bg-[#eef2f1] text-[#7a8f94]'}`}>
                          {state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[24px] bg-[#15383f] px-6 py-9 text-white sm:px-9 lg:flex lg:items-center lg:justify-between lg:px-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9fd1c9]"><ShieldCheck className="h-4 w-4" /> Disclaimer</div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d5e6e2]">
              DeepSee is an educational prototype. It is not a medical device and has not been validated for clinical use. All outputs must be reviewed by qualified healthcare professionals alongside clinical findings and other diagnostic tests.
            </p>
          </div>
          <Link href="/contact" className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#15383f] transition hover:bg-[#edf5f2] lg:mt-0">
            Support and feedback <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
