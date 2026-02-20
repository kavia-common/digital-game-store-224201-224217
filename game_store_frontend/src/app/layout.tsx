import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

export const metadata: Metadata = {
  title: "Retro Game Store",
  description: "A retro-themed digital game store (catalog, cart, wishlist, orders, admin).",
};

function Footer() {
  return (
    <footer className="container-page">
      <div className="surface retro-border card">
        <div className="card-row">
          <div>
            <div className="h2">Retro Game Store</div>
            <p className="p-muted">
              Mock checkout (no payment provider configured). Wired for backend at{" "}
              <code>NEXT_PUBLIC_API_BASE_URL</code>.
            </p>
          </div>
          <div className="p-muted">© {new Date().getFullYear()}</div>
        </div>
      </div>
    </footer>
  );
}

function NavBar() {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <span className="brand-badge">RETRO</span>
          <span className="brand-title">Game Store</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link className="nav-link" href="/catalog">
            Catalog
          </Link>
          <Link className="nav-link" href="/wishlist">
            Wishlist
          </Link>
          <Link className="nav-link" href="/cart">
            Cart
          </Link>
          <Link className="nav-link" href="/orders">
            Orders
          </Link>
          <Link className="nav-link" href="/admin">
            Admin
          </Link>
          <Link className="btn btn-primary" href="/auth">
            Login / Signup
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <NavBar />
              {children}
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
