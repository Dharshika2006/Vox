"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <div className="bg-transparent text-gray-900 min-h-screen flex flex-col relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Blob matching the dashboard */}
      <div 
        id="shader-container" 
        className="transition-all duration-700 ease-in-out opacity-50"
      />

      <header className="absolute top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-8 bg-transparent">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
          <span className="font-semibold text-lg tracking-tight">Vox</span>
        </div>
        <div className="flex items-center">
          <Link href={isAuthenticated ? "/dashboard" : "/login"} className="hover:opacity-80 transition-opacity flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col justify-center items-center relative z-10 px-6 md:px-10 pt-24 pb-16 w-full">
        <div className="max-w-4xl w-full flex flex-col items-center text-center relative bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[3rem] p-12 md:p-20">
          
          <div className="relative w-24 h-24 mb-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-110 duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          
          <h1 className="text-[40px] leading-[48px] md:text-[64px] md:leading-[72px] font-medium text-black mb-6 tracking-tight">
            Speak naturally.<br/>Let Vox handle your email.
          </h1>
          
          <p className="text-lg text-gray-500 max-w-2xl mb-12">
            Generate, review, and send professional emails using only your voice. Experience the fluidity of thought translated instantly into polished prose.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {!isLoading && isAuthenticated ? (
              <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-lg font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all min-w-[200px] flex items-center justify-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-lg font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all min-w-[200px] flex items-center justify-center">
                  Start Speaking
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white/50 backdrop-blur-sm border border-white/60 text-gray-800 rounded-full text-lg font-semibold hover:bg-white/70 transition-all min-w-[200px] flex items-center justify-center shadow-sm hover:shadow">
                  See Demo
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="w-full py-8 z-10 relative mt-auto">
        <div className="flex flex-col md:flex-row justify-center items-center px-6 md:px-12 max-w-7xl mx-auto w-full">
          <p className="text-xs text-gray-400 mb-4 md:mb-0 uppercase tracking-widest font-medium text-center">
            © 2026 Vox Intelligence. Precision in every word.
          </p>
        </div>
      </footer>
    </div>
  );
}
