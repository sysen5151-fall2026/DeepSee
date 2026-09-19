# ADR-0001: Initial Toolchain

**Status:** Accepted — 2026-09-19

## Context

The Chapter 1 scaffold needs a language, a runtime, and a decision on whether the
in-product model runs locally or is called as a hosted API.

DeepSee's inputs are a chest radiograph and a patient's vitals and symptoms. Both
are protected health information. Every architectural choice below is downstream
of one question: may that data leave the care setting's own network?

The team also inherited a working chest X-ray classifier from the open-source
CDSS project (`docs/ORIGINAL_CDSS_README.md`), which already ran as a Django
service with a TensorFlow model. That inheritance constrains, but does not
decide, the choices below.

## Decision

1. **Clinician workspace:** TypeScript on Next.js 15 / React 19, served from the
   clinician's own workstation.
2. **Inference service:** Python 3.10–3.12 on Django 5.2 with Django REST
   Framework, running inside the care setting's network.
3. **Model hosting: local.** TensorFlow 2.19 loads `cnn-pneumonia-v1` in-process.
   **No product feature calls a hosted inference API.** Patient images and context
   do not cross the network boundary.
4. **Evidence refinement:** an in-product Bayesian prior/likelihood table, not an
   external retrieval service, for this increment.

## Rationale

**On local model hosting.** A hosted API would give better accuracy per query and
remove the burden of shipping model weights. It would also mean radiographs and
vitals leaving the hospital network to a third party — a data-egress question the
team is not prepared to defend to a clinical stakeholder, and one that would put
HIPAA scope on a course prototype. Local inference is slower and narrower, and
that is the trade being accepted.

**On Next.js rather than a notebook or a Streamlit app.** The product's value is
in how a differential is *presented* — clinical hierarchy, evidence separated from
model output, the decision captured from a person. That needs real interface
control.

**On Django rather than a thinner framework.** The inherited classifier already
ran under Django, and Django carries the authentication and admin surface the
service needs. Adopting it avoided a rewrite that would have bought nothing this
increment.

**On a rules table rather than ontology retrieval.** Ontology-linked retrieval is
the intended design and is named on the context diagram as a planned interface.
It is not connected. The workspace labels the citation layer *not connected*
rather than fabricating sources, because a fabricated citation in a clinical tool
is worse than a missing one.

## What would change this decision

- **Model hosting → hosted.** If Chapter 5 latency or accuracy testing shows the
  local model cannot meet the response-time or diagnostic-yield success criteria,
  *and* a deployment path exists that keeps PHI inside a covered entity's
  boundary (an on-premise appliance, or a BAA-covered endpoint). Revisit at the
  Week 12 trade study with a hosted option as the alternative.
- **Refinement → external retrieval.** When an ontology source with a stable,
  citable API is available and Chapter 7 defines the interface contract for it.
- **Inference framework.** If the multi-finding replacement classifier on NIH
  ChestX-ray14 is published in a format TensorFlow 2.19 cannot load.

Nothing about the frontend or backend framework choice is load-bearing for the
PHI-locality decision, which is the one this ADR exists to record.
