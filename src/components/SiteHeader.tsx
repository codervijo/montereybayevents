import { useState } from "react";

const links = [
  { to: "/", label: "Events" },
  { to: "/monterey-car-week/", label: "Car Week" },
  { to: "/traffic/", label: "Traffic" },
] as const;

/**
 * Mounted as an Astro island (client:load) — the mobile menu needs state.
 * `pathname` replaces TanStack Router's activeProps/activeOptions: the page
 * passes its own URL in so the active link still gets the brass treatment.
 *
 * Every link is a plain <a> — content pages are prerendered HTML and navigate
 * with a full request, no client-side routing.
 */
export function SiteHeader({ pathname = "/" }: { pathname?: string }) {
  const [open, setOpen] = useState(false);

  // "Events" is the site index and would otherwise match every path, so it is
  // exact-match only. /free/ is Car Week content, so it lights up "Car Week".
  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    if (to === "/monterey-car-week/") {
      return pathname.startsWith(to) || pathname.startsWith("/free/");
    }
    return pathname.startsWith(to);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3">
        <a href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-2xl leading-none tracking-wide text-brass">
            Monterey Bay Events
          </span>
          <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground lg:block">
            Central Coast
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              aria-current={isActive(l.to) ? "page" : undefined}
              className={`text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:text-foreground ${
                isActive(l.to) ? "text-brass" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-border/70 px-5 py-2 md:hidden">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              aria-current={isActive(l.to) ? "page" : undefined}
              className={`py-2.5 text-sm font-semibold uppercase tracking-[0.16em] ${
                isActive(l.to) ? "text-brass" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export default SiteHeader;
