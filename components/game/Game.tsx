"use client";
import { useEffect, useRef, useState } from "react";
import { EndView } from "./EndView";
import { HomeMenu } from "./HomeMenu";
import { Hud, type Pip } from "./Hud";
import { PracticeSetup } from "./PracticeSetup";
import { PromptView } from "./PromptView";
import { RevealView } from "./RevealView";
import { RoundReview } from "./RoundReview";
import { StatsPanel } from "./StatsPanel";
import { createScene, type Scene } from "./scene";
import { STRIKES, buildRound, dayKey, match, prevDayKey } from "@/lib/game-engine";
import { CLUSTER_IDS, QUESTIONS } from "@/lib/questions";
import { LEVELS, LEVEL_KEYS, pointsFor } from "@/lib/scoring";
import { dailyOf, load, record, reset, type RecordOutcome } from "@/lib/stats";
import type { ClusterChoice, LogEntry, Mode, PracticeSetup as Setup, Question } from "@/types";

type View = "home" | "setup" | "play" | "climb" | "reveal" | "end";

function soundPref(): boolean {
  try {
    return localStorage.getItem("decallion-snd") !== "off";
  } catch {
    return true;
  }
}

/* Owns the round state and the flow between screens. Rules live in lib/, drawing in scene.ts. */
export default function Game() {
  const screenRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);
  const answered = useRef(true);

  const [today] = useState(() => dayKey());
  const yesterday = prevDayKey(today);
  const [stats, setStats] = useState(load);
  const [sound, setSound] = useState(soundPref);
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("daily");
  const [cluster] = useState<ClusterChoice>("all");
  const [setup, setSetup] = useState<Setup>({ clusters: CLUSTER_IDS.slice(), diff: 0, timer: true });
  const [round, setRound] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [counts, setCounts] = useState(true);
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null);
  const [review, setReview] = useState<{ mode: Mode; log: LogEntry[]; score: number } | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const s = createScene(screenRef.current!, skyRef.current!, uiRef.current!, soundPref());
    s.onTick(setShown);
    scene.current = s;
    return () => {
      s.destroy();
      scene.current = null;
    };
  }, []);

  const score = log.reduce((sum, l) => sum + l.pts, 0);
  const strikes = log.filter((l) => l.level === -1).length;
  const timed = mode === "practice" ? setup.timer : true;
  const roundOver = idx + 1 >= round.length || (mode === "unlimited" && strikes >= STRIKES);

  function goHome() {
    scene.current?.reset();
    answered.current = true;
    setRound([]);
    setLog([]);
    setIdx(0);
    setView("home");
  }

  function start(m: Mode) {
    scene.current?.wake();
    const next = buildRound(QUESTIONS, m === "practice" ? { mode: m, cluster, clusters: setup.clusters, diff: setup.diff } : { mode: m, cluster, seed: today });
    if (!next.length) return goHome();
    scene.current?.reset();
    answered.current = false;
    setMode(m);
    setRound(next);
    setIdx(0);
    setLog([]);
    setOutcome(null);
    setReview(null);
    setCounts(m !== "daily" || dailyOf(stats, cluster).last !== today); // only the first daily run of the day counts
    setView("play");
  }

  function answer(text: string, timedOut: boolean) {
    if (answered.current) return;
    answered.current = true;
    const question = round[idx];
    const row = match(question, text);
    const entry: LogEntry = { question, row, typed: text.trim(), pts: pointsFor(row), level: row ? row[1] : -1, timedOut };
    const nextLog = [...log, entry];
    setLog(nextLog);
    setView("climb"); // clear the screen and let the climb play before the level is shown
    scene.current?.climbTo(score + entry.pts, row ? 500 : 700, () => {
      setView("reveal");
      scene.current?.fxScore(entry.level);
    });
  }

  function next() {
    if (roundOver) return finish();
    answered.current = false;
    setIdx(idx + 1);
    setView("play");
  }

  function finish() {
    let out: RecordOutcome | null = null;
    if (counts) {
      const result = record(stats, { mode, cluster, score, dayKey: today, prevDayKey: yesterday, log: log.map((l) => ({ cluster: l.question.cluster, topic: l.question.topic, level: l.level, pts: l.pts })) });
      setStats(result.stats);
      out = result.outcome;
    }
    setOutcome(out);
    setReview({ mode, log, score });
    setView("end");
    scene.current?.fxFinale(mode === "unlimited" ? Math.min(score, 650) : score);
  }

  function toggleSound() {
    const on = !sound;
    setSound(on);
    scene.current?.setSound(on);
    if (on) scene.current?.wake();
    try {
      localStorage.setItem("decallion-snd", on ? "on" : "off");
    } catch { /* storage blocked */ }
  }

  let pips: Pip[] = [];
  let label = "READY";
  if (round.length) {
    if (mode === "unlimited") {
      pips = Array.from({ length: STRIKES }, (_, i) => (i < STRIKES - strikes ? "now" : ""));
      label = `PROMPT ${idx + 1} · ${STRIKES - strikes} MISSES LEFT`;
    } else {
      pips = round.map((_, i) => (i < log.length ? "done" : i === idx ? "now" : ""));
      label = `PROMPT ${idx + 1} OF ${round.length}`;
    }
    if (view === "end") label = "FINAL";
  }
  const last = log[log.length - 1];

  return (
    <>
      <div className="toolbar">
        <span className="mute">Rare-answer business trivia for DECA competitors</span>
        <div className="row">
          <button type="button" className="ghost mini" id="homeBtn" onClick={goHome}>Home</button>
          <button type="button" className="ghost mini" id="snd" aria-pressed={sound} onClick={toggleSound}>{sound ? "Sound on" : "Sound off"}</button>
        </div>
      </div>

      <div className="screen" id="screen" ref={screenRef}>
        <canvas id="sky" ref={skyRef} aria-hidden="true" />
        <canvas id="ui" ref={uiRef} aria-hidden="true" />
        <Hud shown={shown} pips={pips} label={label} />
        {view === "home" && <HomeMenu dailyScore={dailyOf(stats, cluster).last === today ? dailyOf(stats, cluster).score : null} onStart={start} onPractice={() => setView("setup")} />}
        {view === "setup" && <PracticeSetup setup={setup} onChange={setSetup} onGo={() => start("practice")} onBack={goHome} />}
        {view === "play" && round[idx] && (
          <PromptView key={`${round[idx].id}-${idx}`} question={round[idx]} timed={timed} onAnswer={answer} onLastSeconds={() => scene.current?.tone(880, 0.05, 0, "square", 0.03)} />
        )}
        {view === "reveal" && last && (
          <RevealView entry={last} last={roundOver} onNext={next} missNote={mode === "unlimited" ? `Miss ${strikes} of ${STRIKES}.` : last.typed ? "Not on the board." : "The clock ran out."} />
        )}
        {view === "end" && <EndView mode={mode} log={log} score={score} outcome={outcome} day={today} onAgain={() => start(mode)} onHome={goHome} />}
      </div>

      <div className="below">
        <div className="col">
          <section className="card">
            <h2>Answer levels</h2>
            <ul className="tiers">
              {LEVEL_KEYS.map((k) => (
                <li key={k} className={`c${k}`}><b style={{ fontWeight: 400 }}>{LEVELS[k].name}</b><span>+{LEVELS[k].pts} pts</span></li>
              ))}
            </ul>
            <p className="mute">1 point is 10 ft. Seven prompts top out at 7,000 ft. Wrong answers and timeouts add nothing.</p>
          </section>
          <section className="card">
            <h2>How it works</h2>
            <p>Every prompt has many correct answers. Type one. You get a single answer and 25 seconds.</p>
            <p>The fewer competitors likely to give your answer, the higher its level. Answer boards stay sealed until the round ends.</p>
            <p>The daily round is the same for everyone and changes at midnight UTC.</p>
            <p className="mute">{QUESTIONS.length} prompts across {CLUSTER_IDS.length} career clusters.</p>
          </section>
        </div>
        <div className="col">
          <StatsPanel stats={stats} cluster={cluster} today={today} yesterday={yesterday} onReset={() => { setStats(reset()); goHome(); }} />
          <RoundReview mode={review?.mode ?? mode} log={review?.log ?? null} score={review?.score ?? 0} />
        </div>
      </div>
    </>
  );
}
