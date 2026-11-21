"use client";
import { useEffect, useRef, useState } from "react";
import "./splash.css";

/* The opening loading screen. It covers the page while the game loads, cutting between four heavily pixelated
   event photos, then gets out of the way. The photos in public/splash are a few dozen blocks across, so no face,
   name badge or logo in them can be made out. It is shown once per full page load. */
const SCENES = ["arena", "hall", "plaza", "stage"] as const;
const BLOCKS = 16;
/** The shortest time the screen stays up, so it does not flash by on a fast connection. */
const MIN_MS = 2600;
const MIN_MS_REDUCED = 900;
const CUT_MS = 650;
const OUT_MS = 320;

type Phase = "loading" | "leaving" | "gone";

export function Splash() {
  const [scene, setScene] = useState(0);
  const [filled, setFilled] = useState(0);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const min = reduced ? MIN_MS_REDUCED : MIN_MS;
    const started = performance.now();
    // the first scene is fixed so the server and the browser draw the same thing; after that the order is shuffled
    const rest = [1, 2, 3].sort(() => Math.random() - 0.5);
    const order = [0, ...rest];
    let cut = 0;
    let done = false;
    let out = 0;
    const gameLoaded = () => document.getElementById("screen") !== null;

    function leave() {
      if (done) return;
      done = true;
      window.clearInterval(timer);
      setFilled(BLOCKS);
      setPhase("leaving");
      out = window.setTimeout(() => setPhase("gone"), reduced ? 0 : OUT_MS);
    }
    const timer = window.setInterval(() => {
      const t = performance.now() - started;
      const loaded = gameLoaded();
      setReady(loaded);
      // the bar never completes before the game is there
      setFilled(Math.floor(Math.min(1, t / min, loaded ? 1 : 0.9) * BLOCKS));
      const nextCut = Math.floor(t / CUT_MS);
      if (!reduced && nextCut !== cut) {
        cut = nextCut;
        setScene(order[cut % order.length]);
      }
      if (loaded && t >= min) leave();
    }, 80);

    // a click or a key press skips the wait once the game is ready
    skip.current = () => {
      if (gameLoaded()) leave();
    };
    const onKey = () => skip.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(out);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className={phase === "leaving" ? "splash out" : "splash"} id="splash" role="status" aria-label="Loading Decallion" onClick={() => skip.current()}>
      {SCENES.map((name, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- tiny pixel tiles drawn with hard edges; the image optimiser would smooth them
        <img key={name} src={`/splash/${name}.png`} alt="" aria-hidden="true" className={i === scene ? "on" : undefined} />
      ))}
      <div className="splashbox">
        <div className="splashtitle" aria-hidden="true">Deca<span>llion</span></div>
        <p className="splashtag">The answer nobody else gives climbs highest.</p>
        <div className="splashbar" aria-hidden="true">
          {Array.from({ length: BLOCKS }, (_, i) => <i key={i} className={i < filled ? "on" : undefined} />)}
        </div>
        <p className="splashstate" id="splashState">{ready && filled >= BLOCKS ? "Ready" : "Loading"}</p>
      </div>
      <p className="splashfine">Unofficial practice game. Not affiliated with or endorsed by DECA Inc.</p>
    </div>
  );
}
