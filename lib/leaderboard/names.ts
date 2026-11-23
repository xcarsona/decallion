/* Display-name rules for the leaderboard.

   A word filter cannot stop a determined person, and it cannot recognise a real person's name or a cruel sentence
   made of ordinary words. It is one layer: the others are the note beside the name box, the report link on the
   leaderboard and the `hidden` flag on a row (see supabase/migrations). What it does do is stop the obvious cases,
   including the usual trick of swapping letters for digits. */

/** Blocked wherever they appear inside the name, once spaces, dots and digits-for-letters are removed. Only words
    that do not turn up inside ordinary names and words are listed here. (Because spaces are removed, a few innocent
    pairs such as "Josh It" are caught too; that is the price of catching "s h i t".) */
const ANYWHERE = [
  "fuck", "fuk", "fvck", "phuck", "fck", "shit", "bitch", "btch", "cunt", "nigg", "faggot", "fagot", "whore", "slut", "pussy", "porno", "pornhub",
  "hitler", "molest", "pedophil", "paedophil", "retard", "asshole", "arsehole", "dildo", "penis", "vagina", "wetback", "tranny",
  "kike", "chink", "gook", "beaner", "bastard", "blowjob", "handjob", "jizz", "horny", "killyourself", "killurself",
  "schoolshoot", "whitepower", "kkk", "suicide", "terrorist", "pendejo", "maricon", "cabron", "onlyfans",
];
/** Blocked only as a whole word (optionally with s, es, ed, er or ing), because they sit inside innocent words and
    names: "grape" and "drapes" contain "rape", "Dickens" contains "dick", "class" contains "ass", "Ashton" contains
    "sht", "torpedo" contains "pedo", "Swank" contains "wank", "therapist" contains "rapist". A few of these are also
    real names; a player with one of them picks a nickname. */
const WHOLE_WORD = [
  "rape", "rapist", "raping", "dick", "fag", "cum", "sex", "sexy", "tit", "anal", "cock", "coon", "spic", "dyke", "twat", "kys", "heil", "ass", "hoe",
  "milf", "thot", "die", "kill", "slave", "nig", "niga", "nigga", "homo", "tard", "stfu", "gtfo", "wtf", "damn", "hell", "crap", "piss", "poop",
  "balls", "nut", "adolf", "pimp", "weed", "meth", "coke", "crack", "ugly", "fat", "stupid", "idiot", "loser", "hate", "suck", "nazi", "pedo", "paedo",
  "puta", "verga", "wank", "boner", "boob", "nude", "sht", "xxx", "shooter", "porn",
];
/** Digits people use in place of letters. "1" can stand for i or l, so both readings are checked. */
const LEET: Record<string, string> = { "0": "o", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g" };

function readings(lower: string): string[] {
  const swap = (one: string) => lower.replace(/[0345789]/g, (d) => LEET[d]).replace(/1/g, one);
  return [...new Set([lower, swap("i"), swap("l")])];
}
/** Stretched letters: "fuuuuck" and "pussssy". A run of three or more cut to two catches the words spelled with a
    double letter; every run cut to one catches the rest. Only words with no double letter of their own are compared
    against the cut-to-one form, or "kkk" would become "k" and block every name with a k in it. */
function cutRuns(text: string, to: 1 | 2): string {
  let out = "";
  let run = 0;
  for (let i = 0; i < text.length; i++) {
    run = i > 0 && text[i] === text[i - 1] ? run + 1 : 1;
    if (run <= to) out += text[i];
  }
  return out;
}
const hasDouble = (word: string) => cutRuns(word, 1) !== word;
const NO_DOUBLES = ANYWHERE.filter((w) => !hasDouble(w));
const WHOLE = new Set(WHOLE_WORD);

function offensive(name: string): boolean {
  for (const text of readings(name.toLowerCase())) {
    const joined = text.replace(/[^a-z]/g, "");
    if (ANYWHERE.some((w) => joined.includes(w))) return true;
    const two = cutRuns(joined, 2);
    if (ANYWHERE.some((w) => two.includes(w))) return true;
    const one = cutRuns(joined, 1);
    if (NO_DOUBLES.some((w) => one.includes(w))) return true;
    for (const word of text.split(/[^a-z]+/).filter(Boolean)) {
      for (const form of [word, word.replace(/(ing|ers|er|ed|es|s)$/, "")]) if (WHOLE.has(form)) return true;
    }
  }
  return false;
}

export function cleanName(input: unknown): { ok: true; name: string } | { ok: false; reason: string } {
  if (typeof input !== "string") return { ok: false, reason: "Enter a name." };
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 16) return { ok: false, reason: "Names are 3 to 16 characters." };
  if (!/^[A-Za-z0-9 _.-]+$/.test(name)) return { ok: false, reason: "Use letters, numbers, spaces, dots, dashes or underscores." };
  if (!/[A-Za-z]/.test(name)) return { ok: false, reason: "Names need at least one letter." };
  // phone numbers, and anything that reads as a web address or a social handle
  if ((name.match(/\d/g) ?? []).length >= 7) return { ok: false, reason: "Names cannot be phone numbers." };
  if (/\.[A-Za-z]{2,}/.test(name) || /^(ig|insta|snap|sc|tiktok|tt|discord|dc)[ ._-]/i.test(name)) return { ok: false, reason: "Names cannot be web addresses or social handles." };
  if (offensive(name)) return { ok: false, reason: "Pick a different name." };
  return { ok: true, name };
}
