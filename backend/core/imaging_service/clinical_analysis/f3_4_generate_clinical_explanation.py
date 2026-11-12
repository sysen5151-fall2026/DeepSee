"""F.3.4 Generate Clinical Explanation.

Function ID: F.3.4 (Innoslate entity 278160), child of F.3 Perform Clinical Analysis.
Performed by: P.3.4 Explanation Generator (asset 297086).
Inputs:  IO.8 Clinical Analysis Result
Control: C.3 Analysis Acceptance and Timeout Criteria
Outputs: IO.9 Clinical Explanation (SR1)
"""

from __future__ import annotations

from .icom import AnalysisCriteria, ClinicalAnalysisResult, ClinicalExplanation

FUNCTION_ID = "F.3.4"

_LABELS = {
    "cough": "Cough",
    "headache": "Headache",
    "loss_of_smell": "Loss of smell or taste",
    "fever": "Fever above 37.8 C",
    "high_heart_rate": "Heart rate above 90 bpm",
    "high_bp": "Blood pressure above 130/90",
}


def generate_clinical_explanation(
    clinical_analysis_result: ClinicalAnalysisResult,
    *,
    criteria: AnalysisCriteria,
) -> ClinicalExplanation:
    """Explain IO.8: the image finding against the threshold and the observations that moved the scores."""
    r = clinical_analysis_result
    img = r.image_model
    side = "above" if img.has_pneumonia else "below"
    image_finding = (
        f"Classifier score {img.pneumonia_probability:.2f} is {side} the {img.threshold:.2f} threshold, "
        f"so the image {'supports' if img.has_pneumonia else 'does not on its own support'} pneumonia."
    )
    present = tuple(_LABELS[k] for k, v in r.observed.items() if v)
    return ClinicalExplanation(
        summary=f"{r.top_prediction.label} ranks first at {r.top_prediction.confidence:.2f} (severity {r.severity.lower()}).",
        image_finding=image_finding,
        contributing_factors=present,
        caveat=(
            f"Scores are model outputs capped at {criteria.score_cap:.2f}, not validated probabilities. "
            "Use them as a prompt for clinical review, not a diagnosis."
        ),
    )
