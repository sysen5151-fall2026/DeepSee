"""F.3.1 Analyze Chest X-ray Image.

Function ID: F.3.1 (Innoslate entity 278141), child of F.3 Perform Clinical Analysis.
Performed by: P.3.1 Chest X-ray CNN (asset 199393).
Inputs:  IO.5 Confirmed Inputs, I.3 Analysis submission
Control: C.3 Analysis Acceptance and Timeout Criteria
Outputs: IO.17 Image Finding Scores, IO.18 Analysis Status
"""

from __future__ import annotations

from typing import Optional

from .icom import (
    AnalysisCriteria,
    AnalysisStatus,
    AnalysisSubmission,
    ChestXrayClassifier,
    ConfirmedInputs,
    ImageFindingScores,
)

FUNCTION_ID = "F.3.1"


def analyze_chest_xray_image(
    confirmed_inputs: ConfirmedInputs,
    analysis_submission: AnalysisSubmission,
    *,
    criteria: AnalysisCriteria,
    classifier: ChestXrayClassifier,
    status: AnalysisStatus,
) -> Optional[ImageFindingScores]:
    """Accept the image under C.3 and run P.3.1 on it.

    Returns IO.17, or None after recording the failure in IO.18 so F.3.3 can
    take the Unavailable branch.
    """
    side = min(confirmed_inputs.image_width, confirmed_inputs.image_height)
    if not confirmed_inputs.image_bytes or side < criteria.min_image_side_px:
        status.fail(FUNCTION_ID, f"Image not accepted under C.3: smallest side {side} px, minimum {criteria.min_image_side_px} px.")
        return None
    try:
        probability = float(classifier(confirmed_inputs.image_bytes))
    except Exception as exc:  # the classifier is an external mechanism; any failure becomes IO.18
        status.fail(FUNCTION_ID, f"Chest X-ray classifier failed: {exc}")
        return None
    if not 0.0 <= probability <= 1.0:
        status.fail(FUNCTION_ID, f"Chest X-ray classifier returned {probability}, outside 0 to 1.")
        return None
    status.record(FUNCTION_ID, "done")
    return ImageFindingScores(
        pneumonia_probability=probability,
        has_pneumonia=probability > criteria.pneumonia_threshold,
        threshold=criteria.pneumonia_threshold,
        model_version=classifier.model_version,
    )
