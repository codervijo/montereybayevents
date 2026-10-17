/**
 * RSS / Atom item reader. A feed item is an ANNOUNCEMENT, not an event record:
 * `pubDate` is when the post went up, never when the event happens, so nothing
 * here is mapped to a start date. Items feed the text extractor or the review
 * queue as undated leads.
 */
const decode = (s) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'").replace(/&#8217;/g, "’").replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&");

export const stripTags = (s) => decode(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const tag = (block, name) => {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(block);
  return m ? m[1] : null;
};

export function parseFeed(xml) {
  const items = [];
  const re = /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[2];
    const linkTag = tag(b, "link");
    const linkHref = /<link[^>]+href=["']([^"']+)["']/i.exec(b)?.[1];
    const title = tag(b, "title");
    const body = tag(b, "content:encoded") ?? tag(b, "description") ?? tag(b, "summary") ?? tag(b, "content");
    items.push({
      title: title ? stripTags(title) : null,
      link: (linkTag ? decode(linkTag).trim() : null) || linkHref || null,
      published: (tag(b, "pubDate") ?? tag(b, "published") ?? tag(b, "updated"))?.trim() ?? null,
      text: body ? stripTags(body) : null,
      guid: tag(b, "guid")?.trim() ?? tag(b, "id")?.trim() ?? null,
    });
  }
  return items;
}
