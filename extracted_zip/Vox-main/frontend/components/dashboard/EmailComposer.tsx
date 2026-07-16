"use client";

import { useState } from "react";
import { EmailDraft } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

interface EmailComposerProps {
  draft: EmailDraft;
  onSend: (draft: EmailDraft) => void;
  onCancel: () => void;
  isSending?: boolean;
}

export default function EmailComposer({ draft, onSend, onCancel, isSending = false }: EmailComposerProps) {
  const [currentDraft, setCurrentDraft] = useState<EmailDraft>(draft);
  const [isRewriting, setIsRewriting] = useState(false);
  const { success, error } = useToast();

  const handleChange = (field: keyof EmailDraft, value: string) => {
    setCurrentDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSend = () => {
    onSend(currentDraft);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 md:p-[32px] w-full max-w-2xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] card-enter flex flex-col gap-6 relative overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-surface-variant pb-4">
          <span className="font-label-caps text-label-caps text-secondary tracking-widest">
            EDIT DRAFT
          </span>
          <button onClick={onCancel} className="text-secondary hover:text-on-surface transition-colors p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {/* TO Field */}
          <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
            <span className="font-label-caps text-label-caps text-secondary text-right pt-1">TO</span>
            <input 
              type="text" 
              value={currentDraft.recipient} 
              onChange={(e) => handleChange("recipient", e.target.value)}
              className="bg-surface-container-low px-4 py-2 rounded-full font-body-md text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow w-full"
              placeholder="recipient@example.com"
            />
          </div>

          {/* SUBJECT Field */}
          <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
            <span className="font-label-caps text-label-caps text-secondary text-right pt-1">SUBJECT</span>
            <input 
              type="text" 
              value={currentDraft.subject} 
              onChange={(e) => handleChange("subject", e.target.value)}
              className="bg-surface-container-low px-4 py-2 rounded-full font-body-md text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow w-full"
              placeholder="Email subject"
            />
          </div>

          {/* MESSAGE Field */}
          <div className="grid grid-cols-[80px_1fr] gap-4 h-full min-h-[200px]">
            <span className="font-label-caps text-label-caps text-secondary text-right pt-4">MESSAGE</span>
            <textarea 
              value={currentDraft.body} 
              onChange={(e) => handleChange("body", e.target.value)}
              className="bg-surface-bright rounded-xl p-4 border border-surface-variant font-body-lg text-on-surface-variant leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors h-full w-full"
              placeholder="Write your email here..."
            />
          </div>
        </div>

        {/* Actions */}
        {/* AI Actions */}
        <div className="flex justify-between items-center gap-4 pt-4 border-t border-surface-variant mt-2">
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                setIsRewriting(true);
                try {
                  const res = await api.emails.rewrite({ draft_text: currentDraft.body, instruction: "Improve phrasing and fix grammar" });
                  handleChange("body", res.rewritten_text);
                  success("Draft rewritten");
                } catch (e: any) {
                  error(e.message || "Failed to rewrite");
                } finally {
                  setIsRewriting(false);
                }
              }}
              disabled={isRewriting || isSending}
              className="font-label-caps text-label-caps text-secondary hover:text-on-surface flex items-center gap-1 transition-colors bg-surface-container-low px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">magic_button</span>
              REWRITE
            </button>
            <button 
              onClick={async () => {
                setIsRewriting(true);
                try {
                  const res = await api.emails.rewrite({ draft_text: currentDraft.body, instruction: "Make it more formal and professional" });
                  handleChange("body", res.rewritten_text);
                  success("Draft formalized");
                } catch (e: any) {
                  error(e.message || "Failed to rewrite");
                } finally {
                  setIsRewriting(false);
                }
              }}
              disabled={isRewriting || isSending}
              className="font-label-caps text-label-caps text-secondary hover:text-on-surface flex items-center gap-1 transition-colors bg-surface-container-low px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">business_center</span>
              FORMALIZE
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onCancel}
              className="font-label-caps text-label-caps text-secondary hover:text-on-surface transition-colors bg-transparent border-none cursor-pointer"
            >
              CANCEL
            </button>
            <button 
              onClick={handleSend}
              disabled={isSending || isRewriting || !currentDraft.recipient || !currentDraft.subject}
              className="bg-on-surface text-surface font-label-caps text-label-caps rounded-full px-6 py-3 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSending ? "SENDING..." : "SEND"}
              {!isSending && (
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
