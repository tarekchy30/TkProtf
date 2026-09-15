import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ReactionCelebration from "./ReactionCelebration";

const ReactionContext = createContext(null);

export function ReactionProvider({ children }) {
  const [celebration, setCelebration] = useState(null);

  const celebrate = useCallback((reaction, origin) => {
    setCelebration({
      id: Date.now(),
      reaction,
      origin: origin || {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      },
    });
  }, []);

  const value = useMemo(() => ({ celebrate }), [celebrate]);

  return (
    <ReactionContext.Provider value={value}>
      {children}
      <ReactionCelebration celebration={celebration} />
    </ReactionContext.Provider>
  );
}

export function useReactionCelebration() {
  const context = useContext(ReactionContext);
  if (!context) {
    throw new Error("useReactionCelebration must be used within ReactionProvider");
  }
  return context;
}
