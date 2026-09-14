'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import HeatmapViewer from '@/components/ui/HeatmapViewer';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  HelpCircle,
  History,
  Info,
  Loader2,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { PatientVitals } from '@/types';
import {
  HIGH_RISK_THRESHOLD,
  type Prediction,
  extractPredictions,
  isNormalLabel,
  normalizeResult,
  summarizeVitals,
} from '@/utils/predictions';
import {
  type ClinicianDecision,
  type DecisionStatus,
  decisionLabel,
  getCase,
  makeThumbnail,
  newCaseId,
  saveCase,
  shortCaseId,
  updateCaseDecision,
} from '@/utils/caseHistory';
import { isDemoMode } from '@/lib/config';

const decisionOptions: { status: DecisionStatus; label: string; hint: string; icon: typeof CheckCircle2 }[] = [
  { status: 'accepted', label: 'Accept suggestion', hint: 'Consistent with my read of the case', icon: CheckCircle2 },
  { status: 'rejected', label: 'Reject suggestion', hint: 'Not supported by image or context', icon: XCircle },
  { status: 'indeterminate', label: 'Indeterminate', hint: 'Needs further testing or review', icon: HelpCircle },
];

export default function ResultPage() {
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [patientVitals, setPatientVitals] = useState<PatientVitals | null>(null);
  const [caseId, setCaseId] = useState('');
  const [decision, setDecision] = useState<ClinicianDecision | null>(null);
  const [pendingStatus, setPendingStatus] = useState<DecisionStatus | null>(null);
  const [note, setNote] = useState('');
  const [historyState, setHistoryState] = useState<'pending' | 'saved' | 'unavailable'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem('xrayResult');
      const storedImageUrl = sessionStorage.getItem('originalImageUrl');
      const storedVitals = sessionStorage.getItem('patientVitals');
      if (!storedResult || !storedImageUrl) throw new Error('No analysis results found');

      const parsed = JSON.parse(storedResult);
      const data = parsed.data ? parsed.data : parsed;
      const vitals = storedVitals ? (JSON.parse(storedVitals) as PatientVitals) : null;

      let id = sessionStorage.getItem('caseId') || '';
      if (!id) {
        id = newCaseId();
        sessionStorage.setItem('caseId', id);
      }

      setResult(normalizeResult(data));
      setOriginalImageUrl(storedImageUrl);
      setPatientVitals(vitals);
      setCaseId(id);

      const existing = getCase(id);
      if (existing?.decision) {
        setDecision(existing.decision);
        setNote(existing.decision.note || '');
      }
      setHistoryState(existing ? 'saved' : 'pending');
    } catch (error) {
      console.error('Failed to load results:', error);
      router.push('/analyze');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const predictions = useMemo(() => extractPredictions(result), [result]);
  const topPrediction: Prediction = predictions[0] || { label: 'Indeterminate', confidence: 0 };
  const highRiskCondition = predictions.find(
    (prediction) => ['covid-19', 'pneumonia'].includes(prediction.label.toLowerCase()) && prediction.confidence >= HIGH_RISK_THRESHOLD
  );

  // Persist the case to local history once we have everything needed to reopen it.
  useEffect(() => {
    if (!result || !caseId || !originalImageUrl || historyState !== 'pending') return;
    let cancelled = false;
    makeThumbnail(originalImageUrl)
      .catch(() => '')
      .then((thumbnail) => {
        if (cancelled) return;
        const ok = saveCase({
          id: caseId,
          createdAt: new Date().toISOString(),
          topLabel: topPrediction.label,
          topConfidence: topPrediction.confidence,
          predictions,
          vitals: patientVitals,
          thumbnail: thumbnail || '/placeholder-xray.png',
          result,
        });
        setHistoryState(ok ? 'saved' : 'unavailable');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, caseId, originalImageUrl, historyState]);

  const recordDecision = (status: DecisionStatus) => {
    const entry: ClinicianDecision = { status, note: note.trim() || undefined, recordedAt: new Date().toISOString() };
    setDecision(entry);
    setPendingStatus(null);
    if (caseId) updateCaseDecision(caseId, entry);
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    try {
      setIsDownloading(true);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const now = new Date();

      doc.setFontSize(22);
      doc.setTextColor(21, 56, 63);
      doc.text('DeepSee Clinical Review', 20, 20);
      doc.setDrawColor(13, 118, 110);
      doc.setLineWidth(0.5);
      doc.line(20, 26, 190, 26);
      doc.setFontSize(10);
      doc.setTextColor(104, 128, 135);
      doc.text(`Case ${shortCaseId(caseId)} · Generated locally ${now.toLocaleString()} · ${isDemoMode() ? 'Demo mode (mock model)' : 'Local inference service'}`, 20, 34);

      const imageElement = document.getElementById('xray-image');
      if (imageElement) {
        const canvas = await html2canvas(imageElement, { scale: 2, logging: false, useCORS: true });
        doc.addImage(canvas.toDataURL('image/jpeg', 0.86), 'JPEG', 20, 44, 78, 78);
      }

      doc.setFontSize(11);
      doc.setTextColor(100, 125, 131);
      doc.text('Ranked differential (model confidence)', 110, 48);
      let y = 59;
      predictions.slice(0, 5).forEach((prediction, index) => {
        doc.setFontSize(index === 0 ? 14 : 11);
        doc.setTextColor(index === 0 ? 13 : 70, index === 0 ? 118 : 92, index === 0 ? 110 : 99);
        doc.text(`${index + 1}. ${prediction.label} — ${Math.round(prediction.confidence * 100)}%`, 110, y);
        y += 11;
      });

      doc.setFontSize(14);
      doc.setTextColor(21, 56, 63);
      doc.text('Clinical context', 20, 138);
      doc.setFontSize(10.5);
      doc.setTextColor(84, 108, 114);
      const context = patientVitals ? summarizeVitals(patientVitals) : 'Patient context was not recorded.';
      doc.text(doc.splitTextToSize(context, 168), 20, 146);

      doc.setFontSize(14);
      doc.setTextColor(21, 56, 63);
      doc.text('Model note', 20, 166);
      doc.setFontSize(10.5);
      doc.setTextColor(84, 108, 114);
      const summary = result.diagnosisWithVitals || `Top model suggestion: ${topPrediction.label}. Correlate with patient presentation and clinician interpretation.`;
      doc.text(doc.splitTextToSize(summary, 168), 20, 174);

      doc.setFontSize(14);
      doc.setTextColor(21, 56, 63);
      doc.text('Clinician decision', 20, 208);
      doc.setFontSize(10.5);
      doc.setTextColor(84, 108, 114);
      const decisionText = decision
        ? `${decisionLabel(decision.status)} (${new Date(decision.recordedAt).toLocaleString()})${decision.note ? `. Note: ${decision.note}` : ''}`
        : 'No decision recorded at export time.';
      doc.text(doc.splitTextToSize(decisionText, 168), 20, 216);

      doc.setFontSize(9);
      doc.setTextColor(130, 145, 149);
      doc.text(doc.splitTextToSize('Decision support only. This report does not constitute an autonomous diagnosis or treatment order. The clinician remains responsible for interpretation, diagnosis, orders, and treatment decisions.', 170), 20, 268);
      doc.save(`deepsee-review-${shortCaseId(caseId).toLowerCase()}-${now.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate the report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f3f0] text-[#0d766e]"><Loader2 className="h-5 w-5 animate-spin" /></span>
            <p className="mt-3 text-sm font-bold text-[#607b81]">Preparing clinical review…</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!result) return null;

  const isNormal = isNormalLabel(topPrediction.label);
  const status = isNormal ? 'No major abnormality suggested' : `${topPrediction.label} is the leading model suggestion`;

  return (
    <ProtectedRoute>
      <div className="border-b border-[#dbe7e3] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/analyze" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7e4e1] text-[#607a80] hover:bg-[#f4f8f7]" aria-label="Back to new analysis"><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#819499]"><ScanLine className="h-3.5 w-3.5 text-[#0d766e]" /> Clinical review complete · Case {shortCaseId(caseId)}</div>
              <h1 className="mt-0.5 text-xl font-extrabold tracking-[-0.025em] text-[#17383f]">Case interpretation</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe3df] bg-[#f7faf9] px-3 py-1.5 text-xs font-bold text-[#58737a]"><LockKeyhole className="h-3.5 w-3.5 text-[#0d766e]" /> {isDemoMode() ? 'Mock model · in browser' : 'Processed locally'}</span>
            <Link href="/cases" className="inline-flex items-center gap-2 rounded-xl border border-[#d2e1de] bg-white px-4 py-2.5 text-sm font-bold text-[#526f75] hover:bg-[#f8fbfa]"><History className="h-4 w-4" /> Recent reviews</Link>
            <Link href="/analyze" className="inline-flex items-center gap-2 rounded-xl border border-[#d2e1de] bg-white px-4 py-2.5 text-sm font-bold text-[#526f75] hover:bg-[#f8fbfa]">New review</Link>
            <button onClick={handleDownloadReport} disabled={isDownloading} className="inline-flex items-center gap-2 rounded-xl bg-[#0d766e] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#075e58] disabled:opacity-60">
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isDownloading ? 'Generating…' : 'Export report'}
            </button>
          </div>
        </div>
      </div>

      <div id="report-container" className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        {highRiskCondition && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#efd0ad] bg-[#fff8ee] px-4 py-3.5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b36a19]" />
            <div>
              <p className="text-sm font-extrabold text-[#80501a]">Priority review suggested</p>
              <p className="mt-1 text-xs leading-5 text-[#9b6f3c]">{highRiskCondition.label} has a model confidence of {Math.round(highRiskCondition.confidence * 100)}%. Review the image and clinical context before deciding next steps.</p>
            </div>
          </div>
        )}

        <section className="clinical-card mb-6 overflow-hidden">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-[#e0eae7] p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isNormal ? 'bg-[#e9f6ef] text-[#23845d]' : 'bg-[#fff2df] text-[#aa6a18]'}`}>
                  {isNormal ? <CheckCircle2 className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#87999d]">Clinical summary</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.035em] text-[#23464d]">{status}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d8489]">{result.diagnosisWithVitals || 'Use the ranked differential as a prompt for clinical review. Model probability is not equivalent to a confirmed diagnosis.'}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#e1ebe8] sm:grid-cols-4 lg:grid-cols-2">
              <SummaryMetric label="Top confidence" value={`${Math.round(topPrediction.confidence * 100)}%`} detail={topPrediction.label} />
              <SummaryMetric label="Differentials" value={`${predictions.length}`} detail="ranked suggestions" />
              <SummaryMetric label="Processing" value="Local" detail={isDemoMode() ? 'mock model, no network' : 'no cloud AI call'} />
              <SummaryMetric label="Decision" value={decision ? decision.status.charAt(0).toUpperCase() + decision.status.slice(1) : 'Pending'} detail="clinician controlled" />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.04fr)_minmax(380px,0.96fr)]">
          <div className="space-y-6">
            <section className="clinical-card overflow-hidden">
              <SectionHeader icon={ScanLine} title="Imaging review" eyebrow="Visual evidence" trailing="Overlay can be toggled" />
              <div className="p-4 sm:p-5">
                <div id="xray-image" className="overflow-hidden rounded-2xl bg-[#0c2227] p-2">
                  <HeatmapViewer originalImageUrl={originalImageUrl} predictionResult={result} className="aspect-square w-full rounded-xl bg-[#07191d]" />
                </div>
                <div className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-[#7f9297]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> The overlay is an interpretability aid generated from model output. It is not a localisation or diagnostic result.</div>
              </div>
            </section>

            <section className="clinical-card overflow-hidden">
              <SectionHeader icon={BookOpenCheck} title="Evidence trail" eyebrow="Explainability" trailing="Prototype layer" />
              <div className="divide-y divide-[#e5eeeb]">
                <EvidenceRow icon={ScanLine} title="Imaging model output" body={describeImageModel(result, topPrediction)} tag="Model" />
                <EvidenceRow icon={Stethoscope} title="Patient context" body={patientVitals ? summarizeVitals(patientVitals) : 'Patient vitals were included in the submitted case context.'} tag="Clinical input" />
                <EvidenceRow icon={Sparkles} title="Rule-based refinement" body="Vitals and symptoms update prior probabilities for pneumonia and COVID-19 through explicit Bayesian likelihoods (fever, cough, headache, loss of smell, heart rate, blood pressure, age, sex)." tag="Knowledge base" />
                <EvidenceRow icon={FileText} title="Biomedical references" body="The product architecture includes an ontology-linked evidence retrieval layer. This prototype does not yet return source citations in its result payload." tag="Not connected" muted />
              </div>
            </section>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <section className="clinical-card overflow-hidden">
              <SectionHeader icon={Sparkles} title="Ranked differential" eyebrow="Decision support" trailing={`${predictions.length} possibilities`} />
              <div className="p-5 sm:p-6">
                {predictions.length ? (
                  <div className="space-y-4">
                    {predictions.slice(0, 6).map((prediction, index) => (
                      <div key={`${prediction.label}-${index}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${index === 0 ? 'bg-[#e7f3f0] text-[#0d766e]' : 'bg-[#f1f5f4] text-[#758b90]'}`}>{index + 1}</span>
                            <div className="min-w-0">
                              <p className={`truncate text-sm font-extrabold ${index === 0 ? 'text-[#244a50]' : 'text-[#506a70]'}`}>{prediction.label}</p>
                              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#93a2a5]">Model confidence</p>
                            </div>
                          </div>
                          <span className={`text-sm font-black ${index === 0 ? 'text-[#0d766e]' : 'text-[#647c82]'}`}>{Math.round(prediction.confidence * 100)}%</span>
                        </div>
                        <div className="ml-11 mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf2f1]">
                          <div className={`h-full rounded-full ${index === 0 ? 'bg-[#0d766e]' : 'bg-[#8fb1aa]'}`} style={{ width: `${Math.min(100, Math.round(prediction.confidence * 100))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#71878c]">No ranked predictions were returned.</p>
                )}
                <div className="mt-5 rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] p-3.5 text-[11px] leading-5 text-[#72888d]">Confidence scores indicate model certainty within this prototype and should not be interpreted as disease prevalence or a confirmed probability of diagnosis.</div>
              </div>
            </section>

            <section className="clinical-card overflow-hidden">
              <SectionHeader icon={ClipboardCheck} title="Clinician decision" eyebrow="Human in the loop" trailing={historyState === 'saved' ? 'Saved locally' : historyState === 'unavailable' ? 'Not saved' : 'Saving…'} />
              <div className="p-5 sm:p-6">
                {decision && !pendingStatus ? (
                  <div>
                    <div className={`flex items-start gap-3 rounded-xl border p-4 ${decision.status === 'accepted' ? 'border-[#cfe4da] bg-[#eff8f3]' : decision.status === 'rejected' ? 'border-[#efc6c4] bg-[#fff5f4]' : 'border-[#efd0ad] bg-[#fff8ee]'}`}>
                      {decision.status === 'accepted' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#23845d]" /> : decision.status === 'rejected' ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#a1443f]" /> : <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b36a19]" />}
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[#25474e]">{decisionLabel(decision.status)}</p>
                        <p className="mt-0.5 text-[11px] text-[#7f9297]">Recorded {new Date(decision.recordedAt).toLocaleString()} for the leading suggestion &ldquo;{topPrediction.label}&rdquo;.</p>
                        {decision.note && <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#4f6a70]">{decision.note}</p>}
                      </div>
                    </div>
                    <button onClick={() => setPendingStatus(decision.status)} className="mt-3 text-xs font-extrabold text-[#0d766e] hover:underline">Change decision</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs leading-5 text-[#6d8489]">Record how you are treating the leading suggestion. The decision is stored on this workstation and included in the exported report.</p>
                    <div className="mt-4 grid gap-2">
                      {decisionOptions.map(({ status: optionStatus, label, hint, icon: Icon }) => {
                        const active = pendingStatus === optionStatus;
                        return (
                          <button
                            key={optionStatus}
                            onClick={() => setPendingStatus(optionStatus)}
                            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${active ? 'border-[#0d766e] bg-[#edf6f4]' : 'border-[#dbe7e3] bg-white hover:border-[#a9c8c2]'}`}
                            aria-pressed={active}
                          >
                            <Icon className={`h-4 w-4 shrink-0 ${optionStatus === 'accepted' ? 'text-[#23845d]' : optionStatus === 'rejected' ? 'text-[#a1443f]' : 'text-[#b36a19]'}`} />
                            <span>
                              <span className="block text-sm font-extrabold text-[#25474e]">{label}</span>
                              <span className="block text-[11px] text-[#7f9297]">{hint}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <label htmlFor="decision-note" className="mt-4 block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8b9da1]">Note (optional, no identifiers)</label>
                    <textarea id="decision-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="clinical-input mt-1.5 text-sm" placeholder="e.g. Ordered CT; will reassess after labs." />
                    <button
                      onClick={() => pendingStatus && recordDecision(pendingStatus)}
                      disabled={!pendingStatus}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d766e] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#a7b9b5]"
                    >
                      <ClipboardCheck className="h-4 w-4" /> Record decision
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="clinical-card overflow-hidden">
              <SectionHeader icon={Stethoscope} title="Clinical next-step prompts" eyebrow="For clinician review" />
              <div className="p-5 sm:p-6">
                <div className="space-y-3">
                  {getReviewPrompts(result, topPrediction).map((prompt, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-[#e0eae7] bg-[#fbfdfc] p-3.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6f2ef] text-[10px] font-black text-[#0d766e]">{index + 1}</span>
                      <p className="text-xs leading-5 text-[#58737a]">{prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-[#d5e4e0] bg-[#edf5f2] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0d766e]" />
                <div>
                  <p className="text-xs font-extrabold text-[#31555b]">Human-in-the-loop safeguard</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#6e858a]">DeepSee is an assistive system. The clinician remains responsible for interpretation, diagnosis, orders, and treatment decisions.</p>
                  <Link href="/about" className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0d766e]">System boundaries <ChevronRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function describeImageModel(result: Record<string, any>, topPrediction: Prediction) {
  const imageModel = result.imageModel;
  if (imageModel && typeof imageModel === 'object' && imageModel.label) {
    const confidence = Math.round(Number(imageModel.confidence || 0) * 100);
    return `The chest X-ray classifier returned "${imageModel.label}" at ${confidence}% confidence. Combined with patient context, ${topPrediction.label} ranks highest at ${Math.round(topPrediction.confidence * 100)}%.`;
  }
  return `The image model ranked ${topPrediction.label} highest at ${Math.round(topPrediction.confidence * 100)}% confidence.`;
}

function SummaryMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="bg-[#f9fcfb] px-5 py-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8b9da1]">{label}</p>
      <p className="mt-1 text-xl font-black tracking-[-0.025em] text-[#31545b]">{value}</p>
      <p className="mt-0.5 text-[10px] text-[#83969a]">{detail}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, eyebrow, trailing }: { icon: any; title: string; eyebrow: string; trailing?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e2ebe8] bg-[#fbfdfc] px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f3f0] text-[#0d766e]"><Icon className="h-4 w-4" /></span>
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#8c9da1]">{eyebrow}</p>
          <h2 className="mt-0.5 text-sm font-extrabold text-[#2f5158]">{title}</h2>
        </div>
      </div>
      {trailing && <span className="text-[10px] font-bold text-[#8a9b9f]">{trailing}</span>}
    </div>
  );
}

function EvidenceRow({ icon: Icon, title, body, tag, muted = false }: { icon: any; title: string; body: string; tag: string; muted?: boolean }) {
  return (
    <div className={`flex gap-3 px-5 py-4 sm:px-6 ${muted ? 'bg-[#fbfcfc]' : 'bg-white'}`}>
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${muted ? 'bg-[#f0f3f2] text-[#8a9b9f]' : 'bg-[#edf6f4] text-[#0d766e]'}`}><Icon className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-xs font-extrabold ${muted ? 'text-[#667d82]' : 'text-[#35575e]'}`}>{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.06em] ${muted ? 'bg-[#eef1f0] text-[#8b9b9e]' : 'bg-[#e9f5f2] text-[#34796d]'}`}>{tag}</span>
        </div>
        <p className="mt-1 text-[11px] leading-5 text-[#74898e]">{body}</p>
      </div>
    </div>
  );
}

function getReviewPrompts(result: Record<string, any>, topPrediction: Prediction) {
  if (Array.isArray(result.treatmentSuggestions) && result.treatmentSuggestions.length) {
    return result.treatmentSuggestions.slice(0, 4).map((item: unknown) => String(item));
  }
  if (isNormalLabel(topPrediction.label)) {
    return [
      'Confirm that the image quality and projection are adequate for interpretation.',
      'Correlate the model output with symptoms, examination, and available laboratory data.',
      'Escalate or obtain additional imaging if the clinical picture remains discordant.',
    ];
  }
  return [
    `Review image regions associated with the leading ${topPrediction.label} suggestion.`,
    'Compare the ranked differential with symptoms, vital signs, examination, and available laboratory findings.',
    'Use confirmatory testing or specialist review according to institutional protocol when clinically indicated.',
    'Record whether the model suggestion was accepted, rejected, or remained indeterminate.',
  ];
}
