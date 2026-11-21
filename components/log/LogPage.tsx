"use client";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ClusterIcon } from "@/components/game/ClusterIcon";
import { AddMissedBoards, AnswerBoard, AnswerBoards } from "@/components/study/AnswerBoard";
import { useToday } from "@/components/ui/useToday";
import { DIFFS, prevDayKey } from "@/lib/game-engine";
import {
  LOG_CAP, MODES, MODE_LABEL, clearLog, clusterSummaries, filterRounds, isLogPersistent, levelName, logSnapshot, matchedRow, overall,
  questionIndex, roundsNotListed, subscribeLog, toCsv, topicBreakdown, type LogFilter, type LoggedRound,
} from "@/lib/log";
import { CLUSTER_CHOICES, CLUSTER_IDS, QUESTIONS, clusterInfo } from "@/lib/questions";
import { ft } from "@/lib/scoring";
import { isPersistent, reset as resetStats, snapshot as statsSnapshot, subscribe as subscribeStats } from "@/lib/stats";
import type { ClusterChoice, Question } from "@/types";

const PAGE = 25;
const CLUSTER_FILTERS: [LogFilter["cluster"], string][] = [["any", "All rounds"], ...CLUSTER_CHOICES.map((c): [LogFilter["cluster"], string] => [c, clusterInfo(c).short])];
const MODE_FILTERS: [LogFilter["mode"], string][] = [["any", "All"], ...MODES.map((m): [LogFilter["mode"], string] => [m, MODE_LABEL[m]])];
const TOPIC_FILTERS: [ClusterChoice, string][] = [["all", "All clusters"], ...CLUSTER_IDS.map((c): [ClusterChoice, string] => [c, clusterInfo(c).short])];

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const altitude = (points: number) => (points > 0 ? `${ft(points)} ft` : "–");
const tint = (cluster: ClusterChoice) => ({ "--cc": clusterInfo(cluster).color }) as React.CSSProperties;

function Chips<T extends string>({ id, label, options, value, onChange }: { id: string; label: string; options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="chips" id={id} role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" data-value={v} aria-pressed={value === v} onClick={() => onChange(v)}>{text}</button>
      ))}
    </div>
  );
}

/* The answer boards for one logged round, in the same layout as the round review under the game. The log's Clear
   button erases the log and the stats only: the study list is separate. */
function RoundBoards({ round, byId }: { round: LoggedRound; byId: Map<string, Question> }) {
  const missed = round.entries.filter((e) => e.level === -1).map((e) => byId.get(e.id)).filter((q): q is Question => !!q);
  return (
    <div className="logboards" id={`boards-${round.id}`}>
      <div className="reviewtools">
        <p className="mute">Pick an answer to see what it means and add it to your study list.</p>
        <AddMissedBoards className="addMissed" questions={missed} />
      </div>
      {round.entries.map((e, i) => {
        const q = byId.get(e.id);
        const row = matchedRow(q, e);
        const you = e.level === -1 ? `You: ${e.typed || "no answer"} · No credit${e.timedOut ? " · Time ran out" : ""}` : `You: ${row ? row[0] : e.typed} · ${levelName(e.level)} +${e.pts}`;
        return (
          <div className="rev" key={i} data-prompt={e.id}>
            <div className="q">{q ? q.q : `Prompt ${e.id}`}</div>
            <div className={`you ${e.level === -1 ? "cx" : `c${e.level}`}`}>{you}</div>
            {q ? (
              <>
                <AnswerBoard question={q} mine={row} />
                <div className="why">{q.why}</div>
                <div className="tag">{q.topic} · {q.area} · {DIFFS[q.diff]} · {q.id}</div>
              </>
            ) : (
              <div className="tag">This prompt was removed from the game, so its answer board is not available.</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LogPage() {
  /* Both are read from storage, not copied into state: Next.js keeps this page in memory while the game is open,
     and rounds finished there (or in another tab) must show up when it is opened again. */
  const stats = useSyncExternalStore(subscribeStats, statsSnapshot);
  const log = useSyncExternalStore(subscribeLog, logSnapshot);
  const today = useToday();
  const [filter, setFilter] = useState<LogFilter>({ cluster: "any", mode: "any" });
  const [topicCluster, setTopicCluster] = useState<ClusterChoice>("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [limit, setLimit] = useState(PAGE);
  const [armed, setArmed] = useState(false);

  const byId = useMemo(() => questionIndex(QUESTIONS), []);
  const totals = overall(stats);
  const clusters = clusterSummaries(stats, today, prevDayKey(today));
  const topics = topicBreakdown(stats, topicCluster);
  const rounds = filterRounds(log, filter);
  const visible = rounds.slice(0, limit);
  const notListed = roundsNotListed(stats, log);
  const empty = stats.games === 0 && log.length === 0;
  const saved = isPersistent() && isLogPersistent();

  const setFilterPart = (part: Partial<LogFilter>) => {
    setFilter({ ...filter, ...part });
    setLimit(PAGE);
  };
  const exportCsv = () => {
    // the BOM lets spreadsheet apps read accented letters correctly
    const url = URL.createObjectURL(new Blob(["﻿", toCsv(log, QUESTIONS)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "decallion-log.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const clear = () => {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000);
      return;
    }
    clearLog();
    resetStats();
    setOpen({});
    setLimit(PAGE);
    setArmed(false);
  };
  const storageNote = saved ? "Saved in this browser only." : "This browser is blocking storage, so the log lasts only until you close the page.";

  if (empty) {
    return (
      <div className="logpage" id="logPage">
        <section className="card" id="logEmpty">
          <h2>Training log</h2>
          <p>No rounds yet. <Link href="/">Play a round</Link> and it will show up here with every answer board.</p>
          <p className="mute">{storageNote}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="logpage" id="logPage">
      <section className="card">
        <div className="headrow">
          <h2>Training log</h2>
          <div className="row">
            <button type="button" className="ghost mini" id="logExport" onClick={exportCsv} disabled={log.length === 0}>Export CSV</button>
            <button type="button" className="ghost mini" id="logClear" onClick={clear}>{armed ? "Click again to erase" : "Clear log and stats"}</button>
          </div>
        </div>
        <div className="figs" id="logFigs">
          <div><b>{totals.rounds}</b><span>Rounds played</span></div>
          <div><b>{totals.prompts}</b><span>Prompts answered</span></div>
          <div><b>{totals.avg}</b><span>Avg pts / prompt</span></div>
          <div><b>{totals.glass}</b><span>DECA Glass answers</span></div>
        </div>
        <p className="mute">
          {storageNote} The log keeps your latest {LOG_CAP} rounds; totals include older rounds.
          {notListed > 0 && <span id="logNotListed"> Totals include {notListed} older {notListed === 1 ? "round that is" : "rounds that are"} not in the list below. Older rounds are kept as totals only, without their answers.</span>}
        </p>
      </section>

      <section className="card">
        <h2>By cluster</h2>
        <div className="tablewrap">
          <table id="logClusters">
            <thead>
              <tr>
                <th>Cluster</th><th className="num">Rounds</th><th className="num">Prompts</th><th className="num">Avg pts</th>
                <th className="num">Streak</th><th className="num">Best streak</th>
                <th className="num">Best daily</th><th className="num">Best practice</th><th className="num">Best unlimited</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((c) => (
                <tr key={c.cluster} data-cluster={c.cluster} style={tint(c.cluster)}>
                  <td><span className="clname"><ClusterIcon cluster={c.cluster} size={24} />{clusterInfo(c.cluster).short}</span></td>
                  <td className="num">{c.rounds}</td>
                  <td className="num">{c.prompts}</td>
                  <td className="num">{c.prompts ? c.avg : "–"}</td>
                  <td className="num">{c.streak}</td>
                  <td className="num">{c.bestStreak}</td>
                  <td className="num">{altitude(c.best.daily)}</td>
                  <td className="num">{altitude(c.best.practice)}</td>
                  <td className="num">{altitude(c.best.unlimited)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mute">Rounds are counted under the cluster you picked. Streaks are daily rounds on consecutive days. A replayed daily round is not counted.</p>
      </section>

      <section className="card">
        <div className="headrow">
          <h2>Weak areas</h2>
          <Chips id="logFilterTopics" label="Topics by cluster" options={TOPIC_FILTERS} value={topicCluster} onChange={setTopicCluster} />
        </div>
        <div className="tablewrap">
          <table id="logTopics">
            <thead><tr><th>Topic</th><th><span className="cltext">Cluster</span></th><th className="num">Prompts</th><th className="num">Avg pts</th><th className="num">Glass</th></tr></thead>
            <tbody>
              {topics.length === 0 && <tr><td colSpan={5} className="mute">No prompts answered here yet.</td></tr>}
              {topics.map((t) => (
                <tr key={`${t.cluster}|${t.topic}`} data-cluster={t.cluster} style={tint(t.cluster)}>
                  <td>{t.topic}</td>
                  <td><span className="clname" title={clusterInfo(t.cluster).short}><ClusterIcon cluster={t.cluster} size={18} /><span className="cltext">{clusterInfo(t.cluster).short}</span></span></td>
                  <td className="num">{t.prompts}</td>
                  <td className="num">{t.avg}</td>
                  <td className="num">{t.glass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mute">Weakest first: the lowest average points per prompt is at the top. Topics follow each prompt&apos;s own cluster.</p>
      </section>

      <section className="card">
        <h2>Past rounds</h2>
        <div className="field">
          <span>Cluster</span>
          <Chips id="logFilterCluster" label="Filter rounds by cluster" options={CLUSTER_FILTERS} value={filter.cluster} onChange={(cluster) => setFilterPart({ cluster })} />
        </div>
        <div className="field">
          <span>Mode</span>
          <Chips id="logFilterMode" label="Filter rounds by mode" options={MODE_FILTERS} value={filter.mode} onChange={(mode) => setFilterPart({ mode })} />
        </div>
        <p className="mute" id="logCount" aria-live="polite">
          {rounds.length === 0 ? (log.length === 0 ? "No rounds in the log yet." : "No rounds match these filters.") : `Showing ${visible.length} of ${rounds.length} ${rounds.length === 1 ? "round" : "rounds"}, newest first.`}
        </p>
        <AnswerBoards>
        <ul className="logrounds" id="logRounds">
          {visible.map((r) => {
            const info = clusterInfo(r.cluster);
            const isOpen = !!open[r.id];
            return (
              <li key={r.id} style={tint(r.cluster)}>
                <button type="button" className="logrow" data-round={r.id} data-cluster={r.cluster} data-mode={r.mode} aria-expanded={isOpen} aria-controls={`boards-${r.id}`} onClick={() => setOpen({ ...open, [r.id]: !isOpen })}>
                  <span className="when">{when(r.at)}</span>
                  <span className="clname"><ClusterIcon cluster={r.cluster} size={18} />{info.short}</span>
                  <span className="mode">{MODE_LABEL[r.mode]}{!r.counted && <em> · replay, not counted</em>}</span>
                  <span className="sq" role="img" aria-label={r.entries.map((e) => levelName(e.level)).join(", ")}>{r.entries.map((e, i) => <i key={i} className={e.level === -1 ? undefined : `c${e.level}`} />)}</span>
                  <span className="score">{r.score} pts</span>
                  <span className="alt">{ft(r.score)} ft</span>
                  <span className="caret" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <RoundBoards round={r} byId={byId} />}
              </li>
            );
          })}
        </ul>
        </AnswerBoards>
        {rounds.length > limit && (
          <div><button type="button" className="ghost mini" id="logMore" onClick={() => setLimit(limit + PAGE)}>Show more</button></div>
        )}
      </section>
    </div>
  );
}
