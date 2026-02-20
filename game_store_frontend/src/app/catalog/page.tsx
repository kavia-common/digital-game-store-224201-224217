"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listGames, type Game } from "@/lib/apiClient";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

function Money({ value }: { value: number }) {
  return <span>${value.toFixed(2)}</span>;
}

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const on = i < full || (i === full && half);
    return (
      <span key={i} aria-hidden="true" style={{ color: on ? "var(--neon2)" : "rgba(168,190,255,0.25)" }}>
        ★
      </span>
    );
  });

  return (
    <span aria-label={`Rating ${value.toFixed(1)} out of 5`} style={{ display: "inline-flex", gap: 2 }}>
      {stars}
      <span className="p-muted" style={{ marginLeft: 8 }}>
        {value.toFixed(1)}
      </span>
    </span>
  );
}

export default function CatalogPage() {
  const { add } = useCart();
  const wishlist = useWishlist();

  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("");
  const [genre, setGenre] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Game[]>([]);

  const minPriceNum = useMemo(() => (minPrice.trim() ? Number(minPrice) : undefined), [minPrice]);
  const maxPriceNum = useMemo(() => (maxPrice.trim() ? Number(maxPrice) : undefined), [maxPrice]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await listGames({
        q,
        platform: platform || undefined,
        genre: genre || undefined,
        minPrice: Number.isFinite(minPriceNum as number) ? (minPriceNum as number) : undefined,
        maxPrice: Number.isFinite(maxPriceNum as number) ? (maxPriceNum as number) : undefined,
      });
      if (!alive) return;
      if (!res.ok) setError(res.error);
      else setItems(res.data.items);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [q, platform, genre, minPriceNum, maxPriceNum]);

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Catalog</div>
            <p className="p-muted">Search and filter the retro shelves.</p>
          </div>
          <Link className="btn" href="/cart">
            View Cart
          </Link>
        </div>

        <hr className="hr" />

        <div className="grid-games" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: 12 }}>
          <div className="surface card">
            <div className="h2">Search</div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: 10 }}>
              <label>
                <span className="p-muted">Query</span>
                <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Neon, dungeon, astro..." />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: 10 }}>
                <label>
                  <span className="p-muted">Platform</span>
                  <select className="select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="">All</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Switch">Switch</option>
                  </select>
                </label>

                <label>
                  <span className="p-muted">Genre</span>
                  <input className="input" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="RPG, Racing, Shooter..." />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                <label>
                  <span className="p-muted">Min price</span>
                  <input className="input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} inputMode="decimal" placeholder="0" />
                </label>
                <label>
                  <span className="p-muted">Max price</span>
                  <input className="input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} inputMode="decimal" placeholder="50" />
                </label>
              </div>

              <p className="p-muted">
                Tip: backend currently only supports a health endpoint; catalog is mock-backed until game endpoints exist.
              </p>
            </div>
          </div>

          <div className="surface card">
            <div className="h2">Results</div>
            {loading ? (
              <p className="p-muted" style={{ marginTop: 10 }}>
                Loading…
              </p>
            ) : error ? (
              <p style={{ marginTop: 10, color: "var(--danger)" }}>{error}</p>
            ) : (
              <p className="p-muted" style={{ marginTop: 10 }}>
                {items.length} game(s)
              </p>
            )}

            <div className="grid-games" style={{ marginTop: 12 }}>
              {items.map((g) => (
                <article key={g.id} className="surface retro-border card">
                  <div style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 12, alignItems: "start" }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: 84,
                        height: 110,
                        borderRadius: 12,
                        border: "1px solid rgba(168,190,255,0.22)",
                        background: `url(${g.coverUrl || ""}) center/cover, rgba(7,10,19,0.35)`,
                      }}
                    />
                    <div>
                      <div className="card-row">
                        <div style={{ minWidth: 0 }}>
                          <Link href={`/games/${g.id}`} className="nav-link" style={{ padding: 0, fontWeight: 900 }}>
                            {g.title}
                          </Link>
                          <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">{g.platform}</span>
                            <span className="badge">{g.genre}</span>
                            <span className="badge">{g.releaseYear}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 900, fontSize: 16 }}>
                            <Money value={g.price} />
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <StarRating value={g.rating} />
                          </div>
                        </div>
                      </div>

                      <p className="p-muted" style={{ marginTop: 10 }}>
                        {g.description.slice(0, 110)}
                        {g.description.length > 110 ? "…" : ""}
                      </p>

                      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="btn btn-primary" onClick={() => add(g.id)}>
                          Add to cart
                        </button>
                        <button className="btn" onClick={() => wishlist.toggle(g.id)}>
                          {wishlist.has(g.id) ? "Remove wishlist" : "Add wishlist"}
                        </button>
                        <Link className="btn" href={`/games/${g.id}`}>
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
