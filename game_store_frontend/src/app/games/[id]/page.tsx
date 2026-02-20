import React from "react";
import Link from "next/link";
import { getGame, listGames } from "@/lib/apiClient";

// PUBLIC_INTERFACE
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  /** Required for `output: "export"`: pre-render known game detail routes. */
  const res = await listGames({});
  if (!res.ok) return [];
  return res.data.items.map((g) => ({ id: g.id }));
}

export default async function GameDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const res = await getGame(resolvedParams.id);

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Game Details</div>
            <p className="p-muted">Inspect the cartridge before you buy.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/catalog">
              Back to catalog
            </Link>
            <Link className="btn" href="/cart">
              Cart
            </Link>
          </div>
        </div>

        <hr className="hr" />

        {!res.ok ? (
          <p style={{ color: "var(--danger)" }}>{res.error}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            <div className="surface card">
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 120,
                    height: 160,
                    borderRadius: 14,
                    border: "1px solid rgba(168,190,255,0.22)",
                    background: `url(${res.data.coverUrl || ""}) center/cover, rgba(7,10,19,0.35)`,
                  }}
                />
                <div>
                  <div className="card-row">
                    <div style={{ minWidth: 0 }}>
                      <div className="h2">{res.data.title}</div>
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">{res.data.platform}</span>
                        <span className="badge">{res.data.genre}</span>
                        <span className="badge">{res.data.releaseYear}</span>
                        <span className="badge">★ {res.data.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>${res.data.price.toFixed(2)}</div>
                      <p className="p-muted" style={{ marginTop: 4 }}>
                        Instant delivery
                      </p>
                    </div>
                  </div>

                  <p className="p-muted" style={{ marginTop: 10 }}>
                    {res.data.description}
                  </p>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link className="btn btn-primary" href="/cart">
                      Go to cart
                    </Link>
                    <Link className="btn" href="/wishlist">
                      Go to wishlist
                    </Link>
                    {res.data.trailerUrl ? (
                      <a className="btn" href={res.data.trailerUrl} target="_blank" rel="noreferrer">
                        Watch trailer
                      </a>
                    ) : null}
                  </div>

                  <p className="p-muted" style={{ marginTop: 10 }}>
                    Note: This page is static-exported; cart/wishlist actions are available from Catalog/Cart/Wishlist pages.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface card">
              <div className="h2">Screenshots</div>
              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {(res.data.screenshots || []).map((src, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: 14,
                      border: "1px solid rgba(168,190,255,0.22)",
                      background: `url(${src}) center/cover, rgba(7,10,19,0.35)`,
                    }}
                    aria-label={`Screenshot ${idx + 1}`}
                    role="img"
                  />
                ))}
                {(!res.data.screenshots || res.data.screenshots.length === 0) && (
                  <p className="p-muted">No screenshots available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
