"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listGames, type Game } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { readJson, writeJson } from "@/lib/storage";

const ADMIN_GAMES_KEY = "dgs_admin_games_override";
const ORDERS_KEY = "dgs_orders";

type Order = {
  id: string;
  createdAt: string;
  status: "PAID" | "PENDING" | "CANCELLED";
  total: number;
  items: Array<{ gameId: string; title: string; price: number; qty: number }>;
};

export default function AdminPage() {
  const auth = useAuth();

  const [tab, setTab] = useState<"games" | "orders">("games");

  const [games, setGames] = useState<Game[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [form, setForm] = useState({
    title: "",
    price: "9.99",
    platform: "PC",
    genre: "Action",
    rating: "4.0",
    releaseYear: "2024",
    description: "A brand new retro masterpiece.",
  });

  const isAdmin = auth.state.role === "ADMIN";

  useEffect(() => {
    (async () => {
      const base = await listGames({});
      const override = readJson<Game[]>(ADMIN_GAMES_KEY, []);
      if (base.ok) {
        // Simple merge: override entries appended.
        setGames([...override, ...base.data.items]);
      }
      setOrders(readJson<Order[]>(ORDERS_KEY, []));
    })();
  }, []);

  const revenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);

  function saveOverride(nextOverride: Game[]) {
    writeJson(ADMIN_GAMES_KEY, nextOverride);
    setGames((prev) => {
      const base = prev.filter((g) => !g.id.startsWith("admin-"));
      return [...nextOverride, ...base];
    });
  }

  function addGame() {
    const price = Number(form.price);
    const rating = Number(form.rating);
    const releaseYear = Number(form.releaseYear);

    if (!form.title.trim() || !Number.isFinite(price)) return;

    const allowedPlatforms: Game["platform"][] = ["PC", "PlayStation", "Xbox", "Switch"];
    const platformValue: Game["platform"] = allowedPlatforms.includes(form.platform as Game["platform"])
      ? (form.platform as Game["platform"])
      : "PC";

    const g: Game = {
      id: `admin-${Math.random().toString(16).slice(2)}`,
      title: form.title.trim(),
      price: Math.round(price * 100) / 100,
      platform: platformValue,
      genre: form.genre.trim(),
      rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 4.0,
      description: form.description.trim(),
      releaseYear: Number.isFinite(releaseYear) ? releaseYear : new Date().getFullYear(),
      coverUrl: "/assets/placeholder-cover-1.svg",
      screenshots: ["/assets/placeholder-shot-1.svg"],
    };

    const currentOverride = readJson<Game[]>(ADMIN_GAMES_KEY, []);
    saveOverride([g, ...currentOverride]);
    setForm((f) => ({ ...f, title: "" }));
  }

  function removeGame(id: string) {
    const currentOverride = readJson<Game[]>(ADMIN_GAMES_KEY, []);
    saveOverride(currentOverride.filter((x) => x.id !== id));
  }

  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h1">Admin Dashboard</div>
            <p className="p-muted">Manage games and view orders.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/auth">
              Auth
            </Link>
            <Link className="btn" href="/catalog">
              Catalog
            </Link>
          </div>
        </div>

        <hr className="hr" />

        {!isAdmin ? (
          <div className="surface card">
            <div className="h2">Access denied</div>
            <p className="p-muted" style={{ marginTop: 8 }}>
              You must be ADMIN to view this page. Use an email containing <code>admin</code> when logging in.
            </p>
            <div style={{ marginTop: 12 }}>
              <Link className="btn btn-primary" href="/auth">
                Go to auth
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className={`btn ${tab === "games" ? "btn-primary" : ""}`} onClick={() => setTab("games")}>
                Games
              </button>
              <button className={`btn ${tab === "orders" ? "btn-primary" : ""}`} onClick={() => setTab("orders")}>
                Orders
              </button>
            </div>

            <hr className="hr" />

            {tab === "games" ? (
              <div className="grid-games" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
                <div className="surface card">
                  <div className="h2">Create game (mock)</div>
                  <p className="p-muted" style={{ marginTop: 6 }}>
                    Saved locally. Replace with backend admin endpoints once available.
                  </p>

                  <div style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 720 }}>
                    <label>
                      <span className="p-muted">Title</span>
                      <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                      <label>
                        <span className="p-muted">Price</span>
                        <input className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                      </label>
                      <label>
                        <span className="p-muted">Rating</span>
                        <input className="input" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                      <label>
                        <span className="p-muted">Platform</span>
                        <select className="select" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                          <option value="PC">PC</option>
                          <option value="PlayStation">PlayStation</option>
                          <option value="Xbox">Xbox</option>
                          <option value="Switch">Switch</option>
                        </select>
                      </label>
                      <label>
                        <span className="p-muted">Genre</span>
                        <input className="input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
                      </label>
                      <label>
                        <span className="p-muted">Release year</span>
                        <input className="input" value={form.releaseYear} onChange={(e) => setForm({ ...form, releaseYear: e.target.value })} />
                      </label>
                    </div>

                    <label>
                      <span className="p-muted">Description</span>
                      <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </label>

                    <button className="btn btn-primary" onClick={addGame}>
                      Add game
                    </button>
                  </div>
                </div>

                <div className="surface card">
                  <div className="h2">Inventory</div>
                  <p className="p-muted" style={{ marginTop: 6 }}>
                    Admin-created games are removable (ids starting with <code>admin-</code>).
                  </p>

                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {games.map((g) => (
                      <div key={g.id} className="surface retro-border card">
                        <div className="card-row">
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 900 }}>{g.title}</div>
                            <p className="p-muted" style={{ marginTop: 6 }}>
                              ${g.price.toFixed(2)} • {g.platform} • {g.genre} • ★ {g.rating.toFixed(1)}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <Link className="btn" href={`/games/${g.id}`}>
                              View
                            </Link>
                            {g.id.startsWith("admin-") ? (
                              <button className="btn btn-danger" onClick={() => removeGame(g.id)}>
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid-games" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
                <div className="surface card">
                  <div className="h2">Orders</div>
                  <p className="p-muted" style={{ marginTop: 6 }}>
                    {orders.length} order(s) • Revenue: <strong style={{ color: "var(--text)" }}>${revenue.toFixed(2)}</strong>
                  </p>
                </div>

                <div className="surface card">
                  <div style={{ display: "grid", gap: 12 }}>
                    {orders.map((o) => (
                      <article key={o.id} className="surface retro-border card">
                        <div className="card-row">
                          <div>
                            <div style={{ fontWeight: 900 }}>#{o.id}</div>
                            <p className="p-muted" style={{ marginTop: 6 }}>
                              {new Date(o.createdAt).toLocaleString()} • <span className="badge">{o.status}</span>
                            </p>
                          </div>
                          <div style={{ fontWeight: 900 }}>${o.total.toFixed(2)}</div>
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
                    {orders.length === 0 ? <p className="p-muted">No orders.</p> : null}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
