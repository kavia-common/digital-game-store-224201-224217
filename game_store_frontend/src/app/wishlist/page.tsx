"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getGame, type Game } from "@/lib/apiClient";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const resolved: Game[] = [];
      for (const id of wishlist.ids) {
        const res = await getGame(id);
        if (res.ok) resolved.push(res.data);
      }
      if (!alive) return;
      setGames(resolved);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [wishlist.ids]);

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Wishlist</div>
            <p className="p-muted">Save games for later.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/catalog">
              Catalog
            </Link>
            <Link className="btn" href="/cart">
              Cart
            </Link>
          </div>
        </div>

        <hr className="hr" />

        {loading ? (
          <p className="p-muted">Loading…</p>
        ) : wishlist.ids.length === 0 ? (
          <div className="surface card">
            <p className="p-muted">Wishlist is empty.</p>
            <div style={{ marginTop: 12 }}>
              <Link className="btn btn-primary" href="/catalog">
                Find games
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid-games">
            {games.map((g) => (
              <article key={g.id} className="surface retro-border card">
                <div className="card-row">
                  <div style={{ minWidth: 0 }}>
                    <Link className="nav-link" href={`/games/${g.id}`} style={{ padding: 0, fontWeight: 900 }}>
                      {g.title}
                    </Link>
                    <p className="p-muted" style={{ marginTop: 6 }}>
                      ${g.price.toFixed(2)} • {g.platform} • {g.genre}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button className="btn btn-primary" onClick={() => cart.add(g.id)}>
                      Add to cart
                    </button>
                    <button className="btn" onClick={() => wishlist.toggle(g.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
