/* The animated climb, drawn on canvas, plus particle effects and sound. Knows nothing about questions or React. */
import { rng } from "@/lib/game-engine";
import { LEVELS, MISS_COLOR, ft } from "@/lib/scoring";
import type { Level } from "@/types";

export interface Scene {
  /** Move the elevator to a score. `done` fires once the car has arrived and at least `wait` ms have passed. */
  climbTo(score: number, wait?: number, done?: () => void): void;
  reset(): void;
  /** Called with the score the car is currently level with, whenever it changes. */
  onTick(fn: (shown: number) => void): void;
  fxScore(level: Level | -1): void;
  fxFinale(score: number): void;
  tone(freq: number, dur: number, delay?: number, type?: OscillatorType, vol?: number): void;
  wake(): void;
  setSound(on: boolean): void;
  destroy(): void;
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; c: string; s: number; r: number; vr: number }
interface Building { x: number; w: number; h: number; seed: number }
type RGB = [number, number, number];

const PX = 3; // size of one scene pixel on screen
const PPU = 3; // screen pixels per point of score
const TROPHY = 748;
const SKY: [number, RGB, RGB][] = [
  [0, [18, 48, 110], [58, 104, 184]],
  [150, [12, 36, 92], [38, 80, 158]],
  [300, [9, 26, 70], [24, 58, 128]],
  [450, [5, 14, 44], [14, 36, 92]],
  [600, [2, 7, 24], [9, 22, 62]],
  [760, [2, 6, 20], [12, 28, 74]],
];
const CLOUD: [number, number, number][] = [[0, 0, 30], [36, 6, 24], [-34, 8, 22], [14, -14, 22], [66, 12, 15], [-62, 14, 13]];
const color = (level: Level | -1) => (level === -1 ? MISS_COLOR : LEVELS[level].color);

export function createScene(screen: HTMLElement, sky: HTMLCanvasElement, ui: HTMLCanvasElement, soundOn: boolean): Scene {
  const g = sky.getContext("2d")!;
  const u = ui.getContext("2d")!;
  const family = getComputedStyle(screen).fontFamily; // the pixel font, as loaded by the page
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, DPR = 1;
  let alt = 0, target = 0, lastShown = -1, tPrev = 0, shake = 0, flash = 0, rain = 0, fxX = 0, fxY = 0;
  let pending: { at: number; wait: number; done: () => void } | null = null;
  let tick: (shown: number) => void = () => {};
  let frameId = 0;
  let sound = soundOn;
  let audio: AudioContext | null = null;
  const parts: Particle[] = [];

  const sr = rng(20261111);
  const stars = Array.from({ length: 110 }, () => ({ x: sr(), y: sr(), r: 0.5 + sr() * 1.3, ph: sr() * 6.28 }));
  const clouds = Array.from({ length: 16 }, () => ({ x: sr(), w: 170 + sr() * 400, f: 0.55 + sr() * 0.8, s: 0.45 + sr() * 0.7, v: (sr() - 0.5) * 0.012 }));
  const strip = (n: number, minW: number, maxW: number, minH: number, maxH: number): Building[] => {
    const out: Building[] = [];
    let x = -40;
    for (let i = 0; i < n; i++) {
      const w = minW + sr() * (maxW - minW);
      out.push({ x, w, h: minH + sr() * (maxH - minH), seed: Math.floor(sr() * 1e6) });
      x += w + 2 + sr() * 8;
    }
    return out;
  };
  const far = strip(40, 26, 60, 60, 220);
  const near = strip(30, 40, 84, 40, 160);

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = screen.clientWidth;
    H = screen.clientHeight;
    sky.width = Math.ceil(W / PX);
    sky.height = Math.ceil(H / PX);
    ui.width = Math.round(W * DPR);
    ui.height = Math.round(H * DPR);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(screen);
  resize();

  function skyAt(a: number): [string, string] {
    let i = 0;
    while (i < SKY.length - 2 && a > SKY[i + 1][0]) i++;
    const A = SKY[i], B = SKY[i + 1];
    const t = Math.max(0, Math.min(1, (a - A[0]) / (B[0] - A[0])));
    const mix = (p: RGB, q: RGB) => `rgb(${p.map((v, j) => Math.round(v + (q[j] - v) * t)).join(",")})`;
    return [mix(A[1], B[1]), mix(A[2], B[2])];
  }
  function burst(x: number, y: number, n: number, c: string, power: number) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const an = Math.random() * 6.283, sp = (40 + Math.random() * 200) * power;
      parts.push({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 80 * power, life: 0.7 + Math.random() * 0.9, c, s: 3 + Math.random() * 4, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 10 });
    }
  }
  function wake() {
    if (!sound) return;
    try {
      audio = audio ?? new AudioContext();
      if (audio.state === "suspended") void audio.resume();
    } catch { /* no audio available */ }
  }
  function tone(freq: number, dur: number, delay = 0, type: OscillatorType = "triangle", vol = 0.08) {
    if (!sound || !audio) return;
    try {
      const o = audio.createOscillator(), v = audio.createGain(), t0 = audio.currentTime + delay;
      o.type = type;
      o.frequency.value = freq;
      v.gain.setValueAtTime(vol, t0);
      v.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(v);
      v.connect(audio.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch { /* ignore */ }
  }
  function fxScore(level: Level | -1) {
    if (level === -1) {
      shake = 1;
      burst(fxX, fxY, 8, MISS_COLOR, 0.4);
      tone(140, 0.3, 0, "sawtooth", 0.05);
      return;
    }
    burst(fxX, fxY, [0, 10, 16, 24, 34, 48, 90][level], color(level), level === 6 ? 1.5 : 1);
    if (level === 6) {
      flash = 1;
      rain = 1.6;
      burst(fxX, fxY, 40, "#ffffff", 1.2);
    }
    const notes = [523, 659, 784, 988, 1175, 1568];
    for (let i = 0; i < level; i++) tone(notes[i], 0.18, i * 0.08);
  }
  function fxFinale(score: number) {
    if (score >= 600) {
      rain = 6;
      [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.3, i * 0.12));
    } else if (score >= 300) burst(fxX, fxY, 50, LEVELS[5].color, 1.2);
  }
  function building(b: Building, base: number, fill: string, win: string | null) {
    g.fillStyle = fill;
    g.fillRect(b.x, base - b.h, b.w, b.h + 4);
    if (!win) return;
    const r = rng(b.seed);
    g.fillStyle = win;
    for (let y = base - b.h + 8; y < base - 8; y += 12) for (let x = b.x + 6; x < b.x + b.w - 8; x += 10) if (r() < 0.42) g.fillRect(x, y, 4, 6);
  }

  function frame(t: number) {
    const dt = Math.min(0.05, (t - tPrev) / 1000 || 0);
    tPrev = t;
    alt += (target - alt) * (reduced ? 1 : 1 - Math.exp(-dt * 2.4));
    if (Math.abs(target - alt) < 0.3) alt = target;
    if (pending && Math.abs(target - alt) < 1 && t - pending.at > pending.wait) {
      const done = pending.done;
      pending = null;
      done();
    }
    const shown = Math.round(alt);
    if (shown !== lastShown) {
      lastShown = shown;
      tick(shown);
    }
    const cx = Math.max(56, W * 0.15), cy = H * 0.47;
    const Y = (w: number) => cy + 52 + (alt - w) * PPU;
    fxX = W / 2;
    fxY = H * 0.3;

    g.setTransform(1 / PX, 0, 0, 1 / PX, 0, 0);
    const [top, bottom] = skyAt(alt);
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, top);
    gr.addColorStop(1, bottom);
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);

    // stars
    const sa = Math.max(0, Math.min(1, (alt - 220) / 260));
    if (sa > 0) {
      g.fillStyle = "#fff";
      for (const s of stars) {
        g.globalAlpha = sa * (0.45 + 0.55 * Math.sin(t / 700 + s.ph));
        const y = (((s.y * H + alt * 0.12) % H) + H) % H;
        g.beginPath();
        g.arc(s.x * W, y, s.r, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    // arena spotlights
    const la = Math.max(0, Math.min(1, (alt - 430) / 140));
    if (la > 0) {
      for (const [ox, ph] of [[0, 0], [W, 2.1], [W * 0.5, 4.2]]) {
        const ang = Math.PI / 2 + Math.sin(t / 2300 + ph) * 0.5, len = H * 1.4, sp = 0.11;
        const lg = g.createLinearGradient(ox, 0, ox + Math.cos(ang) * len, Math.sin(ang) * len);
        lg.addColorStop(0, `rgba(127,227,242,${0.22 * la})`);
        lg.addColorStop(1, "rgba(127,227,242,0)");
        g.fillStyle = lg;
        g.beginPath();
        g.moveTo(ox, -10);
        g.lineTo(ox + Math.cos(ang - sp) * len, Math.sin(ang - sp) * len);
        g.lineTo(ox + Math.cos(ang + sp) * len, Math.sin(ang + sp) * len);
        g.closePath();
        g.fill();
      }
    }
    // clouds
    g.fillStyle = "#fff";
    for (const c of clouds) {
      c.x += c.v * dt;
      if (c.x > 1.25) c.x = -0.25;
      if (c.x < -0.25) c.x = 1.25;
      const y = cy + (alt - c.w) * PPU * c.f;
      if (y < -80 || y > H + 80) continue;
      const x = c.x * W, k = c.s;
      g.globalAlpha = 0.16;
      g.beginPath();
      for (const [dx, dy, r] of CLOUD) {
        g.moveTo(x + dx * k + r * k, y + dy * k);
        g.arc(x + dx * k, y + dy * k, r * k, 0, 6.283);
      }
      g.fill();
    }
    g.globalAlpha = 1;
    // skyline and ground
    const baseFar = cy + 52 + alt * PPU * 0.6, base = Y(0);
    if (baseFar - 240 < H) {
      for (const b of far) if (b.x < W) building(b, baseFar, "#0b2152", null);
      g.fillStyle = "#0b2152";
      g.fillRect(0, baseFar, W, H);
    }
    if (base - 180 < H) {
      for (const b of near) if (b.x < W) building(b, base, "#061533", "rgba(242,193,78,.55)");
      g.fillStyle = "#061533";
      g.fillRect(0, base, W, H);
    }
    // altitude ruler on the right edge, drawn sharp on the overlay canvas
    u.setTransform(DPR, 0, 0, DPR, 0, 0);
    u.clearRect(0, 0, W, H);
    u.font = `17px ${family}`;
    u.textBaseline = "middle";
    u.textAlign = "right";
    u.lineWidth = 2;
    const lo = Math.max(0, Math.floor((alt - (H - cy) / PPU) / 10) * 10), hi = alt + cy / PPU + 10, yy = cy + 52;
    for (let w = lo; w <= hi; w += 10) {
      const y = Math.round(Y(w)), major = w % 50 === 0;
      u.strokeStyle = "rgba(143,165,201,.7)";
      u.beginPath();
      u.moveTo(W, y);
      u.lineTo(W - (major ? 20 : 9), y);
      u.stroke();
      if (major && y > 78 && Math.abs(y - yy) > 11) {
        u.fillStyle = "rgba(143,165,201,.95)";
        u.fillText(w === 0 ? "GROUND" : `${ft(w)} ft`, W - 25, y);
      }
    }
    u.strokeStyle = "#f2c14e";
    u.beginPath();
    u.moveTo(W, yy);
    u.lineTo(W - 26, yy);
    u.stroke();
    u.fillStyle = "#f2c14e";
    u.fillText("YOU", W - 31, yy);
    // the glass, waiting above 7,000 ft
    const ty = Y(TROPHY);
    if (ty > -80 && ty < H + 80) {
      const pu = 0.75 + 0.25 * Math.sin(t / 500), rg = g.createRadialGradient(cx, ty, 4, cx, ty, 90);
      rg.addColorStop(0, `rgba(127,227,242,${0.45 * pu})`);
      rg.addColorStop(1, "rgba(127,227,242,0)");
      g.fillStyle = rg;
      g.fillRect(cx - 90, ty - 90, 180, 180);
      g.beginPath();
      [[0, -30], [17, -12], [11, 22], [-11, 22], [-17, -12]].forEach(([x, y], i) => (i ? g.lineTo(cx + x, ty + y) : g.moveTo(cx + x, ty + y)));
      g.closePath();
      g.fillStyle = "rgba(190,244,252,.35)";
      g.fill();
      g.strokeStyle = "#d8fbff";
      g.lineWidth = 1.5;
      g.stroke();
      g.fillStyle = "#f2c14e";
      g.fillRect(cx - 16, ty + 22, 32, 6);
      g.fillRect(cx - 22, ty + 28, 44, 5);
    }
    // elevator car
    const bob = reduced ? 0 : Math.sin(t / 600) * 3, sx = shake > 0 ? (Math.random() - 0.5) * shake * 12 : 0;
    shake = Math.max(0, shake - dt * 2.5);
    const X = cx + sx, Yc = cy + bob;
    g.strokeStyle = "rgba(238,243,251,.28)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(X, Yc - 50);
    g.lineTo(cx, -10);
    g.stroke();
    const rising = target - alt;
    if (rising > 2 && !reduced) {
      g.strokeStyle = "rgba(127,227,242,.55)";
      for (let i = 0; i < 7; i++) {
        const lx = X - 30 + i * 10, l = 14 + Math.random() * Math.min(70, rising * 2);
        g.beginPath();
        g.moveTo(lx, Yc + 54);
        g.lineTo(lx, Yc + 54 + l);
        g.stroke();
      }
    }
    g.save();
    g.translate(X, Yc);
    g.scale(1.5, 1.5);
    g.translate(-X, -Yc);
    g.beginPath();
    g.roundRect(X - 23, Yc - 30, 46, 62, 9);
    g.fillStyle = "rgba(127,227,242,.16)";
    g.fill();
    g.strokeStyle = "#7fe3f2";
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = "#7fe3f2";
    g.fillRect(X - 27, Yc - 34, 54, 5);
    g.fillRect(X - 27, Yc + 30, 54, 5);
    g.fillStyle = "#eef3fb";
    g.beginPath();
    g.arc(X, Yc - 9, 6.5, 0, 6.283);
    g.fill();
    g.beginPath();
    g.moveTo(X - 12, Yc + 28);
    g.lineTo(X - 10, Yc + 4);
    g.quadraticCurveTo(X, Yc - 3, X + 10, Yc + 4);
    g.lineTo(X + 12, Yc + 28);
    g.closePath();
    g.fillStyle = "#1b3f8f";
    g.fill();
    g.strokeStyle = "#eef3fb";
    g.lineWidth = 1;
    g.stroke();
    g.fillStyle = "#f2c14e";
    g.beginPath();
    g.moveTo(X - 1.6, Yc + 2);
    g.lineTo(X + 1.6, Yc + 2);
    g.lineTo(X + 2.2, Yc + 12);
    g.lineTo(X, Yc + 15);
    g.lineTo(X - 2.2, Yc + 12);
    g.closePath();
    g.fill();
    g.restore();
    // confetti
    if (rain > 0 && !reduced) {
      rain -= dt;
      const cs = [LEVELS[6].color, LEVELS[5].color, "#ffffff", LEVELS[3].color];
      for (let i = 0; i < 3; i++) parts.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 60, vy: 60 + Math.random() * 120, life: 3.5, c: cs[i % 4], s: 4 + Math.random() * 4, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 8 });
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0 || p.y > H + 20) {
        parts.splice(i, 1);
        continue;
      }
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.globalAlpha = Math.min(1, p.life * 2);
      g.fillStyle = p.c;
      g.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
      g.restore();
    }
    g.globalAlpha = 1;
    if (flash > 0) {
      g.fillStyle = `rgba(200,246,255,${flash * 0.35})`;
      g.fillRect(0, 0, W, H);
      flash = Math.max(0, flash - dt * 2);
    }
    frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);

  return {
    climbTo(score, wait = 0, done) {
      target = score;
      pending = done ? { at: performance.now(), wait, done } : null;
    },
    reset() {
      target = 0;
      pending = null;
      rain = 0;
    },
    onTick(fn) {
      tick = fn;
      lastShown = -1;
    },
    fxScore,
    fxFinale,
    tone,
    wake,
    setSound(on) {
      sound = on;
    },
    destroy() {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      pending = null;
      void audio?.close();
    },
  };
}
