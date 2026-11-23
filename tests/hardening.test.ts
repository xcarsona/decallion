/* Checks added from the pre-release review: leaderboard name rules, empty posts, daily rounds finished out of order,
   and saved stats of the wrong type. */
import { describe, expect, it } from "vitest";
import { buildRound } from "@/lib/game-engine";
import { cleanName } from "@/lib/leaderboard/names";
import { parseSubmission } from "@/lib/leaderboard/submission";
import { QUESTIONS } from "@/lib/questions";
import { apply, blank, countsNow, dailyOf, normalize } from "@/lib/stats";

const ok = (name: string) => cleanName(name).ok;

describe("leaderboard names", () => {
  it("accepts ordinary names and nicknames", () => {
    for (const name of [
      "Carson A", "Jane", "xX_Glass_Xx", "DECA Diamond", "Mr. Brightside", "Dickens", "Dickson", "Grapes", "Scraper", "Drapes", "Fagan", "Ashton",
      "Torpedo", "Swank", "Porntip", "Pornchai", "Classy", "Hancock 7", "Analyst", "Cumberland", "Nazia", "Hello", "Team 5", "Kirk", "Nikki", "Night Owl",
      "Player 42", "Nguyen", "Ho Lee", "Essex", "Titan", "Assante", "Butters", "Shellie", "Mississippi", "Aaron", "Hannah",
    ]) {
      expect(ok(name), name).toBe(true);
    }
  });
  it("refuses slurs, sexual and violent words, including with digits for letters and stretched letters", () => {
    for (const name of [
      "n1gger", "n1gga", "niga", "kike", "spic", "chink", "coon", "gook", "wetback", "tranny", "dyke", "f4ggot", "retard", "h1tler", "naz1", "adolf", "heil",
      "kkk", "white power", "asshole", "fuk", "fvck", "phuck", "sh1t", "sh1t_head", "b1tch", "cock", "penis", "vagina", "sex", "cum", "tits", "anal", "d1ck",
      "p0rn", "wh0re", "s1ut", "pu55y", "twat", "rapist", "raping", "r4pe", "pedo", "molester", "kys", "kill yourself", "go die", "school shooter",
      "puta", "pendejo", "maricon", "verga", "fuuuuck", "shiiit", "F.U.C.K", "f u c k", "xShitx", "big dick", "ur ugly", "u suck",
    ]) {
      expect(ok(name), name).toBe(false);
    }
  });
  it("refuses phone numbers, web addresses, handles and names with no letters", () => {
    for (const name of ["555-123-4567", "5551234567", "evil-site.com", "ig.jane_doe", "snap jdoe99", "bit.ly", "12345", "._.-"]) expect(ok(name), name).toBe(false);
    expect(ok("Room 204")).toBe(true);
  });
  it("keeps the length and character rules", () => {
    expect(cleanName("  Carson A ")).toEqual({ ok: true, name: "Carson A" });
    expect(ok("ab")).toBe(false);
    expect(ok("a".repeat(17))).toBe(false);
    expect(ok("<script>")).toBe(false);
    expect(ok("Zoë")).toBe(false);
    expect(cleanName(42).ok).toBe(false);
  });
});

describe("leaderboard posts", () => {
  const now = new Date("2026-11-17T17:00:00Z");
  const body = (answers: string[]) => ({ name: "Test Player", day: 20261117, cluster: "fin", answers });
  it("refuses a post with seven blank answers, which would only take the name for the day", () => {
    const blank7 = parseSubmission(body(["", " ", "", "", "", "", ""]), now);
    expect(blank7).toEqual({ ok: false, error: "Play the round before posting a score." });
    const tooLong = parseSubmission(body(Array(7).fill("x".repeat(200))), now);
    expect(tooLong.ok).toBe(false);
  });
  it("still takes a round with real answers, even all wrong ones", () => {
    expect(parseSubmission(body(["zzz", "", "", "", "", "", ""]), now).ok).toBe(true);
    const round = buildRound(QUESTIONS, { mode: "daily", cluster: "fin", seed: 20261117 });
    expect(parseSubmission(body(round.map((q) => q.a[0][0])), now).ok).toBe(true);
  });
});

describe("daily rounds finished out of order", () => {
  const played = (last: number, streak: number) => {
    const s = blank();
    s.daily.fin = { last, streak, bestStreak: streak, score: 300 };
    return s;
  };
  it("does not count a round for a day earlier than the last counted one", () => {
    const s = played(20261116, 5); // today's round is already counted
    expect(countsNow(s, "daily", "fin", 20261115, 20261116)).toBe(false); // a round left open since yesterday
    expect(countsNow(s, "daily", "fin", 20261116, 20261116)).toBe(false); // the same day again
    expect(countsNow(s, "daily", "fin", 20261117, 20261117)).toBe(true); // tomorrow, when it comes
    expect(countsNow(s, "daily", "mkt", 20261115, 20261116)).toBe(true); // another cluster is separate
    expect(countsNow(s, "practice", "fin", 20261115, 20261116)).toBe(true);
  });
  it("is not blocked for good by a saved day in the future (a clock that was wrong)", () => {
    const s = played(20270101, 2);
    expect(countsNow(s, "daily", "fin", 20261116, 20261116)).toBe(true);
    const after = apply(s, { mode: "daily", cluster: "fin", score: 100, dayKey: 20261116, prevDayKey: 20261115, log: [] });
    expect(dailyOf(after.stats, "fin")).toMatchObject({ last: 20261116, streak: 2 }); // the streak is kept, not broken
  });
  it("still counts streaks the ordinary way", () => {
    const next = apply(played(20261116, 5), { mode: "daily", cluster: "fin", score: 100, dayKey: 20261117, prevDayKey: 20261116, log: [] });
    expect(dailyOf(next.stats, "fin").streak).toBe(6);
    const gap = apply(played(20261110, 5), { mode: "daily", cluster: "fin", score: 100, dayKey: 20261117, prevDayKey: 20261116, log: [] });
    expect(dailyOf(gap.stats, "fin").streak).toBe(1);
  });
});

describe("saved stats of the wrong type", () => {
  it("reads every damaged field as zero instead of passing it on", () => {
    const s = normalize({
      games: "many", prompts: 14, pts: null,
      levels: { "1": "3", "6": {}, miss: 2 },
      topics: { "fin|Accounting": 5, "fin|Banking": { n: 4, pts: "x", glass: {} }, "mkt|Pricing": [1] },
      best: { "all:daily": "900", "fin:daily": 410 },
      daily: { fin: { last: 20261116, streak: {}, bestStreak: [1, 2] }, mkt: 7, all: { last: 20261115 } },
      clusters: { fin: { games: 2, prompts: 14, pts: 200 } },
    });
    expect(s.games).toBe(0);
    expect(s.levels).toMatchObject({ "1": 0, "6": 0, miss: 2 });
    expect(s.topics).toEqual({ "fin|Banking": { n: 4, pts: 0, glass: 0 } });
    expect(s.best).toEqual({ "all:daily": 0, "fin:daily": 410 });
    expect(s.daily).toEqual({ fin: { last: 20261116, streak: 0, bestStreak: 0, score: 0 }, all: { last: 20261115, streak: 0, bestStreak: 0, score: 0 } });
    // and a round can still be added on top of it without throwing
    const after = apply(s, { mode: "daily", cluster: "all", score: 100, dayKey: 20261116, prevDayKey: 20261115, log: [{ cluster: "fin", topic: "Accounting", level: 6, pts: 100 }] });
    expect(dailyOf(after.stats, "all")).toMatchObject({ last: 20261116, streak: 1, bestStreak: 1 });
    expect(after.stats.topics["fin|Accounting"]).toEqual({ n: 1, pts: 100, glass: 1 });
  });
  it("leaves good stats as they are", () => {
    const good = apply(blank(), { mode: "daily", cluster: "fin", score: 300, dayKey: 20261117, prevDayKey: 20261116, log: [{ cluster: "fin", topic: "Finance", level: 6, pts: 100 }] }).stats;
    expect(normalize(JSON.parse(JSON.stringify(good)))).toEqual(good);
  });
});

describe("the daily round counts from its first answer", () => {
  it("does not count a fresh start once an answer has been given that day", () => {
    const s = blank();
    s.daily.fin = { last: 20261115, streak: 2, bestStreak: 2, score: 300, started: 20261116 };
    expect(countsNow(s, "daily", "fin", 20261116, 20261116)).toBe(false); // a second start the same day
    expect(countsNow(s, "daily", "fin", 20261116, 20261116, true)).toBe(true); // the round that made the mark, finishing
    expect(countsNow(s, "daily", "fin", 20261117, 20261117)).toBe(true); // the next day is a new round
    expect(countsNow(s, "daily", "mkt", 20261116, 20261116)).toBe(true); // other clusters are separate
    expect(countsNow(s, "unlimited", "fin", 20261116, 20261116)).toBe(true);
  });
  it("keeps the mark through a save and a finished round", () => {
    const s = blank();
    s.daily.fin = { last: 0, streak: 0, bestStreak: 0, score: 0, started: 20261116 };
    expect(normalize(JSON.parse(JSON.stringify(s))).daily.fin.started).toBe(20261116);
    const after = apply(s, { mode: "daily", cluster: "fin", score: 100, dayKey: 20261116, prevDayKey: 20261115, log: [] });
    expect(dailyOf(after.stats, "fin")).toMatchObject({ last: 20261116, started: 20261116, streak: 1 });
    expect(countsNow(after.stats, "daily", "fin", 20261116, 20261116, true)).toBe(false); // already logged
  });
});
