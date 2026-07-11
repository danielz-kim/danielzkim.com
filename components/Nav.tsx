"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const RESUME_URL =
  "https://drive.google.com/file/d/1p63gdl-aifPjrtCgJ7ILW-nPGQy-ciKi/view?usp=sharing";

const SECTION_IDS = [
  "top",
  "vitals",
  "work",
  "about",
  "experiments",
  "designs",
  "play",
  "signal",
  "reading",
  "contact",
];

const portfolioLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#experiments", label: "Projects" },
  { href: "/#designs", label: "Designs" },
];

const explorationsLinks = [
  { href: "/#signal", label: "Writing" },
  { href: "/#reading", label: "Reading" },
];

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrolled;
}

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

function NavDropdown({
  label,
  items,
  active,
}: {
  label: string;
  items: { href: string; label: string }[];
  active: boolean;
}) {
  return (
    <div className="group relative">
      <span
        tabIndex={0}
        className={clsx(
          "font-mono text-[11px] tracking-wide cursor-default flex items-center gap-1 outline-none",
          active ? "text-primary" : "text-secondary"
        )}
      >
        {label} <span className="text-[8px]">▾</span>
      </span>
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute top-[26px] left-0 min-w-[150px] bg-card border border-border rounded-[10px] p-2 flex flex-col shadow-[0_10px_28px_rgba(0,0,0,0.07)] z-[60]">
        {items.map(({ href, label: itemLabel }) => (
          <Link
            key={href}
            href={href}
            className="font-mono text-[11px] tracking-wide text-secondary hover:text-primary hover:bg-background transition-colors no-underline px-[10px] py-2 rounded-md"
          >
            {itemLabel}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const scrolled = useScrolled();
  const active = useActiveSection(pathname === "/");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
  const [mobileExplorationsOpen, setMobileExplorationsOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (isAdmin) return null;

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-10 py-[18px] flex items-center justify-between",
        scrolled
          ? "bg-[rgba(251,251,250,0.85)] backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <Link href="/#top" className="flex items-center gap-[10px] no-underline">
        <span className="w-[7px] h-[7px] rounded-full bg-accent blink-dot" />
        <span className="font-mono text-[13px] tracking-wide text-primary">
          danielzkim
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-[18px] flex-wrap justify-end">
        <Link
          href="/#vitals"
          className={clsx(
            "font-mono text-[11px] tracking-wide no-underline",
            active === "vitals" ? "text-primary" : "text-secondary"
          )}
        >
          Accomplishments
        </Link>

        <NavDropdown
          label="Portfolio"
          items={portfolioLinks}
          active={["work", "experiments", "designs"].includes(active ?? "")}
        />

        <Link
          href="/#about"
          className={clsx(
            "font-mono text-[11px] tracking-wide no-underline",
            active === "about" ? "text-primary" : "text-secondary"
          )}
        >
          About
        </Link>

        <NavDropdown
          label="Explorations"
          items={explorationsLinks}
          active={["signal", "reading"].includes(active ?? "")}
        />

        <Link
          href="/#play"
          className={clsx(
            "font-mono text-[11px] tracking-wide no-underline",
            active === "play" ? "text-primary" : "text-secondary"
          )}
        >
          Play
        </Link>

        <a
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] tracking-wide text-secondary no-underline"
        >
          Resume
        </a>

        <Link
          href="/#contact"
          className="font-mono text-[11px] tracking-wide text-primary no-underline border border-primary rounded-full px-[15px] py-[7px]"
        >
          Contact
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-1"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <span
          className={clsx(
            "block w-5 h-px bg-primary transition-transform duration-200",
            menuOpen && "translate-y-2.5 rotate-45"
          )}
        />
        <span
          className={clsx(
            "block w-5 h-px bg-primary transition-opacity duration-200",
            menuOpen && "opacity-0"
          )}
        />
        <span
          className={clsx(
            "block w-5 h-px bg-primary transition-transform duration-200",
            menuOpen && "-translate-y-2.5 -rotate-45"
          )}
        />
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-background z-40 flex flex-col items-center overflow-y-auto py-10 gap-6">
          <Link href="/#vitals" className="font-mono text-lg text-primary no-underline">
            Accomplishments
          </Link>

          <button
            className="font-mono text-lg text-primary flex items-center gap-2"
            onClick={() => setMobilePortfolioOpen((v) => !v)}
          >
            Portfolio <span className="text-xs">{mobilePortfolioOpen ? "▴" : "▾"}</span>
          </button>
          {mobilePortfolioOpen && (
            <div className="flex flex-col items-center gap-4 -mt-2">
              {portfolioLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="font-mono text-sm text-secondary no-underline">
                  {label}
                </Link>
              ))}
            </div>
          )}

          <Link href="/#about" className="font-mono text-lg text-primary no-underline">
            About
          </Link>

          <button
            className="font-mono text-lg text-primary flex items-center gap-2"
            onClick={() => setMobileExplorationsOpen((v) => !v)}
          >
            Explorations <span className="text-xs">{mobileExplorationsOpen ? "▴" : "▾"}</span>
          </button>
          {mobileExplorationsOpen && (
            <div className="flex flex-col items-center gap-4 -mt-2">
              {explorationsLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="font-mono text-sm text-secondary no-underline">
                  {label}
                </Link>
              ))}
            </div>
          )}

          <Link href="/#play" className="font-mono text-lg text-primary no-underline">
            Play
          </Link>
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-lg text-primary no-underline"
          >
            Resume
          </a>
          <Link
            href="/#contact"
            className="font-mono text-sm text-primary no-underline border border-primary rounded-full px-4 py-2 mt-2"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
