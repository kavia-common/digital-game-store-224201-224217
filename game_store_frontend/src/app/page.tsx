import Link from "next/link";

export default function Home() {
  return (
    <main className="container-page">
      <section className="surface retro-border card">
        <div className="h1">Retro Game Store</div>
        <p className="p-muted" style={{ marginTop: 8 }}>
          Browse the catalog, build your cart, keep a wishlist, and place mock orders. Admin
          dashboard included.
        </p>

        <hr className="hr" />

        <div className="grid-games" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
          <div className="surface card">
            <div className="h2">Shop</div>
            <p className="p-muted" style={{ marginTop: 6 }}>
              Search, filter, view details, add to cart or wishlist.
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/catalog">
                Open Catalog
              </Link>
              <Link className="btn" href="/wishlist">
                Wishlist
              </Link>
              <Link className="btn" href="/cart">
                Cart
              </Link>
            </div>
          </div>

          <div className="surface card">
            <div className="h2">Account</div>
            <p className="p-muted" style={{ marginTop: 6 }}>
              Mock auth is enabled. Use an email containing <code>admin</code> to become ADMIN.
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/auth">
                Login / Signup
              </Link>
              <Link className="btn" href="/orders">
                Orders
              </Link>
            </div>
          </div>

          <div className="surface card">
            <div className="h2">Admin</div>
            <p className="p-muted" style={{ marginTop: 6 }}>
              Manage games and view orders (mock data until backend endpoints exist).
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/admin">
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>

        <hr className="hr" />

        <p className="p-muted">
          Backend health check available at <code>/api/health</code> (calls backend <code>GET /</code>
          ).
        </p>
      </section>
    </main>
  );
}
