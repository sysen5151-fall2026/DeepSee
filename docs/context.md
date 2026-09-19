# System Context — External Systems

Lab Manual §1.4.2. This file lists every element on the DeepSee system context
diagram (Innoslate Asset Diagram for Universe context) and states, for each one,
**what crosses the system boundary, in which direction, and in what form**.

This inventory is the ancestor of the interface contract in Chapter 7. When the
Innoslate asset diagram changes, this file changes with it — the model is the
specification, not the code.

> **Sync status.** The entries below were reconciled against the running
> prototype on 2026-09-19 (endpoints in `backend/core/*/urls.py`, request and
> response payloads in `backend/core/imaging_service/views.py`, client calls in
> `frontend/utils/`). Before submission, check each entry against the asset
> diagram in Innoslate and correct the *diagram* if the two disagree — do not
> silently edit this file to match the code.

---

## Data interfaces

### Clinician — in/out

The reviewing physician at the workstation. The only human actor inside the
authenticated workflow.

- **In:** clinician credentials — username and password, over the local network
  to `POST /auth/signup/` and `POST /auth/login/`; JWT returned and held by the
  workspace.
- **In:** frontal chest radiograph — one image file, `multipart/form-data` field
  `image` on `POST /api/upload-scan`.
- **In:** patient context — `birthdate`, `gender`, `systolicBP`, `diastolicBP`,
  `temperature`, `heartRate`, `hasCough`, `hasHeadaches`, `canSmellTaste`, in the
  same form post.
- **In:** clinician decision — accept / reject / indeterminate on the leading
  suggestion, plus a free-text note. Held on the workstation (see *Clinician
  workstation store*), not sent to the inference service in this increment.
- **Out:** ranked differential — JSON: `predictions[]` (label, confidence),
  `topPrediction`, `imageModel` (label, confidence, threshold), `severity`,
  `modelVersion`, `processedAt`.
- **Out:** evidence trail, attention overlay, and next-step prompts — rendered in
  the workspace, separating model output from clinical input from rule-based
  refinement.
- **Out:** exported case PDF — carries the recorded decision and the
  decision-support disclaimer.

### Chest X-ray image source — in

Today, an image file already on the clinician's workstation (samples in
`frontend/assets/x-ray-images/`). DICOM ingestion and PACS integration are on the
roadmap and are **not** part of this increment.

- **In:** one frontal chest radiograph, PNG or JPEG, converted on receipt to
  150 × 150 single-channel grayscale before inference.
- **Out:** none. DeepSee writes nothing back to the image source.

### Clinician workstation store — in/out

Browser storage on the clinician's own workstation, holding the *Recent reviews*
history. It is outside the inference service boundary and it is where protected
health information comes to rest in this increment.

- **Out:** case record — input summary, result payload, clinician decision, note,
  timestamp.
- **In:** previously saved case records, when a clinician reopens a review.
- **Note:** the Support page clears this store, for shared workstations. Replacing
  it with server-side case records and an audit trail is on the roadmap.

---

## Named on the boundary, but not data interfaces

These belong on the context diagram because the boundary has to state what it
refuses or does not yet reach. They carry no data flow in this increment. Compare
the `Criminal` actor in the Lab Manual's Airport Kiosk example (§1.4.2.1), which
is on the diagram but belongs to the Chapter 9 risk register rather than to any
interface.

### Biomedical knowledge source — planned, not connected

An external disease/phenotype ontology (Orphanet, HPO or equivalent) supplying
citable evidence for each ranked suggestion.

- **Nothing crosses the boundary today.** The refinement step is served instead by
  an *in-product* Bayesian prior/likelihood table
  (`backend/core/imaging_service/knowledge_base.py`), which is internal to the
  system, not a boundary crossing.
- The workspace citation layer is labelled *not connected* rather than populated
  with fabricated sources. Retrieval and citations are Chapter 7 work.

### Public / hosted AI endpoints — excluded by design

- **No data crosses this boundary, in either direction, by design.** Patient
  images and context never leave the local network. This exclusion is the subject
  of [ADR-0001](adr/0001-initial-toolchain.md) and belongs in the Chapter 9 risk
  register, not in any interface contract.

### Institutional identity provider / EHR — not connected

- **Nothing crosses the boundary today.** Authentication resolves against the
  local Django user store; there is no SSO federation and no EHR or order-entry
  integration. Named here so the boundary states it, rather than leaving a reader
  to assume an EHR link exists.

---

## Boundary element → implementation

Top-level directories are named for the boundary elements in the model, per
§1.4.2. The working prototype predates this increment and its code lives under
`frontend/` and `backend/`; the boundary directories are the traceability anchors
that Chapter 7's interface work will fill. Nothing was moved or renamed, so no
existing import, CI job or documented command changed.

| Boundary element (model)       | Directory              | Implemented today in                                        |
| ------------------------------ | ---------------------- | ----------------------------------------------------------- |
| Clinician                      | `clinician_interface/` | `frontend/app/`, `frontend/components/ui/`                   |
| Chest X-ray image source       | `imaging_source/`      | `frontend/components/ui/ImageUploader.tsx`, `backend/core/imaging_service/model/` |
| Clinician workstation store    | `workstation_store/`   | `frontend/utils/caseHistory.ts`                              |
| Biomedical knowledge source    | `knowledge_source/`    | not connected — stand-in at `backend/core/imaging_service/knowledge_base.py` |
| Public / hosted AI endpoints   | — (no directory)       | excluded by design; see ADR-0001                             |
| Institutional IdP / EHR        | — (no directory)       | not connected                                                |
