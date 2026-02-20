import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <main className="container-page">
      <section className="surface retro-border card" role="alert" aria-live="assertive">
        <div className="h1">404 – Page Not Found</div>
        <p className="p-muted" style={{ marginTop: 8 }}>
          The page you’re looking for doesn’t exist.
        </p>
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/">
            Home
          </Link>
          <Link className="btn" href="/catalog">
            Catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
