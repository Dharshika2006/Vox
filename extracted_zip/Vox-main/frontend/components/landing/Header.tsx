"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { isAuthenticated, login, user } = useAuth();

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 sm:px-8 relative z-10">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-on-surface font-[family-name:var(--font-display)] text-sm font-semibold text-surface">
          V
        </span>
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-on-surface">
          Vox
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <span className="hidden font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-outline sm:inline">
          Voice &rarr; Action
        </span>
        
        {isAuthenticated ? (
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-sm font-medium text-on-surface shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            Go to Dashboard
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        ) : (
          <button 
            onClick={login}
            className="flex items-center gap-2 rounded-full bg-on-surface px-4 py-2 text-sm font-medium text-surface shadow-sm transition-all hover:bg-primary hover:shadow-md"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
