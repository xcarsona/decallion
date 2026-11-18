"use client";
import { useEffect, useRef } from "react";

const FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

/** A modal panel that slides up over its positioned parent. Focus moves in when it opens, stays inside while it is
    open and goes back to whatever opened it on close. Esc, the Close button and a click on the backdrop close it.
    The parent marks everything behind it `inert`. */
export function Sheet({ id, title, onClose, children }: { id: string; title: string; onClose: () => void; children: React.ReactNode }) {
  const box = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    box.current?.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      const items = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1], at = document.activeElement;
      const to = !box.current.contains(at) ? first : e.shiftKey && at === first ? last : !e.shiftKey && at === last ? first : null;
      if (to) {
        e.preventDefault();
        to.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <div className="sheetwrap" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="sheet" id={id} ref={box} role="dialog" aria-modal="true" aria-labelledby={`${id}Title`}>
        <div className="sheethead">
          <h2 id={`${id}Title`}>{title}</h2>
          <button type="button" className="ghost mini" id={`${id}Close`} data-close onClick={onClose}>Close</button>
        </div>
        <div className="sheetbody" tabIndex={0} role="group" aria-labelledby={`${id}Title`}>{children}</div>
      </section>
    </div>
  );
}
