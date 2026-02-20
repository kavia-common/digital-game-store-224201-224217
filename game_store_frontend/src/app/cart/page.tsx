"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getGame, type Game } from "@/lib/apiClient";
import { useCart } from "@/contexts/CartContext";

type LineView = { game: Game; qty: number };

export default function CartPage() {
  const cart = useCart();
  const [lines, setLines] = useState<LineView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const resolved: LineView[] = [];
      for (const item of cart.items) {
        const res = await getGame(item.gameId);
        if (res.ok) resolved.push({ game: res.data, qty: item.qty });
      }
      if (!alive) return;
      setLines(resolved);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [cart.items]);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.game.price * l.qty, 0),
    [lines]
  );

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Cart</div>
            <p className="p-muted">Your stack of cartridges.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/catalog">
              Continue shopping
            </Link>
            <Link className="btn btn-primary" href="/checkout">
              Checkout
            </Link>
          </div>
        </div>

        <hr className="hr" />

        {loading ? (
          <p className="p-muted">Loading…</p>
        ) : cart.items.length === 0 ? (
          <div className="surface card">
            <p className="p-muted">Cart is empty.</p>
            <div style={{ marginTop: 12 }}>
              <Link className="btn btn-primary" href="/catalog">
                Browse catalog
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 12 }}>
              {lines.map((l) => (
                <div key={l.game.id} className="surface card">
                  <div className="card-row">
                    <div style={{ minWidth: 0 }}>
                      <Link className="nav-link" href={`/games/${l.game.id}`} style={{ padding: 0, fontWeight: 900 }}>
                        {l.game.title}
                      </Link>
                      <p className="p-muted" style={{ marginTop: 6 }}>
                        ${l.game.price.toFixed(2)} • {l.game.platform} • {l.game.genre}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="p-muted">Qty</span>
                        <input
                          className="input"
                          style={{ width: 84 }}
                          value={String(l.qty)}
                          inputMode="numeric"
                          onChange={(e) => cart.setQty(l.game.id, Number(e.target.value))}
                        />
                      </label>
                      <div style={{ fontWeight: 900, minWidth: 110, textAlign: "right" }}>
                        ${(l.game.price * l.qty).toFixed(2)}
                      </div>
                      <button className="btn btn-danger" onClick={() => cart.remove(l.game.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="hr" />

            <div className="surface card">
              <div className="card-row">
                <div>
                  <div className="h2">Total</div>
                  <p className="p-muted">Taxes/fees omitted (mock checkout).</p>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>${total.toFixed(2)}</div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
