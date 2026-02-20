"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";

export type CartLine = { gameId: string; qty: number };

type CartContextValue = {
  items: CartLine[];
  add: (gameId: string) => void;
  remove: (gameId: string) => void;
  setQty: (gameId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const LS_KEY = "dgs_cart";

// PUBLIC_INTERFACE
export function CartProvider({ children }: { children: React.ReactNode }) {
  /** Provides cart state and mutations. */
  const [items, setItems] = useState<CartLine[]>(() => readJson<CartLine[]>(LS_KEY, []));

  const persist = useCallback((next: CartLine[]) => {
    setItems(next);
    writeJson(LS_KEY, next);
  }, []);

  const add = useCallback(
    (gameId: string) => {
      const next = [...items];
      const idx = next.findIndex((x) => x.gameId === gameId);
      if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      else next.push({ gameId, qty: 1 });
      persist(next);
    },
    [items, persist]
  );

  const remove = useCallback(
    (gameId: string) => {
      persist(items.filter((x) => x.gameId !== gameId));
    },
    [items, persist]
  );

  const setQty = useCallback(
    (gameId: string, qty: number) => {
      const safeQty = Number.isFinite(qty) ? Math.max(1, Math.min(99, Math.floor(qty))) : 1;
      const next = items.map((x) => (x.gameId === gameId ? { ...x, qty: safeQty } : x));
      persist(next);
    },
    [items, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<CartContextValue>(() => ({ items, add, remove, setQty, clear }), [
    items,
    add,
    remove,
    setQty,
    clear,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// PUBLIC_INTERFACE
export function useCart(): CartContextValue {
  /** Hook to access cart state and mutations. */
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
