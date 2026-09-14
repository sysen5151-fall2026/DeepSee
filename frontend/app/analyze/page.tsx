'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ImageUploader from '@/components/ui/ImageUploader';
import PatientVitalsForm from '@/components/ui/PatientVitalsForm';
import { XRayImage, PatientVitals } from '@/types';
import { analyzeXray } from '@/utils/predictionService';
import { newCaseId } from '@/utils/caseHistory';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  Image as ImageIcon,
  Info,
  Loader2,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Imaging', detail: 'Chest X-ray', icon: ImageIcon },
  { id: 2, label: 'Patient context', detail: 'Vitals & symptoms', icon: Stethoscope },
  { id: 3, label: 'Clinical review', detail: 'Confirm inputs', icon: FileCheck2 },
];

export default function AnalyzePage() {
  const [image, setImage] = useState<XRayImage | null>(null);
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepComplete, setStepComplete] = useState<Record<number, boolean>>({ 1: false, 2: false });
  const router = useRouter();

  const handleImageSelect = (uploadedImage: XRayImage | null) => {
    setImage(uploadedImage);
    setError(null);
    setStepComplete((prev) => ({ ...prev, 1: !!uploadedImage }));
  };

  const handleVitalsSubmit = (patientVitals: PatientVitals) => {
    setVitals(patientVitals);
    setError(null);
    setStepComplete((prev) => ({ ...prev, 2: true }));
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || (step === currentStep + 1 && stepComplete[currentStep])) setCurrentStep(step);
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Add a chest X-ray before continuing.');
      setCurrentStep(1);
      return;
    }
    if (!vitals) {
      setError('Save the patient context before running analysis.');
      setCurrentStep(2);
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeXray(image.file, vitals);
      sessionStorage.setItem('caseId', newCaseId());
      sessionStorage.setItem('xrayResult', JSON.stringify(result));
      sessionStorage.setItem('originalImageUrl', image.preview);
      sessionStorage.setItem('patientVitals', JSON.stringify(vitals));
      router.push('/result');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('The local analysis could not be completed. Check the model service and try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0d766e]">
              <ScanLine className="h-4 w-4" /> New case · Local session
            </div>
            <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-[#17383f] sm:text-4xl">Clinical review workspace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#70858a]">Bring the image and patient context together before running the decision-support model. Nothing is sent to a public AI service.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#cfe3df] bg-white px-3 py-1.5 text-xs font-bold text-[#526f75] shadow-sm">
            <LockKeyhole className="h-3.5 w-3.5 text-[#0d766e]" />
            PHI remains on this workstation
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#35a977]" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[18px] border border-[#dbe7e3] bg-white p-4 shadow-[0_10px_30px_rgba(32,69,76,0.045)] lg:sticky lg:top-24">
            <p className="px-2 pb-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#89999d]">Review progress</p>
            <div className="space-y-1.5">
              {steps.map(({ id, label, detail, icon: Icon }) => {
                const complete = !!stepComplete[id] || currentStep > id;
                const active = currentStep === id;
                const available = id <= currentStep || (id === currentStep + 1 && stepComplete[currentStep]);
                return (
                  <button
                    key={id}
                    onClick={() => goToStep(id)}
                    disabled={!available}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active ? 'bg-[#edf6f4]' : available ? 'hover:bg-[#f6f9f8]' : 'cursor-not-allowed opacity-55'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${active ? 'border-[#bcdad4] bg-white text-[#0d766e]' : complete ? 'border-[#cde5dc] bg-[#ebf7f1] text-[#23845d]' : 'border-[#dde7e4] bg-[#f8faf9] text-[#8ca0a4]'}`}>
                      {complete && !active ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span>
                      <span className={`block text-sm font-extrabold ${active ? 'text-[#174249]' : 'text-[#46646a]'}`}>{label}</span>
                      <span className="mt-0.5 block text-[11px] text-[#8b9da1]">{detail}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-[#dce8e5] bg-[#f8fbfa] p-3.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#416168]"><ShieldCheck className="h-4 w-4 text-[#0d766e]" /> Clinician control</div>
              <p className="mt-2 text-[11px] leading-5 text-[#7b9095]">DeepSee provides suggestions for review. It does not independently diagnose, prescribe, or initiate treatment.</p>
            </div>
          </aside>

          <section className="clinical-card overflow-hidden">
            <div className="border-b border-[#e2ebe8] bg-[#fbfdfc] px-5 py-4 sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#82969a]">Step {currentStep} of 3</p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-[#25474e]">
                    {currentStep === 1 && 'Add diagnostic imaging'}
                    {currentStep === 2 && 'Add patient context'}
                    {currentStep === 3 && 'Review before analysis'}
                  </h2>
                </div>
                <span className="hidden rounded-lg bg-[#edf4f2] px-2.5 py-1 text-[10px] font-bold text-[#678087] sm:block">Unsaved draft · stays on this workstation</span>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {currentStep === 1 && (
                <div className="animate-fadeIn">
                  <div className="mb-5 max-w-2xl">
                    <p className="text-sm leading-6 text-[#688087]">Upload a frontal chest X-ray. The image stays inside the local clinical workflow and will be paired with the patient context in the next step.</p>
                  </div>
                  <ImageUploader onImageSelect={handleImageSelect} maxSizeMB={15} />

                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] p-3.5 text-xs leading-5 text-[#6c8388]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0d766e]" />
                    Use a properly exposed PA/AP image when possible. Remove screenshots that include unnecessary identifying information.
                  </div>

                  <div className="mt-7 flex justify-end">
                    <button onClick={() => goToStep(2)} disabled={!stepComplete[1]} className="inline-flex items-center gap-2 rounded-xl bg-[#0d766e] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#a7b9b5]">
                      Continue to patient context <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fadeIn">
                  <p className="mb-6 max-w-2xl text-sm leading-6 text-[#688087]">Enter the clinical context available at the time of triage. This prototype combines the image with vital signs and reported symptoms.</p>
                  <PatientVitalsForm onSubmit={handleVitalsSubmit} isSubmitting={isAnalyzing} />
                  {vitals && (
                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#cfe4da] bg-[#eff8f3] px-4 py-3 text-xs font-bold text-[#287557]">
                      <CheckCircle2 className="h-4 w-4" /> Patient context saved. You can continue to review.
                    </div>
                  )}
                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button onClick={() => setCurrentStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-[#d2e1de] bg-white px-4 py-2.5 text-sm font-bold text-[#536e74] hover:bg-[#f8fbfa]"><ArrowLeft className="h-4 w-4" /> Back</button>
                    <button onClick={() => goToStep(3)} disabled={!stepComplete[2]} className="inline-flex items-center gap-2 rounded-xl bg-[#0d766e] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#a7b9b5]">Review case <ArrowRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fadeIn">
                  <div className="grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
                    <div className="overflow-hidden rounded-2xl border border-[#d6e3e0] bg-[#10282d] p-2">
                      {image ? (
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#07191d]">
                          <img src={image.preview} alt="Uploaded chest X-ray" className="h-full w-full object-contain" />
                          <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">Input image</span>
                        </div>
                      ) : (
                        <div className="flex aspect-square items-center justify-center text-sm text-white/60">No image</div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-[#dbe7e3] p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-[#2e5158]">Patient context</h3>
                          <button onClick={() => setCurrentStep(2)} className="text-xs font-bold text-[#0d766e] hover:underline">Edit</button>
                        </div>
                        {vitals ? (
                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <Metric label="Temperature" value={`${vitals.temperature} °C`} />
                            <Metric label="Heart rate" value={`${vitals.heartRate} bpm`} />
                            <Metric label="Blood pressure" value={`${vitals.systolicBP}/${vitals.diastolicBP}`} />
                            <Metric label="Age" value={vitals.birthdate ? `${calculateAge(vitals.birthdate)} yr` : '—'} />
                            <Metric label="Sex" value={vitals.gender ? vitals.gender.charAt(0).toUpperCase() + vitals.gender.slice(1) : '—'} />
                            <Metric label="Symptoms" value={[
                              vitals.hasCough ? 'Cough' : null,
                              vitals.hasHeadaches ? 'Headache' : null,
                              !vitals.canSmellTaste ? 'Smell/taste loss' : null,
                            ].filter(Boolean).join(', ') || 'None'} />
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-2xl border border-[#dbe7e3] bg-[#fbfdfc] p-5">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f3f0] text-[#0d766e]"><LockKeyhole className="h-4 w-4" /></span>
                          <div>
                            <h3 className="text-sm font-extrabold text-[#31535a]">Ready for local inference</h3>
                            <p className="mt-1 text-xs leading-5 text-[#73898e]">The model will analyze this case locally. Results are decision support and must be interpreted in clinical context.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && <div className="mt-5 rounded-xl border border-[#efc6c4] bg-[#fff5f4] px-4 py-3 text-sm font-medium text-[#a1443f]">{error}</div>}

                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button onClick={() => setCurrentStep(2)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d2e1de] bg-white px-4 py-2.5 text-sm font-bold text-[#536e74] hover:bg-[#f8fbfa]"><ArrowLeft className="h-4 w-4" /> Back</button>
                    <button onClick={handleAnalyze} disabled={isAnalyzing || !image || !vitals} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d766e] px-6 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(13,118,110,0.16)] transition hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#9fb4af]">
                      {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Running local analysis…</> : <><ScanLine className="h-4 w-4" /> Run clinical analysis</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f4f8f7] px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a9b9f]">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-[#36575e]" title={value}>{value}</p>
    </div>
  );
}

function calculateAge(birthdate: string): number {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}
