"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { readJson } from "@/lib/storage";

const ORDERS_KEY = "dgs_orders";

type Order = {
  id: string;
  createdAt: string;
  status: "PAID" | "PENDING" | "CANCELLED";
  total: number;
  items: Array<{ gameId: string; title: string; price: number; qty: number }>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(readJson<Order[]>(ORDERS_KEY, []));
  }, []);

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Orders</div>
            <p className="p-muted">Your purchase history (mock-local until backend exists).</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/catalog">
              Catalog
            </Link>
            <Link className="btn btn-primary" href="/checkout">
              Checkout
            </Link>
          </div>
        </div>

        <hr className="hr" />

        {orders.length === 0 ? (
          <div className="surface card">
            <p className="p-muted">No orders yet.</p>
            <div style={{ marginTop: 12 }}>
              <Link className="btn btn-primary" href="/catalog">
                Shop now
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {orders.map((o) => (
              <article key={o.id} className="surface retro-border card">
                <div className="card-row">
                  <div>
                    <div className="h2">#{o.id}</div>
                    <p className="p-muted" style={{ marginTop: 6 }}>
                      {new Date(o.createdAt).toLocaleString()} • <span className="badge">{o.status}</span>
                    </p>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>${o.total.toFixed(2)}</div>
                </div>
                <hr className="hr" />
                <div style={{ display: "grid", gap: 8 }}>
                  {o.items.map((it) => (
                    <div key={`${o.id}-${it.gameId}`} className="card-row">
                      <div className="p-muted" style={{ minWidth: 0 }}>
                        <strong style={{ color: "var(--text)" }}>{it.title}</strong> × {it.qty}
                      </div>
                      <div className="p-muted">${(it.price * it.qty).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
