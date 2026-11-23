"use client";
import { useEffect, useRef, useState } from "react";

/** Countdown ring. Mount it with a fresh `key` for each prompt. */
export function Clock({ seconds, timed, onExpire, onLastSeconds }: { seconds: number; timed: boolean; onExpire: () => void; onLastSeconds: () => void }) {
  const [left, setLeft] = useState(seconds * 1000);
  const expire = useRef(onExpire);
  const beep = useRef(onLastSeconds);
  useEffect(() => {
    expire.current = onExpire;
    beep.current = onLastSeconds;
  });
  useEffect(() => {
    if (!timed) return;
    const deadline = performance.now() + seconds * 1000;
    let id = 0;
    let lastSec = 0;
    const tick = (now: number) => {
      // a frame's timestamp can be a little earlier than the moment the deadline was set, so cap at the full time
      const ms = Math.min(seconds * 1000, Math.max(0, deadline - now));
      const sec = Math.ceil(ms / 1000);
      setLeft(ms);
      if (ms < 5000 && sec > 0 && sec !== lastSec) {
        lastSec = sec;
        beep.current();
      }
      if (ms <= 0) {
        expire.current();
        return;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [seconds, timed]);

  // role="timer" names what this is; a timer is not read out as it changes (its live setting is "off" by default),
  // so a screen reader hears the time only when the player moves to it
  if (!timed) return <div className="clock" role="timer" aria-label="No time limit">∞</div>;
  const style = { "--t": left / (seconds * 1000) } as React.CSSProperties;
  return (
    <div className={left < 6000 ? "clock low" : "clock"} style={style} role="timer" aria-live="off" aria-label="Seconds left">
      {Math.ceil(left / 1000)}
    </div>
  );
}
