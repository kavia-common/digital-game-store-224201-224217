"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { mockCreateOrder, getGame, type Order } from "@/lib/apiClient";
import { readJson, writeJson } from "@/lib/storage";

const ORDERS_KEY = "dgs_orders";

type SavedOrder = Order;

export default function CheckoutPage() {
  const cart = useCart();
  const auth = useAuth();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState(auth.state.email || "");
  const [notes, setNotes] = useState("");

  const canPlace = useMemo(() => {
    if (cart.items.length === 0) return false;
    if (!name.trim()) return false;
    if (!email.includes("@")) return false;
    return true;
  }, [cart.items.length, name, email]);

  async function placeOrder() {
    setError(null);
    setSuccessOrderId(null);

    if (!canPlace) {
      setError("Fill in name/email and ensure cart is not empty.");
      return;
    }

    setBusy(true);

    // Resolve titles/prices for a better receipt experience (still mock-based).
    // (Not required for backend checkout later; this is purely for UX in mock mode.)
    for (const it of cart.items) {
      await getGame(it.gameId);
    }

    const res = await mockCreateOrder({ items: cart.items });
    setBusy(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    const existing = readJson<SavedOrder[]>(ORDERS_KEY, []);
    const orderToSave: SavedOrder = {
      ...res.data,
      // attach light customer metadata in mock store
      items: res.data.items,
    };

    writeJson(ORDERS_KEY, [orderToSave, ...existing]);
    cart.clear();
    setSuccessOrderId(res.data.id);
  }

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Checkout</div>
            <p className="p-muted">Mock payment flow (no provider configured).</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/cart">
              Back to cart
            </Link>
            <Link className="btn" href="/orders">
              Orders
            </Link>
          </div>
        </div>

        <hr className="hr" />

        {successOrderId ? (
          <div className="surface card">
            <div className="h2">Order placed</div>
            <p className="p-muted" style={{ marginTop: 6 }}>
              Receipt ID: <strong style={{ color: "var(--text)" }}>{successOrderId}</strong>
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/orders">
                View orders
              </Link>
              <Link className="btn" href="/catalog">
                Back to catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid-games" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
            <div className="surface card">
              <div className="h2">Customer</div>

              <div style={{ marginTop: 10, display: "grid", gap: 10, maxWidth: 560 }}>
                <label>
                  <span className="p-muted">Name</span>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Player One" />
                </label>
                <label>
                  <span className="p-muted">Email</span>
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="player@retro.com" />
                </label>
                <label>
                  <span className="p-muted">Notes</span>
                  <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional delivery notes..." />
                </label>
              </div>

              {!auth.isAuthed ? (
                <p className="p-muted" style={{ marginTop: 10 }}>
                  You are checking out as guest. You can{" "}
                  <Link className="nav-link" style={{ padding: 0, display: "inline" }} href="/auth">
                    login
                  </Link>{" "}
                  to sync orders later once backend endpoints exist.
                </p>
              ) : null}

              {error ? <p style={{ marginTop: 10, color: "var(--danger)" }}>{error}</p> : null}

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={placeOrder} disabled={!canPlace || busy} aria-disabled={!canPlace || busy}>
                  {busy ? "Placing…" : "Place order"}
                </button>
                <Link className="btn" href="/cart">
                  Review cart
                </Link>
              </div>
            </div>

            <div className="surface card">
              <div className="h2">What happens next?</div>
              <p className="p-muted" style={{ marginTop: 8 }}>
                In real mode, this page should call backend <code>POST /checkout</code> (or similar) and then show an order confirmation.
              </p>
              <p className="p-muted" style={{ marginTop: 8 }}>
                For now, the order is saved locally in your browser.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
