/**
 * Hello-world landing page for the eco app.
 *
 * This is intentionally minimal — it exists only to verify that the
 * monorepo wiring, Vercel project, and DNS record all resolve end-to-end.
 * Replace during Phase 1 with the real app shell.
 */
export default function Page() {
  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>OGS ECO</h1>
      <p style={{ marginTop: "0.75rem", color: "#666" }}>
        OGS workforce-trust platform — port 3004. Phase 0 hello-world shell.
      </p>
    </main>
  );
}
