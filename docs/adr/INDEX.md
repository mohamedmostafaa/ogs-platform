# Architecture Decision Records — Index

Each ADR captures a deviation from `docs/blueprint/OGS_Platform_Blueprint_v01.docx`
or a non-obvious cross-cutting choice. Per `AGENTS.md §0 rule 8`: every
deviation needs an ADR written **before** the code change. ADRs are
chronological; the `Status` line says whether each is Accepted, Proposed,
Superseded, or Rejected.

| ID                                             | Title                                                                  | Status   |
| ---------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| [0000](./0000-template.md)                     | (template — copy when authoring)                                       | —        |
| [0001](./0001-proxy-ts-location.md)            | `proxy.ts` lives at `apps/<name>/src/proxy.ts`                         | Accepted |
| [0002](./0002-arcjet-rule-set-naming.md)       | Arcjet rule-set naming + add `authEndpoint` + `aiEndpoint`             | Accepted |
| [0003](./0003-prisma-client-and-audit-gate.md) | Lazy Prisma client + Gate-4 fail-loud audit + tenantId on child models | Accepted |

Add new ADRs by copying `0000-template.md` to `NNNN-<slug>.md` and bumping
this index in the same PR.
