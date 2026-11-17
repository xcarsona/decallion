import { Chip } from "@/components/ui/Chip";
import { ROUND_SIZE, pool } from "@/lib/game-engine";
import { CATEGORIES, QUESTIONS } from "@/lib/questions";
import type { Difficulty, PracticeSetup as Setup } from "@/types";

const DIFF_OPTIONS: [0 | Difficulty, string][] = [[0, "Any"], [1, "Easy"], [2, "Medium"], [3, "Hard"]];

export function PracticeSetup({ setup, onChange, onGo, onBack }: { setup: Setup; onChange: (s: Setup) => void; onGo: () => void; onBack: () => void }) {
  const n = pool(QUESTIONS, { cats: setup.cats, diff: setup.diff }).length;
  const toggle = (c: string) => onChange({ ...setup, cats: setup.cats.includes(c) ? setup.cats.filter((x) => x !== c) : [...setup.cats, c] });
  return (
    <div className="view">
      <div className="panel tall">
        <div className="headrow">
          <div className="lbl">Practice setup</div>
          <span className="mute" id="avail">{n ? `${n} prompts match · round of ${Math.min(n, ROUND_SIZE)}` : "No prompts match"}</span>
        </div>
        <div className="field">
          <span>Categories</span>
          <div className="chips" id="catChips">
            {CATEGORIES.map((c) => <Chip key={c} label={c} pressed={setup.cats.includes(c)} onClick={() => toggle(c)} />)}
          </div>
          <div className="chips">
            <Chip label="All" onClick={() => onChange({ ...setup, cats: CATEGORIES.slice() })} />
            <Chip label="None" onClick={() => onChange({ ...setup, cats: [] })} />
          </div>
        </div>
        <div className="field">
          <span>Difficulty</span>
          <div className="chips">
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
        <button type="button" className="ghost" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
