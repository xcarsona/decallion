/* Display-name rules for the leaderboard. */
const BLOCKED = ["fuck", "shit", "bitch", "cunt", "nigg", "fag", "rape", "nazi", "hitler", "porn", "dick", "pussy", "whore", "slut"];

export function cleanName(input: unknown): { ok: true; name: string } | { ok: false; reason: string } {
  if (typeof input !== "string") return { ok: false, reason: "Enter a name." };
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 16) return { ok: false, reason: "Names are 3 to 16 characters." };
  if (!/^[A-Za-z0-9 _.-]+$/.test(name)) return { ok: false, reason: "Use letters, numbers, spaces, dots, dashes or underscores." };
  const squashed = name.toLowerCase().replace(/[^a-z]/g, "");
  if (BLOCKED.some((w) => squashed.includes(w))) return { ok: false, reason: "Pick a different name." };
  return { ok: true, name };
}
