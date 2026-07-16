"use client";

import { useAuth } from "@/hooks/useAuth";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await login();
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-container/50 border border-error/20 text-error text-sm backdrop-blur-md">
          {error}
        </div>
      )}
      
      <button 
        onClick={handleLogin}
        disabled={isLoading || isLoggingIn}
        className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 rounded-xl font-headline-sm text-[16px] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
      >
        {isLoggingIn ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container p-6">
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-primary-container/20 to-secondary-container/20 blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full bg-surface-bright/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-charcoal/10 rounded-[2rem] p-8 md:p-12 text-center relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>graphic_eq</span>
          </div>
        </div>
        
        <h1 className="font-display text-3xl font-medium text-on-surface mb-2">Welcome to Vox</h1>
        <p className="font-body-md text-on-surface-variant mb-8">Sign in to start sending emails with your voice.</p>
        
        <Suspense fallback={<div className="h-20 flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
          <LoginForm />
        </Suspense>
        
        <p className="mt-8 text-xs text-on-surface-variant max-w-xs mx-auto opacity-70">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
