"use client";
import { useState } from "react";

/* Used by app/error.tsx and app/global-error.tsx. Damaged saved data is one way the game can crash on every load,
   and a player has no other way to clear it from a broken page. It imports nothing but React, so it still works when
   the rest of the site does not. */
const KEYS = ["decallion-stats-v3", "decallion-log-v1", "decallion-study-v1"];

/** Erases the saved stats, training log and study list, then reloads. The first tap only arms it. */
export function ResetSavedData({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [armed, setArmed] = useState(false);
  function tap() {
    if (!armed) {
      setArmed(true);
      window.setTimeout(() => setArmed(false), 5000);
      return;
    }
    try {
      for (const key of KEYS) localStorage.removeItem(key);
    } catch { /* storage blocked: there is nothing saved to erase */ }
    window.location.reload();
  }
  return <button type="button" id="resetData" className={className} style={style} onClick={tap}>{armed ? "Tap again to erase" : "Reset saved data"}</button>;
}
