"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";

type WishlistContextValue = {
  ids: string[];
  toggle: (gameId: string) => void;
  has: (gameId: string) => boolean;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const LS_KEY = "dgs_wishlist";

// PUBLIC_INTERFACE
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  /** Provides wishlist state and mutations. */
  const [ids, setIds] = useState<string[]>(() => readJson<string[]>(LS_KEY, []));

  const persist = useCallback((next: string[]) => {
    setIds(next);
    writeJson(LS_KEY, next);
  }, []);

  const toggle = useCallback(
    (gameId: string) => {
      const next = ids.includes(gameId) ? ids.filter((x) => x !== gameId) : [...ids, gameId];
      persist(next);
    },
    [ids, persist]
  );

  const has = useCallback((gameId: string) => ids.includes(gameId), [ids]);

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(() => ({ ids, toggle, has, clear }), [ids, toggle, has, clear]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

// PUBLIC_INTERFACE
export function useWishlist(): WishlistContextValue {
  /** Hook to access wishlist state and mutations. */
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
