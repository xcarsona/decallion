import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, pageMetadata } from "@/app/site-info";

export const metadata: Metadata = pageMetadata("Privacy", "/privacy");

/* What the site keeps and where. Every sentence here describes the code as it is: check app/api/scores/route.ts,
   supabase/schema.sql and the localStorage keys (decallion-*) before changing one. */
export default function PrivacyPage() {
  return (
    <section className="card" id="privacy">
      <h2>Privacy</h2>
      <p>Decallion has no accounts, no cookies, and no analytics or tracking. It shows no ads.</p>

      <h3>Saved on your device</h3>
      <p>Your stats, training log, study list, sound setting, the leaderboard tab you last opened and the last leaderboard name you used are saved in this browser only. They are not sent anywhere.</p>
      <p>You can erase your stats and log on the <Link href="/log">Log</Link> page and your study list on the <Link href="/study">Study</Link> page. Clearing this site&apos;s data in your browser settings erases all of it.</p>

      <h3>The leaderboard</h3>
      <p>Posting a score is optional. If you post one, the display name you type, your score, the level of each answer, the date and the cluster are stored on the server and shown publicly, along with the time the score was posted, which sets the order of tied scores.</p>
      <p>The answers you typed are sent so the server can check the score. They are not stored.</p>
      <p>Do not use your full name. Use a nickname.</p>
      <p id="privacyContact">
        {CONTACT_EMAIL
          ? <>To have a name removed from the leaderboard, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</>
          : "To have a name removed from the leaderboard, ask the site owner."}
      </p>

      <h3>Unofficial</h3>
      <p>Decallion is an unofficial practice game. It is not affiliated with or endorsed by DECA Inc.</p>
    </section>
  );
}
