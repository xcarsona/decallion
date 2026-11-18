"use client";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ClusterPicker } from "./ClusterPicker";
import { EndView } from "./EndView";
import { Hud, type Pip } from "./Hud";
import { ModePicker } from "./ModePicker";
import { PracticeSetup } from "./PracticeSetup";
import { PromptView } from "./PromptView";
import { RevealView } from "./RevealView";
import { RoundReview } from "./RoundReview";
import { createScene, type Scene } from "./scene";
import { StatsSummary } from "@/components/log/StatsSummary";
import { useToday } from "@/components/ui/useToday";
import { STRIKES, buildRound, dailyEnabled, dayKey, match, prevDayKey } from "@/lib/game-engine";
import { ALL_CLUSTERS, CLUSTER_IDS, QUESTIONS, clusterInfo } from "@/lib/questions";
import { appendRound, makeRound } from "@/lib/log";
import { LEVELS, LEVEL_KEYS, pointsFor } from "@/lib/scoring";
import { countsNow, load, record, snapshot, subscribe, type RecordOutcome } from "@/lib/stats";
import type { ClusterChoice, LogEntry, Mode, PracticeSetup as Setup, Question } from "@/types";

type View = "clusters" | "modes" | "setup" | "play" | "climb" | "reveal" | "end";

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

  const today = useToday();
  const yesterday = prevDayKey(today);
  // Stats are read from storage, not kept here: another tab or the log page's Clear button can change them.
  const stats = useSyncExternalStore(subscribe, snapshot);
  const [sound, setSound] = useState(soundPref);
  const [view, setView] = useState<View>("clusters");
  const [mode, setMode] = useState<Mode>("daily");
  const [cluster, setCluster] = useState<ClusterChoice>("all");
  const [backFrom, setBackFrom] = useState<ClusterChoice | null>(null); // cluster to refocus in the picker after Back
  const [setup, setSetup] = useState<Setup>({ clusters: CLUSTER_IDS.slice(), diff: 0, timer: true });
  const [round, setRound] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [counts, setCounts] = useState(true);
  const [roundDay, setRoundDay] = useState(today); // the UTC day the current round was started on
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null);
  const [review, setReview] = useState<{ cluster: ClusterChoice; mode: Mode; log: LogEntry[]; score: number } | null>(null);
  const [shown, setShown] = useState(0);

  const score = log.reduce((sum, l) => sum + l.pts, 0);
  const strikes = log.filter((l) => l.level === -1).length;
  const timed = mode === "practice" ? setup.timer : true;
  const roundOver = idx + 1 >= round.length || (mode === "unlimited" && strikes >= STRIKES);

  /* Next.js keeps this page in memory while another page is open and restores it later. Leaving in the middle of a
     prompt must not hand back the same prompt with a fresh clock, so that prompt is closed as a timeout. */
  const leave = useRef(() => {});
  const resume = useRef(0);
  useEffect(() => {
    resume.current = !round.length ? 0 : mode === "unlimited" && view === "end" ? Math.min(score, 650) : score;
    leave.current = () => {
      if (view === "play" && round[idx] && !answered.current) {
        answered.current = true;
        setLog([...log, { question: round[idx], row: null, typed: "", pts: 0, level: -1, timedOut: true }]);
        setView("reveal");
      } else if (view === "climb") {
        setView("reveal"); // the climb animation stops with the scene, so go straight to the level
      }
    };
  });
  useLayoutEffect(() => () => leave.current(), []);

  useEffect(() => {
    const s = createScene(screenRef.current!, skyRef.current!, uiRef.current!, soundPref());
    s.onTick(setShown);
    s.climbTo(resume.current); // a round kept while another page was open carries on from its altitude
    scene.current = s;
    return () => {
      s.destroy();
      scene.current = null;
    };
  }, []);

  // the chosen cluster tints the screen and the elevator; the cluster picker itself stays neutral
  const chosen = view === "clusters" ? null : cluster;
  const tint = chosen ? clusterInfo(chosen).color : ALL_CLUSTERS.color;
  useEffect(() => {
    scene.current?.setAccent(tint);
  }, [tint]);

  function goHome() {
    scene.current?.reset();
    answered.current = true;
    setRound([]);
    setLog([]);
    setIdx(0);
    setBackFrom(null);
    setView("clusters");
  }

  function pick(c: ClusterChoice) {
    scene.current?.select();
    setCluster(c);
    setView("modes");
  }

  function start(m: Mode) {
    scene.current?.wake();
    if (m === "daily" && !dailyEnabled(QUESTIONS, cluster)) return;
    const day = dayKey(); // read now: the page may have been open since before midnight UTC
    const next = buildRound(QUESTIONS, m === "practice" ? { mode: m, cluster, clusters: setup.clusters, diff: setup.diff } : { mode: m, cluster, seed: day });
    if (!next.length) return goHome();
    scene.current?.reset();
    answered.current = false;
    setMode(m);
    setRound(next);
    setIdx(0);
    setLog([]);
    setOutcome(null);
    setReview(null);
    setRoundDay(day);
    setCounts(countsNow(load(), m, cluster, day)); // only the first daily run of the day counts
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
    // Add to what is in storage now, and check again that the daily was not logged elsewhere while this round ran.
    const saved = load();
    const counted = counts && countsNow(saved, mode, cluster, roundDay);
    if (counted) {
      out = record(saved, { mode, cluster, score, dayKey: roundDay, prevDayKey: prevDayKey(roundDay), log: log.map((l) => ({ cluster: l.question.cluster, topic: l.question.topic, level: l.level, pts: l.pts })) }).outcome;
    }
    // every finished round goes in the training log, including a replayed daily round that did not count
    appendRound(makeRound({ at: new Date(), day: roundDay, cluster, mode, score, counted, log }));
    setOutcome(out);
    setReview({ cluster, mode, log, score });
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
      const left = STRIKES - strikes;
      label = `PROMPT ${idx + 1} · ${left} ${left === 1 ? "MISS" : "MISSES"} LEFT`;
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

      <div className="screen" id="screen" ref={screenRef} data-cluster={chosen ?? undefined} style={{ "--cl": tint } as React.CSSProperties}>
        <canvas id="sky" ref={skyRef} aria-hidden="true" />
        <canvas id="ui" ref={uiRef} aria-hidden="true" />
        <Hud shown={shown} pips={pips} label={label} cluster={chosen} />
        {view === "clusters" && <ClusterPicker focus={backFrom} onPick={pick} />}
        {view === "modes" && (
          <ModePicker cluster={cluster} stats={stats} today={today} yesterday={yesterday} onStart={start} onPractice={() => setView("setup")} onBack={() => { setBackFrom(cluster); setView("clusters"); }} />
        )}
        {view === "setup" && <PracticeSetup cluster={cluster} setup={setup} onChange={setSetup} onGo={() => start("practice")} onBack={() => setView("modes")} />}
        {view === "play" && round[idx] && (
          <PromptView key={`${round[idx].id}-${idx}`} question={round[idx]} timed={timed} onAnswer={answer} onLastSeconds={() => scene.current?.tone(880, 0.05, 0, "square", 0.03)} />
        )}
        {view === "reveal" && last && (
          <RevealView entry={last} last={roundOver} onNext={next} missNote={mode === "unlimited" ? `Miss ${strikes} of ${STRIKES}.` : last.typed ? "Not on the board." : "The clock ran out."} />
        )}
        {view === "end" && <EndView cluster={cluster} mode={mode} log={log} score={score} outcome={outcome} day={roundDay} onAgain={() => start(mode)} onHome={goHome} />}
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
            <p>Pick a career cluster, or All clusters for a mix. Each has its own daily round, the same for everyone, changing at midnight UTC.</p>
            <p className="mute">{QUESTIONS.length} prompts across {CLUSTER_IDS.length} career clusters.</p>
          </section>
        </div>
        <div className="col">
          <StatsSummary stats={stats} cluster={chosen} today={today} yesterday={yesterday} />
          <RoundReview cluster={review?.cluster ?? cluster} mode={review?.mode ?? mode} log={review?.log ?? null} score={review?.score ?? 0} />
        </div>
      </div>
    </>
  );
}
