"use client";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ClusterPicker } from "./ClusterPicker";
import { EndView } from "./EndView";
import { Hud, type Pip } from "./Hud";
import { Intro } from "./Intro";
import { ModePicker } from "./ModePicker";
import { PracticeSetup } from "./PracticeSetup";
import { PromptView } from "./PromptView";
import { RevealView } from "./RevealView";
import { RoundReview } from "./RoundReview";
import { createScene, type Scene } from "./scene";
import { StatsSummary } from "@/components/log/StatsSummary";
import { Sheet } from "@/components/ui/Sheet";
import { useToday } from "@/components/ui/useToday";
import { STRIKES, buildRound, dailyEnabled, dayKey, match, prevDayKey } from "@/lib/game-engine";
import { ALL_CLUSTERS, CLUSTER_IDS, QUESTIONS, clusterInfo } from "@/lib/questions";
import { appendRound, makeRound } from "@/lib/log";
import { LEVELS, LEVEL_KEYS, pointsFor } from "@/lib/scoring";
import { countsNow, load, record, snapshot, subscribe, type RecordOutcome } from "@/lib/stats";
import type { ClusterChoice, LogEntry, Mode, PracticeSetup as Setup, Question } from "@/types";

type View = "clusters" | "modes" | "setup" | "intro" | "play" | "climb" | "reveal" | "end";
type Panel = "help" | "review" | null;

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
  const [roundDay, setRoundDay] = useState(today); // the day (Eastern Time) the current round was started on
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
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
      setPanel(null); // a panel left open would still be open, and holding focus, on the way back
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
    setPanel(null);
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
    const day = dayKey(); // read now: the page may have been open since before midnight
    const next = buildRound(QUESTIONS, m === "practice" ? { mode: m, cluster, clusters: setup.clusters, diff: setup.diff } : { mode: m, cluster, seed: day });
    if (!next.length) return goHome();
    scene.current?.reset();
    answered.current = false;
    setMode(m);
    setRound(next);
    setIdx(0);
    setLog([]);
    setOutcome(null);
    setPanel(null);
    setRoundDay(day);
    setCounts(countsNow(load(), m, cluster, day)); // only the first daily run of the day counts
    setView("intro"); // the first prompt and its clock wait for the intro card
    [392, 523, 784].forEach((f, i) => scene.current?.tone(f, i === 2 ? 0.22 : 0.11, i * 0.13, i === 2 ? "triangle" : "square", i === 2 ? 0.07 : 0.035));
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
    setView("end");
  }

  /* The results screen counts the score up: a tick that rises in pitch, then the finale when the count lands. */
  function countTick(progress: number) {
    scene.current?.tone(520 + progress * 620, 0.03, 0, "square", 0.022);
  }
  function countLanded() {
    scene.current?.tone(1047, 0.2, 0, "triangle", 0.06);
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

  // Answer boards open only once the round has ended, and close again when the player moves on.
  const open: Panel = panel === "review" && view !== "end" ? null : panel;

  return (
    <div className="screen" id="screen" ref={screenRef} data-cluster={chosen ?? undefined} data-view={view} style={{ "--cl": tint } as React.CSSProperties}>
      <canvas id="sky" ref={skyRef} aria-hidden="true" />
      <canvas id="ui" ref={uiRef} aria-hidden="true" />
      <div className="stage" inert={open !== null}>
        <div className="sbar">
          <span className="mute tagline">Rare-answer business trivia for DECA competitors</span>
          <div className="tools">
            <button type="button" className="ghost mini" id="homeBtn" onClick={goHome}>Home</button>
            <button type="button" className="ghost mini" id="helpBtn" aria-haspopup="dialog" onClick={() => setPanel("help")}>How to play</button>
            <button type="button" className="ghost mini" id="snd" aria-pressed={sound} onClick={toggleSound}>{sound ? "Sound on" : "Sound off"}</button>
          </div>
        </div>
        <Hud shown={shown} pips={pips} label={label} cluster={chosen} />
        {view === "clusters" && <ClusterPicker focus={backFrom} onPick={pick} />}
        {view === "modes" && (
          <ModePicker cluster={cluster} stats={stats} today={today} yesterday={yesterday} onStart={start} onPractice={() => setView("setup")} onBack={() => { setBackFrom(cluster); setView("clusters"); }} />
        )}
        {view === "setup" && <PracticeSetup cluster={cluster} setup={setup} onChange={setSetup} onGo={() => start("practice")} onBack={() => setView("modes")} />}
        {view === "intro" && <Intro cluster={cluster} mode={mode} prompts={round.length} timed={timed} onDone={() => setView("play")} />}
        {view === "play" && round[idx] && (
          <PromptView key={`${round[idx].id}-${idx}`} question={round[idx]} timed={timed} onAnswer={answer} onLastSeconds={() => scene.current?.tone(880, 0.05, 0, "square", 0.03)} onWrongTry={() => scene.current?.tone(150, 0.16, 0, "sawtooth", 0.04)} />
        )}
        {view === "reveal" && last && (
          <RevealView entry={last} last={roundOver} onNext={next} missNote={mode === "unlimited" ? `Miss ${strikes} of ${STRIKES}.` : last.timedOut ? "The clock ran out." : last.typed ? "Not on the board." : "Skipped."} />
        )}
        {view === "end" && (
          <EndView cluster={cluster} mode={mode} log={log} score={score} outcome={outcome} day={roundDay} onTick={countTick} onLand={countLanded} onAgain={() => start(mode)} onReview={() => setPanel("review")} onHome={goHome} />
        )}
      </div>

      {open === "help" && (
        <Sheet id="helpPanel" title="How to play" onClose={() => setPanel(null)}>
          {view === "play" && timed && <p className="warn" id="helpClock">The clock keeps running while this is open.</p>}
          <div className="helpgrid">
            <section>
              <h3>How it works</h3>
              <p>Every prompt has many correct answers. Type one. You have 25 seconds.</p>
              <p>If your answer is not on the board, try another until the clock runs out. The first answer that is on the board is final, so you cannot swap it for a rarer one.</p>
              <p>The fewer competitors likely to give your answer, the higher its level. Answer boards stay sealed until the round ends.</p>
              <p>Pick a career cluster, or All clusters for a mix. Each has its own daily round, the same for everyone. It changes at midnight Eastern Time.</p>
              <p className="mute">{QUESTIONS.length} prompts across {CLUSTER_IDS.length} career clusters.</p>
            </section>
            <section>
              <h3>Answer levels</h3>
              <ul className="tiers">
                {LEVEL_KEYS.map((k) => (
                  <li key={k} className={`c${k}`}><b>{LEVELS[k].name}</b><span>+{LEVELS[k].pts} pts</span></li>
                ))}
              </ul>
              <p className="mute">1 point is 10 ft. Seven prompts top out at 7,000 ft. Wrong answers and timeouts add nothing.</p>
            </section>
          </div>
          <StatsSummary stats={stats} cluster={chosen} today={today} yesterday={yesterday} />
        </Sheet>
      )}
      {open === "review" && (
        <Sheet id="reviewPanel" title="Round review" onClose={() => setPanel(null)}>
          <RoundReview cluster={cluster} mode={mode} log={log} score={score} />
        </Sheet>
      )}
    </div>
  );
}
