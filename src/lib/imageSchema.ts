/**
 * JSON-LD builders shared by the three visual-resource pages
 * (/laguna-seca-map/, /monterey-car-week-map/, /monterey-events-calendar/).
 *
 * Everything emitted here mirrors something visible on the page: the
 * ImageObject is the <img> in the figure, the BreadcrumbList is the visible
 * breadcrumb, and FAQPage is built from the same array the FAQ section renders.
 */
import { SITE, dimsOf, pngPath, webpPath, type Visual } from "../data/visuals";

const PUBLISHER = { "@type": "Organization", name: "Monterey Bay Events", url: `${SITE}/` };

export function buildImageObject(v: Visual, opts: { pageUrl: string; representative?: boolean; credit?: string }) {
  const d = dimsOf(v.key);
  return {
    "@type": "ImageObject",
    "@id": `${SITE}${pngPath(v.key)}#image`,
    name: v.title,
    caption: v.caption,
    description: v.alt,
    contentUrl: `${SITE}${pngPath(v.key)}`,
    thumbnailUrl: `${SITE}${webpPath(v.key, d.widths[0]!)}`,
    encodingFormat: "image/png",
    width: d.width,
    height: d.height,
    creator: PUBLISHER,
    creditText: opts.credit ?? "Monterey Bay Events",
    copyrightNotice: opts.credit ?? "Monterey Bay Events",
    representativeOfPage: opts.representative ?? false,
    mainEntityOfPage: opts.pageUrl,
  };
}

export function buildBreadcrumbs(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function buildFaq(faq: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });
