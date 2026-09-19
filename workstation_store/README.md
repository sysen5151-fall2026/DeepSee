# workstation_store/

Boundary element: **Clinician workstation store** — browser storage holding the
*Recent reviews* history. It is where protected health information comes to rest
in this increment.

What crosses this boundary is defined in [`docs/context.md`](../docs/context.md):
case records out on save, case records in on reopen.

**No code lives here yet.** The working implementation is
`frontend/utils/caseHistory.ts`. This directory is the traceability anchor for
the Chapter 7 interface contract for this boundary, and for the roadmap item that
replaces browser storage with server-side records and an audit trail.
