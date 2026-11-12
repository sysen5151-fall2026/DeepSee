import sys
from pathlib import Path

# Make backend/core importable so tests can load imaging_service.clinical_analysis
# without starting Django or loading TensorFlow.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend" / "core"))
