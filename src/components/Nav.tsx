"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/data/site";

const links = [
  { href: "#menu", label: "Menu" },
  { href: "#catering", label: "Catering" },
  { href: "#visit", label: "Visit" },
  { href: "#reserve", label: "Reserve a table" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color] duration-300 ${
        solid ? "site-header--solid" : "site-header--clear"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:h-16 md:px-8">
        <a
          href="#top"
          className="group min-w-0 shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="font-display text-lg font-semibold tracking-tight text-ink md:text-xl">
            {site.name}
          </span>
          <span className="mt-0.5 block truncate text-[0.62rem] uppercase tracking-[0.2em] text-muted">
            {site.kitchenBrand}
          </span>
        </a>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm px-3 py-2 text-sm font-medium text-ink/85 transition-colors hover:bg-ink/5 hover:text-brand-red"
            >
              {link.label}
            </a>
          ))}
          <span className="mx-2 h-5 w-px bg-[color:var(--line)]" aria-hidden />
          <ThemeToggle />
          <a
            href="#contact"
            className="btn-contact ml-3 inline-flex min-h-10 items-center px-5 text-sm font-semibold"
          >
            Contact us
          </a>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <a
            href="#contact"
            className="btn-contact inline-flex min-h-9 items-center px-4 text-xs font-semibold"
            onClick={() => setOpen(false)}
          >
            Contact us
          </a>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm hover:bg-ink/5"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-5 flex-col gap-1.5">
              <span
                className={`h-0.5 w-full bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-full bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 w-full bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-[color:var(--line)] bg-paper lg:hidden ${open ? "block" : "hidden"}`}
      >
        <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="min-h-11 py-3 text-base font-medium text-ink"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="btn-contact mt-2 inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold"
            onClick={() => setOpen(false)}
          >
            Contact us
          </a>
        </nav>
      </div>
    </header>
  );
}
