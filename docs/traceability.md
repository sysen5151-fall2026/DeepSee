# Traceability: model to code to test

Scope: F.3 Perform Clinical Analysis and its second-level functions F.3.1 to
F.3.4, from the Innoslate IDEF0 (Figure 2) and action diagram (Figure 3) of the
Architecture Definition Form. Requirement IDs are defined in
[SPEC.md](../SPEC.md) (SR) and [requirements-f3.md](requirements-f3.md) (FR, CR).

Paths are relative to `backend/core/imaging_service/clinical_analysis/`.
Tests are in `tests/test_functional_requirements.py` and run on every push
through `.github/workflows/tests.yml`.

## Functions

| Function ID | Function | Performed by | Module path | Requirement ID | Test name |
| --- | --- | --- | --- | --- | --- |
| F.3 | Perform Clinical Analysis | P.3 Clinical Analysis Subsystem | `f3_perform_clinical_analysis.py` (`perform_clinical_analysis`) | FR3 | `test_FR3_produces_clinical_analysis_result_and_explanation`, `test_FR3_function_signatures_follow_the_IDEF0_ICOMs` |
| F.3 | Perform Clinical Analysis | P.3 | `f3_perform_clinical_analysis.py` | SR2 | `test_SR2_result_returned_within_60_seconds_is_available` |
| F.3.1 | Analyze Chest X-ray Image | P.3.1 Chest X-ray CNN | `f3_1_analyze_chest_xray_image.py` (`analyze_chest_xray_image`) | CR3.1 | `test_CR3_1_rejects_image_below_minimum_size_without_calling_model`, `test_CR3_1_applies_the_C3_decision_threshold`, `test_CR3_1_rejects_score_outside_zero_to_one` |
| F.3.2 | Refine and Rank Differential | P.3.2 Knowledge Layer | `f3_2_refine_and_rank_differential.py` (`refine_and_rank_differential`), mechanism `../knowledge_base.py` (`calculate`) | CR3.2 | `test_CR3_2_ranks_differential_highest_first_with_normal_as_complement`, `test_CR3_2_scores_never_exceed_the_C3_cap`, `test_CR3_2_severity_bands` |
| F.3.3 | Evaluate Analysis Availability | P.3.3 Analysis Status Monitor | `f3_3_evaluate_analysis_availability.py` (`evaluate_analysis_availability`) | CR3.3 | `test_CR3_3_failure_recorded_upstream_takes_unavailable_branch_even_if_fast`, `test_CR3_3_records_decision_in_analysis_status` |
| F.3.3 | Evaluate Analysis Availability | P.3.3 | `f3_3_evaluate_analysis_availability.py` | SR13 | `test_SR13_result_after_60_seconds_is_withheld_and_notice_issued`, `test_SR13_classifier_failure_issues_unavailable_notice`, `test_SR13_notice_directs_clinician_to_continue_without_deepsee` |
| F.3.4 | Generate Clinical Explanation | P.3.4 Explanation Generator | `f3_4_generate_clinical_explanation.py` (`generate_clinical_explanation`) | CR3.4 | `test_CR3_4_explanation_names_observed_contributing_factors`, `test_CR3_4_explanation_states_scores_are_not_a_diagnosis` |
| F.3.4 | Generate Clinical Explanation | P.3.4 | `f3_4_generate_clinical_explanation.py` | SR1 | `test_SR1_every_available_result_has_an_explanation` |

## ICOM arrows to code

| Arrow | Name | Role | Code type (`icom.py`) | Used by |
| --- | --- | --- | --- | --- |
| IO.5 | Confirmed Inputs | Input to F.3.1, F.3.2 | `ConfirmedInputs` | first positional parameter |
| I.3 | Analysis submission | Input to F.3.1 | `AnalysisSubmission` | second positional parameter of F.3.1 |
| C.3 | Analysis Acceptance and Timeout Criteria | Control on F.3.1 to F.3.4 | `AnalysisCriteria` | keyword `criteria` on every function |
| IO.17 | Image Finding Scores | F.3.1 to F.3.2 | `ImageFindingScores` | return of F.3.1, input of F.3.2 |
| IO.18 | Analysis Status | F.3.1, F.3.2 to F.3.3 | `AnalysisStatus` | keyword `status`, input of F.3.3 |
| IO.8 | Clinical Analysis Result | F.3.2 to F.3.4 and F.4 | `ClinicalAnalysisResult` | return of F.3.2 |
| IO.9 | Clinical Explanation | F.3.4 to F.4 | `ClinicalExplanation` | return of F.3.4 |
| IO.12 | Analysis Unavailable Notice | F.3.3 to F.4 | `AnalysisUnavailableNotice` | `AvailabilityDecision.notice` |
| P.3.1 to P.3.4 | Mechanisms | Mechanism | `ChestXrayClassifier`, `KnowledgeLayer`, `Clock` | injected keywords (`classifier`, `knowledge_layer`, `clock`) |

## Where the product calls it

`backend/core/imaging_service/views.py` `upload_scan` builds IO.5 and I.3 from
the request, injects the Keras CNN (`KerasChestXrayClassifier`) and
`knowledge_base.calculate` as P.3.1 and P.3.2, and calls
`perform_clinical_analysis`. Available returns 201 with IO.8 and IO.9
(`explanation`). Unavailable returns 503 with IO.12 (`analysisUnavailable`),
and `frontend/app/analyze/page.tsx` shows the notice instead of a result.

## Not yet traced to tests

SR3 and SR4 (sensitivity and specificity) need an independent labelled test
set and are verified by evaluation, not unit tests. The timing in SR2 is
tested with an injected clock; a timed run against the real model is still
needed.
