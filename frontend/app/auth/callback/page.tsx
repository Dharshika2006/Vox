"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuth();
  
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    
    if (token) {
      setToken(token);
    } else if (error) {
      console.error("Auth error:", error);
      router.push("/?error=" + encodeURIComponent(error));
    } else {
      router.push("/");
    }
  }, [searchParams, router, setToken]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
      <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--text-secondary)]">
        Authenticating...
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--text-secondary)]">
            Loading...
          </p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
