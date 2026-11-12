"""Functional requirement tests for F.3 Perform Clinical Analysis.

Each test name starts with the requirement ID it verifies, so a CI log line
reads straight back to docs/traceability.md and the Innoslate model:

  SR1, SR2, SR13   stakeholder requirements (SPEC.md)
  FR3              system functional requirement for F.3 (docs/requirements-f3.md)
  CR3.1 to CR3.4   component specification requirements for P.3.1 to P.3.4

The real knowledge layer (P.3.2, knowledge_base.calculate) is used. The CNN
(P.3.1) is replaced by a stub so the tests run without TensorFlow; the model
itself is covered by SR3 and SR4 evaluation, not by unit tests.
"""

import inspect

import pytest

from imaging_service.clinical_analysis import (
    AnalysisCriteria,
    AnalysisSubmission,
    ConfirmedInputs,
    analyze_chest_xray_image,
    evaluate_analysis_availability,
    generate_clinical_explanation,
    perform_clinical_analysis,
    refine_and_rank_differential,
)
from imaging_service.clinical_analysis.icom import UNAVAILABLE_MESSAGE, AnalysisStatus
from imaging_service.knowledge_base import calculate

CRITERIA = AnalysisCriteria()


class StubClassifier:
    """Stands in for P.3.1 Chest X-ray CNN."""

    model_version = "stub-cnn"

    def __init__(self, probability=0.82, error=None):
        self.probability = probability
        self.error = error
        self.calls = 0

    def __call__(self, image_bytes):
        self.calls += 1
        if self.error:
            raise self.error
        return self.probability


class FakeClock:
    def __init__(self, now):
        self.now = now

    def __call__(self):
        return self.now


def confirmed_inputs(**overrides):
    values = dict(
        image_bytes=b"fake-png-bytes",
        image_width=1024,
        image_height=1024,
        age=63,
        gender="male",
        temperature=38.4,
        heart_rate=88,
        systolic_bp=124,
        diastolic_bp=78,
        has_cough=True,
        has_headache=False,
        can_smell=True,
        exam_id="EX-1001",
    )
    values.update(overrides)
    return ConfirmedInputs(**values)


def run_f3(*, classifier=None, elapsed=2.0, inputs=None):
    submission = AnalysisSubmission(user_id="clinician-1", submitted_at=100.0)
    return perform_clinical_analysis(
        inputs or confirmed_inputs(),
        submission,
        criteria=CRITERIA,
        classifier=classifier or StubClassifier(),
        knowledge_layer=calculate,
        clock=FakeClock(100.0 + elapsed),
    )


# ----- FR3: system functional requirement for F.3 ---------------------------------


def test_FR3_produces_clinical_analysis_result_and_explanation():
    outcome = run_f3()
    assert outcome.decision.available
    assert outcome.result is not None          # IO.8
    assert outcome.explanation is not None     # IO.9
    assert outcome.decision.notice is None     # no IO.12 on the Available branch
    assert [s[0] for s in outcome.status.steps] == ["F.3.1", "F.3.2", "F.3.3", "F.3.4"]


def test_FR3_function_signatures_follow_the_IDEF0_ICOMs():
    """Inputs are positional parameters, the control and mechanisms are keywords."""
    expected = {
        analyze_chest_xray_image: ["confirmed_inputs", "analysis_submission", "criteria", "classifier", "status"],
        refine_and_rank_differential: ["confirmed_inputs", "image_finding_scores", "criteria", "knowledge_layer", "status"],
        evaluate_analysis_availability: ["analysis_status", "criteria", "clock"],
        generate_clinical_explanation: ["clinical_analysis_result", "criteria"],
    }
    for fn, params in expected.items():
        assert list(inspect.signature(fn).parameters) == params, fn.__name__
        assert "Function ID: F.3." in inspect.getmodule(fn).__doc__, fn.__name__


# ----- SR1: explanation of results ----------------------------------------------


@pytest.mark.parametrize("probability", [0.05, 0.49, 0.51, 0.97])
def test_SR1_every_available_result_has_an_explanation(probability):
    outcome = run_f3(classifier=StubClassifier(probability))
    exp = outcome.explanation
    assert exp.summary and exp.image_finding and exp.caveat
    assert f"{probability:.2f}" in exp.image_finding


# ----- SR2 and SR13: response time and unavailability --------------------------


def test_SR2_result_returned_within_60_seconds_is_available():
    outcome = run_f3(elapsed=59.9)
    assert outcome.decision.available
    assert outcome.decision.elapsed_seconds < CRITERIA.timeout_seconds


def test_SR13_result_after_60_seconds_is_withheld_and_notice_issued():
    outcome = run_f3(elapsed=60.5)
    assert not outcome.decision.available
    assert outcome.result is None and outcome.explanation is None
    assert "60 seconds" in outcome.decision.notice.reason


def test_SR13_classifier_failure_issues_unavailable_notice():
    outcome = run_f3(classifier=StubClassifier(error=RuntimeError("model file missing")))
    assert not outcome.decision.available
    assert "model file missing" in outcome.decision.notice.reason


def test_SR13_notice_directs_clinician_to_continue_without_deepsee():
    notice = run_f3(elapsed=75).decision.notice
    assert notice.message == UNAVAILABLE_MESSAGE
    assert "No analysis result is available" in notice.message
    assert "without DeepSee assistance" in notice.message


# ----- CR3.1: P.3.1 Chest X-ray CNN (F.3.1) --------------------------------------


def test_CR3_1_rejects_image_below_minimum_size_without_calling_model():
    classifier = StubClassifier()
    status = AnalysisStatus(started_at=0)
    scores = analyze_chest_xray_image(
        confirmed_inputs(image_width=32, image_height=32),
        AnalysisSubmission("c", 0),
        criteria=CRITERIA,
        classifier=classifier,
        status=status,
    )
    assert scores is None and classifier.calls == 0
    assert status.failure and "C.3" in status.failure


@pytest.mark.parametrize("probability,positive", [(0.49, False), (0.50, False), (0.51, True)])
def test_CR3_1_applies_the_C3_decision_threshold(probability, positive):
    status = AnalysisStatus(started_at=0)
    scores = analyze_chest_xray_image(
        confirmed_inputs(), AnalysisSubmission("c", 0),
        criteria=CRITERIA, classifier=StubClassifier(probability), status=status,
    )
    assert scores.has_pneumonia is positive
    assert scores.threshold == 0.5 and scores.model_version == "stub-cnn"


def test_CR3_1_rejects_score_outside_zero_to_one():
    status = AnalysisStatus(started_at=0)
    scores = analyze_chest_xray_image(
        confirmed_inputs(), AnalysisSubmission("c", 0),
        criteria=CRITERIA, classifier=StubClassifier(1.7), status=status,
    )
    assert scores is None and "outside 0 to 1" in status.failure


# ----- CR3.2: P.3.2 Knowledge Layer (F.3.2) --------------------------------------


def test_CR3_2_ranks_differential_highest_first_with_normal_as_complement():
    result = run_f3().result
    scores = [p.confidence for p in result.predictions]
    assert scores == sorted(scores, reverse=True)
    by_label = {p.label: p.confidence for p in result.predictions}
    assert set(by_label) == {"Pneumonia", "Covid-19", "Normal"}
    assert by_label["Normal"] == round(1 - max(by_label["Pneumonia"], by_label["Covid-19"]), 2)


def test_CR3_2_scores_never_exceed_the_C3_cap():
    inputs = confirmed_inputs(temperature=39.5, heart_rate=120, has_headache=True, can_smell=False)
    result = run_f3(classifier=StubClassifier(0.99), inputs=inputs).result
    assert all(p.confidence <= CRITERIA.score_cap for p in result.predictions)


@pytest.mark.parametrize("score,severity", [(0.71, "High"), (0.70, "High"), (0.45, "Moderate"), (0.2, "Low")])
def test_CR3_2_severity_bands(score, severity):
    from imaging_service.clinical_analysis.f3_2_refine_and_rank_differential import severity_for

    assert severity_for(score) == severity


# ----- CR3.3: P.3.3 Analysis Status Monitor (F.3.3) ------------------------------


def test_CR3_3_failure_recorded_upstream_takes_unavailable_branch_even_if_fast():
    status = AnalysisStatus(started_at=0)
    status.fail("F.3.2", "Knowledge layer failed")
    decision = evaluate_analysis_availability(status, criteria=CRITERIA, clock=FakeClock(1.0))
    assert not decision.available and decision.notice.reason == "Knowledge layer failed"


def test_CR3_3_records_decision_in_analysis_status():
    status = AnalysisStatus(started_at=0)
    evaluate_analysis_availability(status, criteria=CRITERIA, clock=FakeClock(5.0))
    assert status.steps[-1] == ("F.3.3", "available") and status.finished_at == 5.0


# ----- CR3.4: P.3.4 Explanation Generator (F.3.4) --------------------------------


def test_CR3_4_explanation_names_observed_contributing_factors():
    exp = run_f3().explanation
    assert "Cough" in exp.contributing_factors
    assert "Fever above 37.8 C" in exp.contributing_factors
    assert "Headache" not in exp.contributing_factors


def test_CR3_4_explanation_states_scores_are_not_a_diagnosis():
    exp = run_f3().explanation
    assert "not a diagnosis" in exp.caveat
