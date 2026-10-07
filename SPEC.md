# SPEC.md: DeepSee

This file is the product side of the DeepSee model. It restates the stakeholder needs and
stakeholder requirements held in the team's Innoslate model and links each requirement to the
part of this repository that is meant to satisfy it. **The model is the specification.** If a
requirement changes, change it in Innoslate first, then update this file to match.

**Source in the model**

| Innoslate document or diagram | Contents used here |
| --- | --- |
| DeepSee User Needs Document | Root N0, primitive needs PN1 to PN4, effective needs N1 to N17 |
| DeepSee Stakeholder Requirements | Groups G0 to G4, requirements SR1 to SR18 (statement, rationale, category) |
| Trace links | 18 "traced from" links (SR to N) and 18 "satisfied by" links (SR to function, asset or document) |
| Clinical workflow Action Diagram | F.0 to F.6 and the access and analysis unavailable decisions |
| Use case UC.1 | "Clinician Reviews a Chest X-ray Case" |

Requirement statements, measures of effectiveness (MOEs) and validation criteria below are copied
from the model as recorded in the team report, *Stakeholder Needs and Requirements Definition*,
Sections 2.5 to 2.8. They have not been reworded. Numeric targets (60 seconds, 90% sensitivity
and specificity, 10% relative reduction, 80% adoption, benefit to cost ratio of 1.0) are proposed
course project assumptions pending stakeholder confirmation, not demonstrated performance.

Filled ahead of Chapter 3 to establish model to product linkage for Milestone 1. The Data Contract
and Model Response Contract sections describe the interface as implemented today and list the
constraints the requirements place on it; Chapter 3 will revise both.

---

## Needs and Acceptance Criteria

### Stakeholder needs (N1 to N17)

| ID | Effective need | Primitive need | CTQ |
| --- | --- | --- | --- |
| N1 | The clinician needs DeepSee to show why it produced each result. | PN1 Clinician / Radiologist | Explainability |
| N2 | The clinician needs DeepSee to return results without slowing the clinical workflow. | PN1 | Workflow fit |
| N3 | The clinician needs DeepSee's results to be accurate enough to trust. | PN1 | Accuracy |
| N4 | The clinician needs to keep the final clinical decision. | PN1 | Human control |
| N5 | The clinician needs the image and relevant patient information shown together. | PN1 | Workflow fit |
| N6 | Hospital leadership needs evidence that DeepSee improves quality of care. | PN2 Hospital Leadership | Clinical value and adoption |
| N7 | Hospital leadership needs clinicians to adopt DeepSee in their daily work. | PN2 | Clinical value and adoption |
| N8 | Hospital leadership needs DeepSee's implementation cost to be justified by its benefit. | PN2 | Cost |
| N9 | Hospital leadership needs performance data to decide whether to continue or expand DeepSee. | PN2 | Clinical value and adoption |
| N10 | Hospital IT needs patient data to stay inside the hospital network. | PN3 Hospital IT | Security and privacy |
| N11 | Hospital IT needs access to DeepSee limited to authorized users. | PN3 | Security and privacy |
| N12 | Hospital IT needs DeepSee to behave predictably when its service is unavailable. | PN3 | Reliability and maintainability |
| N13 | Hospital IT needs clear technical documentation to maintain and update DeepSee. | PN3 | Reliability and maintainability |
| N14 | The compliance office needs to know what patient data DeepSee stores and how it is used. | PN4 Privacy and Compliance | Security and privacy |
| N15 | The compliance office needs responsibility for the final decision to rest clearly with the clinician. | PN4 | Human control |
| N16 | The compliance office needs DeepSee's limitations to be documented. | PN4 | Transparency |
| N17 | The compliance office needs a record of how DeepSee is used. | PN4 | Transparency |

### Stakeholder requirements (SR1 to SR18)

Each requirement traces from one need; N3 is the only need that produces two (SR3 and SR4).
"Satisfied by" is the allocation in the model, not evidence that the requirement is met.

**G1 Clinical requirements**

| ID | Name | Traced from | Requirement statement | Satisfied by (model) |
| --- | --- | --- | --- | --- |
| SR1 | Explanation of Results | N1 | DeepSee shall provide a clinician-accessible explanation of the basis for each chest X-ray analysis result. | F.4 Present Explainable Clinical Results |
| SR2 | Analysis Response Time | N2 | DeepSee shall display the analysis result within 60 seconds after accepting a supported chest X-ray image for at least 95% of requests when processing one request at a time. | F.3 Perform Clinical Analysis |
| SR3 | Detection Sensitivity | N3 | DeepSee shall achieve a sensitivity of at least 90% for each supported target finding on an independent chest X-ray test dataset with reference labels established by radiologists. | F.3 Perform Clinical Analysis |
| SR4 | Detection Specificity | N3 | DeepSee shall achieve a specificity of at least 90% for each supported target finding on the same independent chest X-ray test dataset and at the same decision thresholds used to evaluate SR3. | F.3 Perform Clinical Analysis |
| SR5 | Clinician Control of Final Decisions | N4 | DeepSee shall require explicit approval by an authorized clinician before any system-generated finding is finalized as a clinical interpretation. | F.5 Record Clinician Decision |
| SR6 | Integrated Clinical Review | N5 | DeepSee shall display the chest X-ray image, its analysis result, and the associated patient identifier and clinical indication together in a single review view. | F.4 Present Explainable Clinical Results |

**G2 Hospital leadership requirements**

| ID | Name | Traced from | Requirement statement | Satisfied by (model) |
| --- | --- | --- | --- | --- |
| SR7 | Clinical Review Effectiveness | N6 | DeepSee shall enable clinicians to achieve at least a 10% relative reduction in the missed-finding rate compared with unaided review in a controlled reader study using chest X-ray cases with radiologist-established reference labels. | F.0 Provide DeepSee Clinical Decision Support |
| SR8 | Clinical Adoption | N7 | DeepSee shall be used by participating clinicians to review at least 80% of eligible chest X-ray examinations during the fourth week of a clinical workflow pilot. | F.0 Provide DeepSee Clinical Decision Support |
| SR9 | Economic Feasibility | N8 | The proposed DeepSee deployment shall have a projected benefit-to-cost ratio of at least 1.0 over a three-year evaluation period using a hospital-approved economic assessment method. | DeepSee Clinical Decision Support System (asset) |
| SR10 | Operational Performance Reporting | N9 | DeepSee shall provide authorized hospital leadership users with an aggregate performance report for a selected date range that includes examination count, clinician review rate, analysis response-time distribution, and analysis failure rate. | Generate Operational Performance Report |

**G3 Hospital IT and cybersecurity requirements**

| ID | Name | Traced from | Requirement statement | Satisfied by (model) |
| --- | --- | --- | --- | --- |
| SR11 | Patient Data Containment | N10 | DeepSee shall keep all patient data that it processes or stores within the hospital-controlled network boundary. | DeepSee Clinical Decision Support System (asset) |
| SR12 | Authorized Access | N11 | DeepSee shall grant access to patient data and system functions only to authenticated users with permissions defined in the hospital-approved access-control matrix. | F.0.1 Authenticate Users and Enforce Access Permissions |
| SR13 | Analysis Unavailability Notification | N12 | When an analysis request fails or exceeds 60 seconds without a result, DeepSee shall display a status message indicating that no analysis result is available and directing the clinician to continue the established review workflow without DeepSee assistance. | F.0.4 Notify Clinician of Analysis Unavailability |
| SR14 | Technical Maintenance Documentation | N13 | Each DeepSee release shall include version-matched technical documentation covering installation, configuration, system dependencies, troubleshooting, backup and recovery, and update and rollback procedures. | DeepSee Technical Maintenance Documentation (artifact) |

**G4 Privacy, compliance and risk requirements**

| ID | Name | Traced from | Requirement statement | Satisfied by (model) |
| --- | --- | --- | --- | --- |
| SR15 | Patient Data Handling Documentation | N14 | Each DeepSee release shall include a version-matched data-handling specification identifying each patient data category collected, its purpose of use, storage location, authorized access roles, retention period, and deletion procedure. | DeepSee Patient Data Handling Specification (artifact) |
| SR16 | Clinical Responsibility Notice | N15 | DeepSee shall display a notice in every analysis-result view stating that the result provides decision support and that the clinician remains responsible for the final clinical interpretation. | F.4 Present Explainable Clinical Results |
| SR17 | Intended Use and Limitations | N16 | Each DeepSee release shall include version-matched user documentation specifying its intended use, supported target findings, supported patient population and image types, known failure conditions, and circumstances requiring review without DeepSee assistance. | DeepSee Intended Use and Limitations Documentation (artifact) |
| SR18 | Audit Record of System Use | N17 | DeepSee shall create an audit record for every analysis request, result-viewing event, and clinician approval event, recording the user identifier, timestamp, examination identifier, event type, event outcome, and software and model versions. | F.6 Manage Review Records |

### Acceptance criteria

| ID | Measure of effectiveness | Validation criteria |
| --- | --- | --- |
| SR1 | Explanation coverage and clinician comprehension. These measures capture both presence and usefulness. | Inspect representative result views and conduct a clinician review; every tested result must include an understandable explanation. |
| SR2 | Response-time compliance: the percentage of trials completed within 60 seconds. The measure represents workflow delay. | Run timed single-request tests on the approved dataset; at least 95 percent must meet the 60-second limit. |
| SR3 | Sensitivity: the percentage of reference-positive cases correctly detected. It directly measures missed findings. | Compare blinded system results with approved reference labels using the prespecified analysis method; sensitivity must be at least 90 percent. |
| SR4 | Specificity: the percentage of reference-negative cases correctly rejected. It measures avoidable false alarms. | Use the same approved independent dataset and threshold as SR3; specificity must be at least 90 percent. |
| SR5 | Unauthorized finalization rate, with a target of zero. This is a direct measure of human control. | Execute role-based workflow tests with authorized and unauthorized users; no final interpretation may be recorded without approval. |
| SR6 | Integrated-view completeness: the percentage of test cases showing all required fields. The target is 100 percent. | Inspect the review interface with representative cases; every required field must be visible in the same review view. |
| SR7 | Relative missed-finding reduction compared with unaided review. | Run a controlled reader study using chest X-ray cases with radiologist-established reference labels. Compare the missed-finding rate with unaided clinician review, and verify at least a 10% relative reduction. |
| SR8 | Eligible-clinician pilot adoption: the percentage of eligible chest X-ray examinations reviewed during the fourth week of the clinical workflow pilot. The target is at least 80 percent. | Use pilot logs from the fourth week and the eligible-examination list to calculate the percentage reviewed. The result must be at least 80 percent. |
| SR9 | Three-year benefit-to-cost ratio. It compares measurable benefits with total approved costs. | Complete a hospital-approved cost-benefit model and review the assumptions, inputs, and calculation independently. |
| SR10 | Aggregate performance-report completeness for a selected date range, including examination count, clinician review rate, analysis response-time distribution, and analysis failure rate. | Select a date range and generate the aggregate performance report. Verify that it includes examination count, clinician review rate, response-time distribution, and analysis failure rate. |
| SR11 | External patient-data egress events, with a target of zero. This directly measures the data boundary. | Review data flows and network logs and perform a controlled egress test; no image or identifier may leave the hospital boundary. |
| SR12 | Unauthorized access prevention: the percentage of protected functions and patient-data access attempts correctly denied for users without permissions defined in the hospital-approved access-control matrix. The target is 100 percent. | Test protected functions and patient-data access using authenticated users with authorized and unauthorized roles. Verify that permissions follow the hospital-approved access-control matrix and that unauthorized attempts are denied and logged. |
| SR13 | Failure-notification coverage: the percentage of analysis failures or requests exceeding 60 seconds that display the required status message and direct the clinician to the established review workflow without DeepSee assistance. The target is 100 percent. | Inject analysis failures and response-time timeouts. Verify that the status message states that no analysis result is available and directs the clinician to continue the established review workflow without DeepSee assistance. |
| SR14 | Version-matched release-documentation completeness covering installation, configuration, system dependencies, troubleshooting, backup and recovery, and update and rollback procedures. The target is 100 percent. | Review the version-matched technical documentation against a checklist containing installation, configuration, dependencies, troubleshooting, backup and recovery, and update and rollback procedures. Verify that every required topic is present. |
| SR15 | Version-matched data-handling specification completeness. The specification must identify every patient-data category, purpose of use, storage location, authorized access roles, retention period, and deletion procedure. The target is 100 percent. | Review the version-matched data-handling specification against the approved data-lifecycle checklist. Verify that every data category includes its purpose, storage location, authorized roles, retention period, and deletion procedure. |
| SR16 | Responsibility-notice coverage: the percentage of analysis-result views that display a notice stating that the result provides decision support and that the clinician remains responsible for the final clinical interpretation. The target is 100 percent. | Inspect every analysis-result view and verify that the decision-support notice appears and states that the clinician remains responsible for the final clinical interpretation. |
| SR17 | Intended-use and limitation documentation completeness: the percentage of required topics documented. Required topics include intended use, supported target findings, supported patient population and image types, known failure conditions, and circumstances requiring review without DeepSee assistance. The target is 100 percent. | Review the version-matched user documentation against an approved checklist. Verify that all required intended-use and limitation topics are present and obtain clinical and compliance reviewer approval. |
| SR18 | Audit-record completeness: the percentage of required audit events containing all required fields. Required fields include user identifier, timestamp, examination identifier, event type, event outcome, and software and model versions. The target is 100 percent. | Execute representative analysis-request, result-viewing, clinician-approval, and failure scenarios. Verify that every required event creates an audit record containing all required fields and reconcile the records with the expected event list. |

### Model to product traceability

Where each requirement's satisfying entity lives in this repository today, and how far the code
goes. Status values: **Implemented** (behavior present, formal validation still required),
**Partial** (some of the statement is addressed, gap named), **Not started** (no code or document
yet), **Evaluation** (met only by a study, pilot or assessment, not by code alone). No requirement
is claimed as validated.

| ID | Model entity | Where in the repository | Status | Gap or next step |
| --- | --- | --- | --- | --- |
| SR1 | F.4 | `frontend/app/result/page.tsx` (ranked differential, evidence trail), `frontend/components/ui/HeatmapViewer.tsx`; `demo/` (supporting findings and points against for every item) | Partial | The prototype overlay is drawn in the browser from the confidence score, not from the model; a model-derived explanation is still needed |
| SR2 | F.3 | `backend/core/imaging_service/views.py` (`upload_scan`) | Not started | No timed test; no 60 second limit in client or server |
| SR3 | F.3 | `backend/core/imaging_service/model/` (`cnn-pneumonia-v1`, threshold 0.5) | Evaluation | Supported target findings not yet defined; no independent test set evaluation in the repository |
| SR4 | F.3 | same as SR3 | Evaluation | Same dataset and threshold as SR3 |
| SR5 | F.5 | `frontend/app/result/page.tsx` (clinician decision: accept and other options), `frontend/utils/caseHistory.ts`; `demo/` (mark for review, dismiss) | Partial | Decision is recorded but there is no finalization step and no check that the user is an authorized clinician |
| SR6 | F.4 | `frontend/app/result/page.tsx` (image, result and patient context in one view) | Partial | Patient identifier and clinical indication are not captured by the API or shown |
| SR7 | F.0 | none | Evaluation | Controlled reader study |
| SR8 | F.0 | none | Evaluation | Clinical workflow pilot |
| SR9 | System asset | none | Evaluation | Hospital-approved cost-benefit model |
| SR10 | Generate Operational Performance Report | none | Not started | No aggregate report function |
| SR11 | System asset | `docs/adr/0001-initial-toolchain.md` (local model hosting), `docs/context.md` (no public AI endpoint), local inference in `backend/core/imaging_service/`; `demo/` runs entirely in the browser | Partial | Controlled egress test and network log review not yet done |
| SR12 | F.0.1 | `backend/core/auth_service/` (JWT login), `IsAuthenticated` on `upload_scan`, `frontend/components/ProtectedRoute.tsx` | Partial | No roles or access-control matrix; open self registration (`auth/signup/`) conflicts with a hospital-approved matrix |
| SR13 | F.0.4 | `frontend/app/analyze/page.tsx` (error shown when analysis fails) | Partial | Message asks to retry rather than directing the clinician to continue without DeepSee; no 60 second timeout |
| SR14 | Technical Maintenance Documentation | `README.md`, `backend/README.md`, `frontend/README.md`, `docs/environment.md` | Partial | Installation, configuration and dependencies covered; backup and recovery, update and rollback missing; not version matched |
| SR15 | Patient Data Handling Specification | `docs/context.md` (what crosses the boundary) | Partial | No per category purpose, roles, retention and deletion |
| SR16 | F.4 | `frontend/app/result/page.tsx` (responsibility notice on the result view and in the PDF report); `demo/` (safeguard box and footer) | Implemented | Inspect every result view against the validation criterion |
| SR17 | Intended Use and Limitations Documentation | `frontend/app/about/page.tsx`, `README.md`; `demo/` About screen and README | Partial | Supported target findings, population, image types and failure conditions not yet specified; not version matched |
| SR18 | F.6 | `frontend/utils/caseHistory.ts` (browser local case history with timestamps and decision) | Partial | Not a system audit record: no user identifier, no result-viewing events, kept only in one browser |

The walking skeleton for Milestone 1 is `demo/`: one end to end path (case, synthetic chest X-ray,
clinical data, simulated analysis, ranked differential, clinician decision, summary) with the
model and references stubbed. Its own traceability table is in `demo/README.md`.

---

## Data Contract

Interim. Records the interface as implemented so Chapter 3 can revise it against SR6, SR11, SR15
and SR18.

**Analysis request, as implemented:** `POST /api/upload-scan`, multipart form, JWT bearer token
required.

| Field | Type | Required | Default when missing |
| --- | --- | --- | --- |
| `image` | file (chest X-ray) | yes | none: request rejected with 400 |
| `birthdate` | `YYYY-MM-DD` or `MM/DD/YYYY` | yes | none: request rejected with 400 |
| `systolicBP`, `diastolicBP` | integer, mmHg | no | 120, 80 |
| `temperature` | number, °C | no | 37.0 |
| `heartRate` | integer, bpm | no | 75 |
| `hasCough`, `hasHeadaches` | boolean | no | false |
| `canSmellTaste` | boolean | no | true |
| `gender` | string | no | `female` |

**Constraints from the requirements, not yet met by the request:**

* SR6 needs a patient identifier and a clinical indication in the review view. Neither is in the
  request today. Adding an identifier must be weighed against SR11 and SR15.
* SR15 needs, for each field above, its purpose, storage location, access roles, retention period
  and deletion procedure.
* Silent defaults for missing vitals should be revisited: a missing value is currently
  indistinguishable from a normal one.

## Model Response Contract

Interim. Records the response as implemented so Chapter 3 can revise it against SR1, SR13, SR16
and SR18.

**Analysis response, as implemented:** HTTP 201 with JSON.

| Field | Meaning |
| --- | --- |
| `imageModel.label`, `imageModel.confidence`, `imageModel.threshold` | Image classifier output (`Pneumonia` or `Normal`) and the decision threshold |
| `predictions[]` (`label`, `confidence`), `topPrediction` | Ranked differential after refinement with vitals and symptoms |
| `severity` | `Low`, `Moderate` or `High`, from the highest confidence |
| `modelVersion` | Model identifier, currently `cnn-pneumonia-v1` |
| `processedAt` | UTC timestamp |
| `Covid-19`, `Pneumonia`, `age` | Legacy flat keys kept for older clients |

Errors: 400 for a missing image, missing or invalid birthdate, or invalid values; 500 with
`"Image analysis failed"` when the model or image fails.

**Constraints from the requirements, not yet met by the response:**

* SR1 needs an explanation of the basis for each result in the response, not only a score.
* SR13 needs failures and responses slower than 60 seconds to produce the "no analysis result is
  available" status and direct the clinician to continue without DeepSee.
* SR18 needs software and model versions on every audit event; `modelVersion` exists but no
  audit record is written.
* Confidence values are model outputs, not validated probabilities, and must be presented that way
  until SR3 and SR4 are evaluated.

---

## Open items

1. Numeric targets are proposed course assumptions and need stakeholder confirmation.
2. Supported target findings, evaluation datasets, pilot eligibility and hospital policies must be
   defined before SR3, SR4, SR7 and SR8 can be validated.
3. The Innoslate model still holds empty duplicate need entities (for N3, N4, N5, N7, N8, N9, N12,
   N13 and N16). Traces use the complete entries; check entity IDs when editing.
4. Function numbers for "Generate Operational Performance Report" are not recorded in the report;
   confirm them in the model and add them above.
