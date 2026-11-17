/* Decallion question bank. Data only: add, edit or remove prompts in lib/questions/bank/ and no game code needs
   to change. One file per career cluster.

   id       unique id (topic prefix + number)
   cluster  bma, ent, fin, ht or mkt (see clusters.ts). Must match the file the prompt is in.
   topic    sub-topic inside the cluster, for example 'Accounting' inside Finance
   area     DECA instructional area the prompt belongs to
   diff     1 easy, 2 medium, 3 hard
   q        the prompt. It must have many correct answers.
   why      one-line explanation shown in the round review
   a        answer board: [display answer, level, ...accepted aliases]
            level 1 Roll Call (what most people say) ... 6 DECA Glass (the curated rarest answer)

   Levels are editorial estimates of how rarely a room of competitors would give the answer.
   `npm test` checks the bank for duplicate ids, unknown clusters, clashing aliases, thin answer boards and prompts
   with no answer at one of the top two levels. */
import type { ClusterChoice, ClusterId, Question } from "@/types";
import { BMA } from "./bank/bma";
import { ENT } from "./bank/ent";
import { FIN } from "./bank/fin";
import { HT } from "./bank/ht";
import { MKT } from "./bank/mkt";
import { CLUSTER_IDS } from "./clusters";

export * from "./clusters";

export const BANK: Record<ClusterId, Question[]> = { bma: BMA, ent: ENT, fin: FIN, ht: HT, mkt: MKT };
export const QUESTIONS: Question[] = CLUSTER_IDS.flatMap((c) => BANK[c]);

/** Topics in a cluster (or in the whole bank), in the order they first appear. */
export function topicsOf(choice: ClusterChoice, questions: Question[] = QUESTIONS): string[] {
  return [...new Set(questions.filter((q) => choice === "all" || q.cluster === choice).map((q) => q.topic))];
}
