"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden relative">
      {/* Top Navigation */}
      <header className="flex justify-between items-center px-12 py-8 z-10 relative shrink-0">
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
            <span className="font-semibold text-lg tracking-tight text-black hidden sm:block">Vox</span>
          </Link>
          <nav className="flex space-x-6 md:space-x-8 text-base md:text-lg font-medium text-gray-400">
            <Link 
              href="/dashboard/inbox" 
            className={`transition-colors ${pathname === '/dashboard/inbox' ? 'text-black font-semibold' : 'hover:text-black'}`}
          >
            Inbox
            {pathname === '/dashboard/inbox' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rotate-45"></div>
            )}
          </Link>
          <div className="relative">
            <Link 
              href="/dashboard" 
              className={`transition-colors ${pathname === '/dashboard' ? 'text-black font-semibold' : 'text-gray-400 hover:text-black'}`}
            >
              Compose
              {pathname === '/dashboard' && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rotate-45"></div>
              )}
            </Link>
          </div>
          <Link 
            href="/dashboard/drafts" 
            className={`transition-colors ${pathname === '/dashboard/drafts' ? 'text-black font-semibold' : 'hover:text-black'}`}
          >
            Drafts
            {pathname === '/dashboard/drafts' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rotate-45"></div>
            )}
          </Link>
        </nav>
        </div>
        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-gray-200 cursor-pointer">
          {user?.picture ? (
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src={user.picture}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 w-full overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <footer className="pb-12 z-10 relative shrink-0 mt-auto">
        <nav className="flex justify-center space-x-16">
          <Link href="/dashboard" className="flex flex-col items-center space-y-2 group">
            <svg className={`w-6 h-6 transition-transform group-hover:-translate-y-1 ${pathname === '/dashboard' ? 'text-black' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span className={`text-[10px] tracking-widest uppercase font-bold ${pathname === '/dashboard' ? 'text-black' : 'text-gray-400'}`}>Assistant</span>
          </Link>
          
          <Link href="/dashboard/contacts" className="flex flex-col items-center space-y-2 group">
            <svg className={`w-6 h-6 transition-transform group-hover:-translate-y-1 ${pathname === '/dashboard/contacts' ? 'text-black' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
            <span className={`text-[10px] tracking-widest uppercase font-bold ${pathname === '/dashboard/contacts' ? 'text-black' : 'text-gray-400'}`}>Global</span>
          </Link>
          
          <Link href="/dashboard/learn" className="flex flex-col items-center space-y-2 group">
            <svg className={`w-6 h-6 transition-transform group-hover:-translate-y-1 ${pathname === '/dashboard/learn' ? 'text-black' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className={`text-[10px] tracking-widest uppercase font-bold ${pathname === '/dashboard/learn' ? 'text-black' : 'text-gray-400'}`}>Learn</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
