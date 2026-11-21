"use client";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { NO_DEFINITION } from "./AnswerCard";
import { useDefinitions } from "./useDefinitions";
import { ClusterIcon } from "@/components/game/ClusterIcon";
import { CLUSTER_IDS, QUESTIONS, clusterInfo } from "@/lib/questions";
import { definitionOf } from "@/lib/questions/defs";
import { LEVELS } from "@/lib/scoring";
import {
  STUDY_CAP, clearStudy, counts, groupTerms, isStudyPersistent, removeLearnedTerms, removeTerm, studySnapshot, subscribeStudy, toggleTermLearned,
  type StudyFilter,
} from "@/lib/study";
import type { ClusterId } from "@/types";

const CLUSTER_FILTERS: [StudyFilter["cluster"], string][] = [["all", "All"], ...CLUSTER_IDS.map((c): [ClusterId, string] => [c, clusterInfo(c).short])];
const tint = (cluster: ClusterId) => ({ "--cc": clusterInfo(cluster).color }) as React.CSSProperties;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function StudyPage() {
  /* Read from storage, not copied into state: Next.js keeps this page in memory while the game is open, and terms
     added there (or in another tab) must show up when it is opened again. */
  const list = useSyncExternalStore(subscribeStudy, studySnapshot);
  const [filter, setFilter] = useState<StudyFilter>({ cluster: "all", hideLearned: false });
  const [armed, setArmed] = useState(false);

  const groups = useMemo(() => groupTerms(list, QUESTIONS, filter), [list, filter]);
  // only the clusters that have terms showing are loaded
  const defs = useDefinitions(groups.map((g) => g.cluster).filter(Boolean).join(","));
  const total = counts(list);
  const showing = groups.reduce((n, g) => n + g.terms, 0);
  const storageNote = isStudyPersistent() ? "Saved in this browser only." : "This browser is blocking storage, so the study list lasts only until you close the page.";

  /* Removing a row takes its button away, so focus moves to the next row's Remove button (or the one before). */
  const removeRow = (button: HTMLButtonElement, ref: { promptId: string; answer: string }) => {
    const all = Array.from(document.querySelectorAll<HTMLButtonElement>("#studyPage .studyRemove"));
    const at = all.indexOf(button);
    const to = all[at + 1] ?? all[at - 1];
    removeTerm(ref);
    to?.focus();
  };
  /* With "Hide learned" on, marking a term learned takes its row away too, so focus moves to a neighbouring row. */
  const learnRow = (button: HTMLButtonElement, ref: { promptId: string; answer: string }, wasLearned: boolean) => {
    const all = Array.from(document.querySelectorAll<HTMLButtonElement>("#studyPage .studyLearned"));
    const at = all.indexOf(button);
    const to = filter.hideLearned && !wasLearned ? (all[at + 1] ?? all[at - 1]) : null;
    toggleTermLearned(ref);
    to?.focus();
  };
  const clear = () => {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000);
      return;
    }
    clearStudy();
    setArmed(false);
  };

  if (list.length === 0) {
    return (
      <div className="studypage" id="studyPage">
        <section className="card" id="studyEmpty">
          <h2>Study list</h2>
          <p>No terms yet. <Link href="/">Play a round</Link>, then open Review answers and pick any answer to see what it means and add it here.</p>
          <p className="mute">{storageNote}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="studypage" id="studyPage">
      <section className="card">
        <div className="headrow">
          <h2>Study list</h2>
          <div className="row">
            <button type="button" className="ghost mini" id="studyRemoveLearned" onClick={() => removeLearnedTerms()} disabled={total.learned === 0}>Remove learned</button>
            <button type="button" className="ghost mini" id="studyClear" onClick={clear}>{armed ? "Click again to erase" : "Clear study list"}</button>
          </div>
        </div>
        <div className="figs" id="studyCounts" aria-live="polite">
          <div><b>{total.terms}</b><span>{total.terms === 1 ? "Term" : "Terms"}</span></div>
          <div><b>{total.learned}</b><span>Learned</span></div>
          <div><b>{total.toLearn}</b><span>Still to learn</span></div>
        </div>
        <div className="field">
          <span>Cluster</span>
          <div className="chips" id="studyFilterCluster" role="group" aria-label="Filter terms by cluster">
            {CLUSTER_FILTERS.map(([v, text]) => (
              <button key={v} type="button" data-value={v} aria-pressed={filter.cluster === v} onClick={() => setFilter({ ...filter, cluster: v })}>{text}</button>
            ))}
          </div>
        </div>
        <div className="chips">
          <button type="button" id="studyHideLearned" aria-pressed={filter.hideLearned} onClick={() => setFilter({ ...filter, hideLearned: !filter.hideLearned })}>Hide learned</button>
        </div>
        <p className="mute">
          {storageNote} Add terms from the answer boards in a round review or in the <Link href="/log">training log</Link>. The list keeps up to {STUDY_CAP.toLocaleString("en-US")} terms.
        </p>
      </section>

      {showing === 0 && <section className="card" id="studyNoMatch"><p className="mute">No terms match these filters.</p></section>}

      {groups.map((g) => (
        <section className="card studycluster" key={g.cluster ?? "gone"} data-cluster={g.cluster ?? "gone"} style={g.cluster ? tint(g.cluster) : undefined}>
          <div className="headrow">
            <h3 className="clname">{g.cluster && <ClusterIcon cluster={g.cluster} size={24} />}{g.cluster ? clusterInfo(g.cluster).name : "No longer in the game"}</h3>
            <span className="mute">{plural(g.terms, "term")}</span>
          </div>
          {g.prompts.map((p) => (
            <div className="studyprompt" key={p.promptId} data-prompt={p.promptId}>
              <h4>{g.cluster && <ClusterIcon cluster={g.cluster} size={18} />}<span>{p.question ? p.question.q : `Prompt ${p.promptId}`}</span></h4>
              {p.question
                ? <div className="tag">{p.question.topic} · {p.question.id}</div>
                : <div className="tag">This prompt was removed from the game. You can still remove its terms.</div>}
              <ul className="studyterms">
                {p.terms.map(({ item, row }) => {
                  const loaded = p.question ? defs[p.question.cluster] : undefined;
                  const text = row && loaded ? definitionOf(loaded, item.promptId, item.answer) : null;
                  const ref = { promptId: item.promptId, answer: item.answer };
                  return (
                    <li key={item.answer} className={`studyTerm${row ? ` c${row[1]}` : ""}${item.learned ? " learned" : ""}`} data-prompt={item.promptId} data-answer={item.answer} data-learned={item.learned}>
                      <div className="stmain">
                        <div className="sthead">
                          <b>{item.answer}</b>
                          {row && <span className="stlevel">{LEVELS[row[1]].name} · {LEVELS[row[1]].pts} pts</span>}
                        </div>
                        {row
                          ? <p className={`stdef${text ? "" : " mute"}`}>{!loaded ? "Loading" : text ?? NO_DEFINITION}</p>
                          : p.question && <p className="stdef mute">This answer is no longer on the board.</p>}
                      </div>
                      <div className="stbtns">
                        <button type="button" className="ghost mini studyLearned" aria-pressed={item.learned} aria-label={`Learned: ${item.answer}`} onClick={(e) => learnRow(e.currentTarget, ref, item.learned)}>Learned</button>
                        <button type="button" className="ghost mini studyRemove" aria-label={`Remove ${item.answer}`} onClick={(e) => removeRow(e.currentTarget, ref)}>Remove</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
