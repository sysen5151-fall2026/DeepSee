# F.3 Perform Clinical Analysis: requirements and flow-down

This page records the requirements that sit under F.3 in the Innoslate model
(DeepSee project, Cornell workspace). It links the stakeholder requirements in
[SPEC.md](../SPEC.md) to the system functional requirement for F.3 (Lab Manual
Chapter 5) and to the component specification requirements for P.3.1 to P.3.4
(Chapter 9). Test names in `tests/test_functional_requirements.py` start with
these IDs.

## System functional requirement (Chapter 5)

| ID | Function | Requirement | Parent |
| --- | --- | --- | --- |
| FR3 | F.3 Perform Clinical Analysis | Given IO.5 Confirmed Inputs and I.3 Analysis submission, F.3 shall produce either IO.8 Clinical Analysis Result with IO.9 Clinical Explanation, or IO.12 Analysis Unavailable Notice, within 60 seconds of image acceptance under C.3. | SR1, SR2, SR13 |

## Component specification requirements (Chapter 9)

| ID | Component (performs) | Requirement | Parent | Flow-down type |
| --- | --- | --- | --- | --- |
| CR3.1 | P.3.1 Chest X-ray CNN (F.3.1) | Shall reject an image whose smaller side is under 64 px without running the model, shall return a score between 0 and 1, and shall classify the image as pneumonia-positive only when the score exceeds the C.3 threshold (0.5). | FR3, SR3, SR4 | Synthesis |
| CR3.2 | P.3.2 Knowledge Layer (F.3.2) | Shall rank Pneumonia, Covid-19 and Normal highest first, cap every score at 0.95, set Normal to 1 minus the highest disease score, and grade severity High at 0.70 or above and Moderate at 0.40 or above. | FR3 | Synthesis |
| CR3.3 | P.3.3 Analysis Status Monitor (F.3.3) | Shall take the Unavailable branch and issue IO.12 when any F.3 step reports a failure or when more than 60 seconds have passed since image acceptance. | FR3, SR13 | Equivalence |
| CR3.4 | P.3.4 Explanation Generator (F.3.4) | Shall give every available result a summary, the image finding against the threshold, the observed contributing factors, and a caveat that scores are not a diagnosis. | FR3, SR1 | Equivalence |

## System-wide requirement flow-down (example: SR13)

```
SR13 Analysis Unavailability Notification (stakeholder, F.0.4)
  "When an analysis request fails or exceeds 60 seconds without a result,
   DeepSee shall display ... no analysis result is available ... continue ...
   without DeepSee assistance."
   |
   |  equivalence: the same 60 s limit and the same message, now owned by F.3
   v
FR3 (system functional requirement, F.3 Perform Clinical Analysis)
  "... or IO.12 Analysis Unavailable Notice, within 60 seconds ..."
   |
   |  equivalence: one component makes the decision (OR node on the F.3 action diagram)
   v
CR3.3 (component spec, P.3.3 Analysis Status Monitor)
  "... issue IO.12 when any F.3 step reports a failure or when more than 60 s have passed."
   |
   v
code:  clinical_analysis/f3_3_evaluate_analysis_availability.py
tests: test_SR13_*, test_CR3_3_*
UI:    frontend/app/analyze/page.tsx shows the IO.12 message, no result screen (HTTP 503)
```

SR2 (60 second response time) flows down the same path. The 60 second budget
is held by F.3 as a whole and checked once, at F.3.3, rather than split across
F.3.1 and F.3.2, because model latency dominates and varies by machine.

## Innoslate

When these IDs are entered in Innoslate, link them with `decomposes` (FR3 to
SR2 and SR13, CR3.x to FR3), `satisfied by` (FR3 to F.3, CR3.x to F.3.x and
P.3.x) and `verified by` (each ID to the test of the same name). If Innoslate
assigns different numbers, update this page, `docs/traceability.md`, and the
test name prefixes together.
