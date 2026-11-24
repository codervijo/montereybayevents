/**
 * POST /api/suggest-spot — "Suggest a spot" on /holiday-lights/ (v2.T).
 *
 * Cloudflare Pages Function. Stores each suggestion in the KV namespace bound
 * as LIGHTS_SUGGESTIONS, key `suggestion:<ISO time>:<random>`, for the operator
 * to review. Nothing is published automatically (operator 2026-11-24): a spot
 * reaches the map only after it is checked and added to
 * data/holiday-lights-2026.json by hand.
 *
 * Review: `npx wrangler kv key list --binding LIGHTS_SUGGESTIONS` / `kv key get`,
 * or the KV page in the Cloudflare dashboard.
 *
 * Responds JSON to fetch() (Accept: application/json) and 303 back to the page
 * for a no-JS form post. Spam: a hidden `website` honeypot (filled → accepted
 * and dropped) and hard length caps. No IP is stored.
 */
const FIELDS = { name: 200, town: 100, address: 300, dates: 300, link: 500, notes: 2000, email: 200 };
const BACK = "/holiday-lights/";

function reply(request, status, body) {
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  if (wantsJson) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }
  if (status < 300) return Response.redirect(new URL(`${BACK}?suggested=1#suggest`, request.url).toString(), 303);
  return new Response(body.error || "Error", { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(request, 400, { error: "Please send the form." });
  }
  if (String(form.get("website") || "").trim()) return reply(request, 200, { ok: true });

  const s = {};
  for (const [k, max] of Object.entries(FIELDS)) {
    const v = String(form.get(k) || "").trim();
    if (v.length > max) return reply(request, 400, { error: `"${k}" is too long.` });
    s[k] = v;
  }
  if (!s.name || !s.town) return reply(request, 400, { error: "Please say what it is and which town it's in." });
  if (s.link && !/^https?:\/\//i.test(s.link)) return reply(request, 400, { error: "The link should start with http:// or https://." });

  if (!env.LIGHTS_SUGGESTIONS) {
    return reply(request, 503, { error: "Suggestions aren't being accepted right now. Please try again later." });
  }
  const at = new Date().toISOString();
  const key = `suggestion:${at}:${crypto.randomUUID().slice(0, 8)}`;
  await env.LIGHTS_SUGGESTIONS.put(key, JSON.stringify({ ...s, at, page: BACK }));
  return reply(request, 200, { ok: true });
}

