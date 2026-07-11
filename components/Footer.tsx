"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";

const EMAIL = "dzk503@berkeley.edu";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/danielzkim/" },
  { label: "Twitter", href: "https://x.com/daniel_zkim" },
  { label: "Newsletter", href: "https://theneurotechnapkin.substack.com/" },
  {
    label: "Resume",
    href: "https://drive.google.com/file/d/1p63gdl-aifPjrtCgJ7ILW-nPGQy-ciKi/view?usp=sharing",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  if (pathname.startsWith("/admin")) return null;

  const sendMessage = () => {
    const name = nameRef.current?.value ?? "";
    const email = emailRef.current?.value ?? "";
    const msg = msgRef.current?.value ?? "";
    const subject = encodeURIComponent(
      `Portfolio contact from ${name || "a visitor"}`
    );
    const body = encodeURIComponent(
      `${msg}${email ? `\n\nReply to: ${email}` : ""}`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <footer
      id="contact"
      className="px-6 md:px-10 pt-24 md:pt-[104px] pb-20"
    >
      <div className="flex items-center gap-3.5 mb-6">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          09
        </span>
        <span className="label-meta text-tertiary">Contact</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <div className="flex gap-11 flex-wrap">
        <div className="flex-1 min-w-[300px] flex flex-col gap-5 basis-[380px]">
          <span className="font-medium text-[clamp(24px,2.6vw,34px)] tracking-[-0.025em] text-primary">
            Let&apos;s build something human.
          </span>
          <a
            href={`mailto:${EMAIL}`}
            className="font-mono text-[13px] text-secondary no-underline"
          >
            {EMAIL}
          </a>
          <div className="flex gap-5 flex-wrap">
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-secondary hover:text-primary transition-colors no-underline"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-[280px] basis-[340px] border border-border rounded-xl p-6 bg-card">
          <span className="label-meta text-tertiary">Send a message</span>
          <div className="flex flex-col gap-3 mt-4">
            <input
              ref={nameRef}
              type="text"
              placeholder="Name"
              className="text-[13.5px] text-primary border border-[#e2e2e0] rounded-lg px-[13px] py-[11px] outline-none bg-background"
            />
            <input
              ref={emailRef}
              type="email"
              placeholder="Email"
              className="text-[13.5px] text-primary border border-[#e2e2e0] rounded-lg px-[13px] py-[11px] outline-none bg-background"
            />
            <textarea
              ref={msgRef}
              placeholder="Message"
              rows={3}
              className="text-[13.5px] text-primary border border-[#e2e2e0] rounded-lg px-[13px] py-[11px] outline-none bg-background resize-y"
            />
            <button
              onClick={sendMessage}
              className="font-mono text-xs tracking-wide text-white bg-primary border-none rounded-lg py-3 cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-14 pt-6 border-t border-border-light">
        <span className="font-mono text-[11px] text-[#bdbdbd]">
          © 2026 Daniel Kim
        </span>
        <span className="font-mono text-[11px] text-[#bdbdbd]">
          San Francisco Bay Area
        </span>
      </div>
    </footer>
  );
}
