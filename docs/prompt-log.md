# Prompt Log

Provenance for AI-assisted work, per Lab Manual §1.4.2 and §1.4.3. One entry per
significant generation session.

**Rules this log follows.**
- The entry is written by the **reviewer**, after reading the diff — never by the
  assistant that produced it.
- The reviewer is **someone other than the person who ran the generation**.
- Assumptions the assistant made on its own are recorded even when the team
  agrees with them, together with what happened to each one.
- Rejected output is recorded. Rejecting a fully working starter application is
  the point of the Chapter 1 increment, not a side effect of it.

---

## 2026-09-19 — Zhuoran Wang — Claude Code (Opus)

**Built from:** Lab Manual §1.4 (pages 34–40); Week 2 lecture, *Business or
Mission Analysis — Modeling a System Context*; the existing repository at
`db55986`. No requirements exist yet — this is the Chapter 1 scaffold.

**Prompt:** Review the repository against §1.4.1–1.4.3 and produce the missing
Chapter 1 artifacts — `docs/context.md`, `SPEC.md` stub, `docs/environment.md`,
`docs/adr/0001-initial-toolchain.md`, this log, the OpsCon section of
`README.md`, and one top-level directory per boundary element — **without
modifying any existing application code**.

**Reviewed by:** _(teammate — fill in before submission; must not be Zhuoran
Wang)_

**Accepted:**
- The boundary inventory in `docs/context.md`, after checking each entry against
  `backend/core/imaging_service/views.py` and `backend/core/*/urls.py`.
- The four boundary directories as documentation-only traceability anchors.
- ADR-0001's framing of local model hosting as a PHI-locality decision.

**Rejected:**
- _(record here anything the team removes — fill in at review)_

**Assistant assumptions:**

1. *Assumed the OpsCon narrative could be drafted from the repository.* It cannot
   — §1.4.2 requires it copied from the Innoslate model, not paraphrased. The
   assistant left a marked placeholder in `README.md` instead of writing one.
   **Disposition:** open. Paste the exact Innoslate narrative before submission.

2. *Assumed the external systems in `docs/context.md` match the Innoslate asset
   diagram.* They were derived from the running code, not from the model.
   **Disposition:** open. Reconcile against the asset diagram; if the two
   disagree, correct the diagram, then this file.

3. *Assumed `docs/adr/` rather than `docs/decisions/`.* The Lab Manual §1.4.2
   specifies `docs/adr/0001-initial-toolchain.md`; the Week 2 slides show
   `docs/decisions/0001-initial-toolchain.md`. **Disposition:** followed the
   manual. Confirm with the instructor.

4. *Assumed the existing prototype stays where it is.* §1.4.2 asks for top-level
   directories named for boundary elements; `frontend/` and `backend/` are named
   for technology. Moving working code would have broken CI, the documented
   commands, and every import, for no traceability gain that the mapping table in
   `docs/context.md` does not already provide. **Disposition:** accepted as a
   documented divergence — see *Model and product divergence* in `README.md`.

**Out of scope, and honoured:** no application code was added, changed or
deleted in this increment. `frontend/`, `backend/` and `.github/` are untouched.
