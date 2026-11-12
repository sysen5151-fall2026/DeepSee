"""F.3 Perform Clinical Analysis.

Function ID: F.3 (Innoslate entity 199448), first-level function under F.0.
Performed by: P.3 Clinical Analysis Subsystem (asset 199385), decomposed into P.3.1 to P.3.4.
Inputs:  IO.5 Confirmed Inputs, I.3 Analysis submission
Control: C.3 Analysis Acceptance and Timeout Criteria
Outputs: IO.8 Clinical Analysis Result, IO.9 Clinical Explanation, IO.12 Analysis Unavailable Notice

Runs the second-level functions in the order of the F.3 action diagram:
F.3.1 -> F.3.2 -> F.3.3 (OR: Available -> F.3.4, Unavailable -> IO.12).
"""

from __future__ import annotations

import time

from .f3_1_analyze_chest_xray_image import analyze_chest_xray_image
from .f3_2_refine_and_rank_differential import refine_and_rank_differential
from .f3_3_evaluate_analysis_availability import evaluate_analysis_availability
from .f3_4_generate_clinical_explanation import generate_clinical_explanation
from .icom import (
    AnalysisCriteria,
    AnalysisStatus,
    AnalysisSubmission,
    ChestXrayClassifier,
    Clock,
    ConfirmedInputs,
    F3Outcome,
    KnowledgeLayer,
)

FUNCTION_ID = "F.3"


def perform_clinical_analysis(
    confirmed_inputs: ConfirmedInputs,
    analysis_submission: AnalysisSubmission,
    *,
    criteria: AnalysisCriteria,
    classifier: ChestXrayClassifier,
    knowledge_layer: KnowledgeLayer,
    clock: Clock = time.monotonic,
) -> F3Outcome:
    """Turn IO.5 and I.3 into IO.8 and IO.9, or IO.12 when no usable result exists."""
    status = AnalysisStatus(started_at=analysis_submission.submitted_at)

    scores = analyze_chest_xray_image(
        confirmed_inputs, analysis_submission, criteria=criteria, classifier=classifier, status=status
    )
    result = None
    if scores is not None:
        result = refine_and_rank_differential(
            confirmed_inputs, scores, criteria=criteria, knowledge_layer=knowledge_layer, status=status
        )

    decision = evaluate_analysis_availability(status, criteria=criteria, clock=clock)
    if not decision.available:
        return F3Outcome(decision=decision, status=status)

    explanation = generate_clinical_explanation(result, criteria=criteria)
    status.record("F.3.4", "done")
    return F3Outcome(decision=decision, result=result, explanation=explanation, status=status)
