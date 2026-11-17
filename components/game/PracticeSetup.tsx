import { Chip } from "@/components/ui/Chip";
import { ROUND_SIZE, pool } from "@/lib/game-engine";
import { CLUSTERS, CLUSTER_IDS, QUESTIONS, clusterInfo } from "@/lib/questions";
import type { ClusterChoice, ClusterId, Difficulty, PracticeSetup as Setup } from "@/types";

const DIFF_OPTIONS: [0 | Difficulty, string][] = [[0, "Any"], [1, "Easy"], [2, "Medium"], [3, "Hard"]];

export function PracticeSetup({ cluster, setup, onChange, onGo, onBack }: { cluster: ClusterChoice; setup: Setup; onChange: (s: Setup) => void; onGo: () => void; onBack: () => void }) {
  const n = pool(QUESTIONS, { cluster, clusters: setup.clusters, diff: setup.diff }).length;
  const toggle = (c: ClusterId) => onChange({ ...setup, clusters: setup.clusters.includes(c) ? setup.clusters.filter((x) => x !== c) : [...setup.clusters, c] });
  return (
    <div className="view">
      <div className="panel tall">
        <div className="headrow">
          <div className="lbl">Practice setup</div>
          <span className="mute" id="avail">{n ? `${n} prompts match · round of ${Math.min(n, ROUND_SIZE)}` : "No prompts match"}</span>
        </div>
        {cluster === "all" ? (
          <div className="field">
            <span>Clusters</span>
            <div className="chips" id="catChips">
              {CLUSTER_IDS.map((c) => <Chip key={c} label={CLUSTERS[c].name} pressed={setup.clusters.includes(c)} onClick={() => toggle(c)} />)}
            </div>
            <div className="chips">
              <Chip label="All" onClick={() => onChange({ ...setup, clusters: CLUSTER_IDS.slice() })} />
              <Chip label="None" onClick={() => onChange({ ...setup, clusters: [] })} />
            </div>
          </div>
        ) : (
          <p id="setupCluster">Drawing only from {clusterInfo(cluster).name}.</p>
        )}
        <div className="field">
          <span>Difficulty</span>
          <div className="chips" id="diffChips">
            {DIFF_OPTIONS.map(([v, label]) => <Chip key={v} label={label} pressed={setup.diff === v} onClick={() => onChange({ ...setup, diff: v })} />)}
          </div>
        </div>
        <div className="field">
          <span>Timer</span>
          <div className="chips" id="timerChips">
            <Chip label="25 seconds" pressed={setup.timer} onClick={() => onChange({ ...setup, timer: true })} />
            <Chip label="Off" pressed={!setup.timer} onClick={() => onChange({ ...setup, timer: false })} />
          </div>
        </div>
      </div>
      <div className="dock wrapok">
        <button type="button" id="setupGo" disabled={!n} style={{ opacity: n ? 1 : 0.4 }} onClick={onGo}>Start climb</button>
        <button type="button" className="ghost" id="setupBack" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
