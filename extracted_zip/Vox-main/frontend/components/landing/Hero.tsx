"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Hero() {
  const { isAuthenticated, login } = useAuth();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-24 pt-12 text-center sm:px-8 sm:pt-20">
      <span className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-primary">
        Voice-to-Action Assistant
      </span>

      <h1 className="font-[family-name:var(--font-display)] text-[2.75rem] leading-[1.08] tracking-tight text-on-surface sm:text-6xl">
        Speak Naturally.
        <br />
        Vox Does the Rest.
      </h1>

      <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-on-surface-variant">
        Vox turns natural voice commands into real actions. Say what you
        need, and Vox listens, understands, and carries it out — starting
        with email, your first supported action.
      </p>

      <div className="mt-10 flex flex-col items-center gap-5">
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-on-surface px-8 py-4 text-base font-medium text-surface shadow-lg transition-all hover:scale-105 hover:bg-primary hover:shadow-xl"
          >
            Go to Dashboard
          </Link>
        ) : (
          <button
            onClick={login}
            className="rounded-full bg-on-surface px-8 py-4 text-base font-medium text-surface shadow-lg transition-all hover:scale-105 hover:bg-primary hover:shadow-xl"
          >
            Start using Vox for free
          </button>
        )}
      </div>
    </section>
  );
}