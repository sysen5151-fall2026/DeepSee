"""P.3 Clinical Analysis Subsystem: code for F.3 Perform Clinical Analysis and F.3.1 to F.3.4.

Pure Python (no Django, no TensorFlow), so it can be tested in CI. The Django view
in imaging_service/views.py supplies the real mechanisms: the Keras CNN (P.3.1)
and knowledge_base.calculate (P.3.2). See docs/traceability.md.
"""

from .f3_1_analyze_chest_xray_image import analyze_chest_xray_image
from .f3_2_refine_and_rank_differential import refine_and_rank_differential
from .f3_3_evaluate_analysis_availability import evaluate_analysis_availability
from .f3_4_generate_clinical_explanation import generate_clinical_explanation
from .f3_perform_clinical_analysis import perform_clinical_analysis
from .icom import (
    AnalysisCriteria,
    AnalysisSubmission,
    ConfirmedInputs,
    F3Outcome,
)

__all__ = [
    "AnalysisCriteria",
    "AnalysisSubmission",
    "ConfirmedInputs",
    "F3Outcome",
    "analyze_chest_xray_image",
    "evaluate_analysis_availability",
    "generate_clinical_explanation",
    "perform_clinical_analysis",
    "refine_and_rank_differential",
]
