"""F.3.2 Refine and Rank Differential.

Function ID: F.3.2 (Innoslate entity 297084), child of F.3 Perform Clinical Analysis.
Performed by: P.3.2 Knowledge Layer (asset 199394), implemented in imaging_service/knowledge_base.py.
Inputs:  IO.5 Confirmed Inputs, IO.17 Image Finding Scores
Control: C.3 Analysis Acceptance and Timeout Criteria
Outputs: IO.8 Clinical Analysis Result, IO.18 Analysis Status
"""

from __future__ import annotations

from typing import Optional

from .icom import (
    AnalysisCriteria,
    AnalysisStatus,
    ClinicalAnalysisResult,
    ConfirmedInputs,
    ImageFindingScores,
    KnowledgeLayer,
    Prediction,
)

FUNCTION_ID = "F.3.2"

FEVER_C, HIGH_HR, HIGH_SBP, HIGH_DBP = 37.8, 90, 130, 90


def severity_for(score: float) -> str:
    """Severity rule used by the product (High at 0.7, Moderate at 0.4)."""
    if score >= 0.7:
        return "High"
    if score >= 0.4:
        return "Moderate"
    return "Low"


def observed_findings(confirmed_inputs: ConfirmedInputs) -> dict:
    c = confirmed_inputs
    return {
        "cough": c.has_cough,
        "headache": c.has_headache,
        "loss_of_smell": not c.can_smell,
        "fever": c.temperature > FEVER_C,
        "high_heart_rate": c.heart_rate > HIGH_HR,
        "high_bp": c.systolic_bp > HIGH_SBP or c.diastolic_bp > HIGH_DBP,
    }


def refine_and_rank_differential(
    confirmed_inputs: ConfirmedInputs,
    image_finding_scores: ImageFindingScores,
    *,
    criteria: AnalysisCriteria,
    knowledge_layer: KnowledgeLayer,
    status: AnalysisStatus,
) -> Optional[ClinicalAnalysisResult]:
    """Refine IO.17 with the patient context through P.3.2, then rank and grade severity (IO.8)."""
    c = confirmed_inputs
    try:
        posteriors = knowledge_layer(
            systolic_pressure=c.systolic_bp,
            diastolic_pressure=c.diastolic_bp,
            temperature=c.temperature,
            heart_rate=c.heart_rate,
            has_cough=c.has_cough,
            has_headache=c.has_headache,
            can_smell=c.can_smell,
            age=c.age,
            gender=c.gender,
            has_pneumonia=image_finding_scores.has_pneumonia,
        )
    except Exception as exc:
        status.fail(FUNCTION_ID, f"Knowledge layer failed: {exc}")
        return None

    covid = min(criteria.score_cap, float(posteriors["Covid-19"]))
    pneumonia = min(criteria.score_cap, float(posteriors["Pneumonia"]))
    normal = round(max(0.0, 1.0 - max(covid, pneumonia)), 2)
    ranked = sorted(
        (Prediction("Pneumonia", pneumonia), Prediction("Covid-19", covid), Prediction("Normal", normal)),
        key=lambda p: p.confidence,
        reverse=True,
    )
    status.record(FUNCTION_ID, "done")
    return ClinicalAnalysisResult(
        predictions=tuple(ranked),
        top_prediction=ranked[0],
        severity=severity_for(max(covid, pneumonia)),
        image_model=image_finding_scores,
        observed=observed_findings(c),
    )
