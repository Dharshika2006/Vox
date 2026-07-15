"use client";

import { useState } from "react";
import { EmailDraft } from "@/types";

interface EmailComposerProps {
  draft: EmailDraft;
  onSend: (draft: EmailDraft) => void;
  onCancel: () => void;
  isSending?: boolean;
}

export default function EmailComposer({ draft, onSend, onCancel, isSending = false }: EmailComposerProps) {
  const [currentDraft, setCurrentDraft] = useState<EmailDraft>(draft);
  const [showCc, setShowCc] = useState(!!draft.cc);
  const [showBcc, setShowBcc] = useState(!!draft.bcc);

  const handleChange = (field: keyof EmailDraft, value: string) => {
    setCurrentDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSend = () => {
    onSend(currentDraft);
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Email Draft Card */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-xl shadow-charcoal/5 hover:scale-[1.01] transition-transform duration-500 ease-out">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 space-y-4 bg-surface-container-lowest/50">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Draft Preview</h2>
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-[10px]">Auto-Saving</span>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="flex items-center text-body-md border-b border-outline-variant/20 pb-2">
              <span className="w-16 text-on-surface-variant font-medium text-sm">To:</span>
              <input 
                type="text" 
                value={currentDraft.recipient} 
                onChange={(e) => handleChange("recipient", e.target.value)}
                className="flex-1 bg-transparent text-on-surface focus:outline-none"
                placeholder="recipient@example.com"
              />
            </div>
            
            <div className="flex items-center text-body-md border-b border-outline-variant/20 pb-2">
              <span className="w-16 text-on-surface-variant font-medium text-sm">Subject:</span>
              <input 
                type="text" 
                value={currentDraft.subject} 
                onChange={(e) => handleChange("subject", e.target.value)}
                className="flex-1 bg-transparent text-on-surface font-semibold focus:outline-none"
                placeholder="Email subject"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <textarea 
            value={currentDraft.body} 
            onChange={(e) => handleChange("body", e.target.value)}
            className="w-full h-full min-h-[300px] resize-none bg-transparent font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap focus:outline-none"
            placeholder="Write your email here..."
          />
        </div>
      </div>

      {/* Action Buttons Panel */}
      <div className="glass-panel rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-xl shadow-charcoal/5">
        <button 
          onClick={onCancel}
          disabled={isSending}
          className="h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-body-md text-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">cancel</span>
          <span>Cancel</span>
        </button>

        <button 
          className="h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-body-md text-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span>Rewrite</span>
        </button>

        <button 
          onClick={handleSend}
          disabled={isSending || !currentDraft.recipient || !currentDraft.subject}
          className="col-span-2 mt-2 h-14 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline-sm text-[16px] shadow-lg shadow-primary-container/30 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:scale-100"
        >
          <span>{isSending ? "Sending..." : "Send Email"}</span>
          {!isSending && (
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          )}
        </button>
      </div>
    </div>
  );
}
