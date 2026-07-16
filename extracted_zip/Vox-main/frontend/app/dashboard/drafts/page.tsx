"use client";

import Link from "next/link";
import { useEmailHistory } from "@/hooks/useEmailHistory";
import { getInitials } from "@/utils/format";

export default function DraftsPage() {
  const { emails, isLoading } = useEmailHistory();
  
  // Filter for drafts/failed (mocking actual draft state since backend only has 'sent' and 'failed')
  const drafts = emails.filter(e => e.status !== 'sent');

  return (
    <div className="flex h-full flex-col relative z-10">
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center gap-4">
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[32px] text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>edit_document</span>
        </div>
        <div>
          <h1 className="font-display text-headline-lg-mobile md:text-display text-on-surface mb-2 tracking-tight">Voice Drafts</h1>
          <p className="font-body-md text-on-surface-variant text-[16px] max-w-2xl opacity-80">
            Continue editing or send drafts you previously started.
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-variant border-t-primary" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center p-10 text-center bg-surface-container-low rounded-[1.5rem] border border-surface-variant border-dashed">
          <span className="material-symbols-outlined text-[48px] text-surface-variant mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>draft</span>
          <h3 className="font-headline-lg-mobile text-on-surface-variant mb-2">No drafts found</h3>
          <p className="font-body-md text-secondary">Start a new voice command to create a draft.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-surface-container-low rounded-[1.5rem] p-8 hover:bg-surface-container-high transition-colors border border-transparent hover:border-surface-variant/50 group flex flex-col gap-4">
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

              <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-surface-variant/50">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                </button>
                <Link 
                  href="/dashboard" 
                  className="px-6 py-2 bg-on-surface text-surface rounded-full font-label-caps text-label-caps hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
                >
                  RESUME
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
