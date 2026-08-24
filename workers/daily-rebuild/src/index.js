/**
 * Daily rebuild trigger for montereybayevents.com.
 *
 * WHY THIS EXISTS
 *
 * src/lib/isPast.ts is evaluated at BUILD time. The site is prerendered static,
 * so `today` is frozen at whatever date the last deploy ran — and the homepage
 * uses it to FILTER finished events (src/pages/index.astro). isPast.ts's own
 * header warns that filtering is the one job a frozen "today" is not good
 * enough for: it shows the wrong set of events while looking maintained.
 *
 * Cloudflare Pages has no native scheduler, so without something like this the
 * site rebuilds only when someone pushes. A quiet week means finished events
 * sit on the homepage billed as upcoming.
 *
 * WHY A DEPLOY HOOK AND NOT AN API TOKEN
 *
 * env.DEPLOY_HOOK is a Pages deploy-hook URL: a capability that can do exactly
 * one thing — start a build of `main` for this one project. The fleet
 * CF_API_TOKEN could do the same job, but it can also read and write every
 * Pages project, Worker, DNS record and Page Rule on the account. There is no
 * reason for a cron job this small to hold that. If this Worker ever leaks, the
 * blast radius is "someone can rebuild our site", which is not a security
 * incident.
 *
 * The hook is stored as a secret binding, so it is not in this repository and
 * not readable back out of the Worker.
 *
 * It is deliberately cron-only — no fetch handler, no routes — so there is no
 * public URL that can trigger a deploy.
 *
 * TO ROTATE THE HOOK
 *   List:   GET    /accounts/{acct}/pages/projects/montereybayevents/deploy_hooks
 *   Delete: DELETE .../deploy_hooks/{hook_id}
 *   Create: POST   .../deploy_hooks   {"name":"daily-rebuild","branch":"main"}
 * then re-upload this Worker with the new URL as the DEPLOY_HOOK secret.
 */

export default {
  async scheduled(event, env, ctx) {
    const hook = env.DEPLOY_HOOK;

    if (!hook) {
      // Permanent: the binding is missing, so every future run fails the same
      // way. Nothing to retry.
      console.error("✗ DEPLOY_HOOK binding is not set — re-upload the Worker.");
      return;
    }

    let res;
    try {
      res = await fetch(hook, { method: "POST" });
    } catch (err) {
      // Network-level. Tomorrow's run does the same job.
      console.error(`↷ deploy hook unreachable (${err}) — next run retries`);
      return;
    }

    const body = await res.text().catch(() => "");

    if (res.ok) {
      console.log(`✓ rebuild triggered (HTTP ${res.status}) ${body.slice(0, 200)}`);
      return;
    }

    if (res.status === 429 || res.status >= 500) {
      // Transient: rate limit or Cloudflare having a bad minute.
      console.error(`↷ transient failure (HTTP ${res.status}) — next run retries`);
      return;
    }

    // 401/403/404 and friends: the hook was deleted or rotated. Retrying will
    // not help; it has to be recreated. See TO ROTATE THE HOOK above.
    console.error(
      `✗ deploy hook rejected (HTTP ${res.status}) — recreate it. ${body.slice(0, 200)}`,
    );
  },
};
