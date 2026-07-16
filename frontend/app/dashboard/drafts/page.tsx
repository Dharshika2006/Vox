"use client";

import Link from "next/link";
import { useEmailHistory } from "@/hooks/useEmailHistory";
import { getInitials } from "@/utils/format";
import { api } from "@/lib/api";

export default function DraftsPage() {
  const { emails, isLoading, removeEmail } = useEmailHistory();
  
  // Filter for drafts/failed (mocking actual draft state since backend only has 'sent' and 'failed')
  const drafts = emails.filter(e => e.status !== 'sent');

  return (
    <div className="flex h-full flex-col relative z-10">
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center gap-4">
        <div className="w-16 h-16 bg-white/60 shadow-sm rounded-full flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[32px] text-gray-800" style={{ fontVariationSettings: "'FILL' 0" }}>edit_document</span>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Voice Drafts</h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Continue editing or send drafts you previously started.
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-variant border-t-primary" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center p-10 text-center bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] max-w-5xl">
          <span className="material-symbols-outlined text-[48px] text-gray-400 mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>draft</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No drafts found</h3>
          <p className="text-gray-500">Start a new voice command to create a draft.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-8 transition-all duration-300 border border-transparent hover:bg-white/80 hover:border-white/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials(draft.recipient)}
                  </div>
                  <span className="font-label-caps text-label-caps text-secondary tracking-widest truncate max-w-[150px]">
                    TO: {draft.recipient}
                  </span>
                </div>
                <span className="font-label-sm text-secondary">
                  {new Date(draft.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <h3 className="font-body-lg font-bold text-on-surface mb-2 line-clamp-1">{draft.subject}</h3>
                <p className="font-body-md text-on-surface-variant line-clamp-2 opacity-80">{draft.body}</p>
              </div>

              <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-200/50">
                <button 
                  onClick={async () => {
                    try {
                      await api.emails.delete(draft.id);
                      removeEmail(draft.id);
                    } catch (err) {
                      console.error("Failed to delete draft:", err);
                    }
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                </button>
                <Link 
                  href={`/dashboard?draftId=${draft.id}`}
                  className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center"
                >
                  Resume
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
