/**
 * robots.txt, honoured. The discovery job fetches a URL only if the host's
 * robots.txt allows it for our User-Agent — this is what "compliant discovery"
 * means in practice, and it is why Eventbrite and Reddit are registry entries
 * the job never requests (both publish `User-agent: *` / `Disallow: /`).
 *
 * Matching follows RFC 9309: the most specific group for our agent token, else
 * `*`; within it the longest matching rule wins and Allow wins a tie. `*` and a
 * trailing `$` are supported in paths.
 */
export const AGENT_TOKEN = "montereybayevents-popups";

export function parseRobots(text) {
  const groups = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if ((key === "allow" || key === "disallow") && cur) {
      if (value) cur.rules.push({ allow: key === "allow", path: value });
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

function pathRegex(path) {
  const anchored = path.endsWith("$");
  const body = (anchored ? path.slice(0, -1) : path)
    .split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

export function isAllowed(groups, url, agent = AGENT_TOKEN) {
  const u = new URL(url);
  const target = u.pathname + u.search;
  const token = agent.toLowerCase();
  const group =
    groups.find((g) => g.agents.some((a) => a !== "*" && token.includes(a))) ??
    groups.find((g) => g.agents.includes("*"));
  if (!group) return true;
  let best = null;
  for (const r of group.rules) {
    if (!pathRegex(r.path).test(target)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return best ? best.allow : true;
}
