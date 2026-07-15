"use client";

import { ConversationMessage } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

interface ConversationPanelProps {
    conversation: any;
    onEdit?: () => void;
    onSend?: () => void;
    isSending?: boolean;
}

export default function ConversationPanel({ conversation, onEdit, onSend, isSending }: ConversationPanelProps) {
  const { messages, isProcessing, draft, state } = conversation;

  if (!draft) {
    return (
      <div className="flex h-full flex-col space-y-6">
        <div className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-xl shadow-charcoal/5 p-10 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high/50 ring-1 ring-white/20 shadow-sm">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">mark_email_unread</span>
          </div>
          <h3 className="font-headline-sm text-xl text-on-surface">No Draft Yet</h3>
          <p className="mt-3 max-w-sm font-body-md text-sm text-on-surface-variant leading-relaxed">
            Speak to the AI assistant to start drafting your email. The preview will appear here.
          </p>

          <div className="mt-8 w-full max-w-md space-y-4">
            <AnimatePresence>
              {messages.map((msg: ConversationMessage, i: number) => (
                <motion.div 
                  key={`msg-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full text-sm",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "rounded-xl px-4 py-2 max-w-[85%]",
                    msg.role === "user" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full justify-start text-sm"
              >
                <div className="rounded-xl px-4 py-3 max-w-[85%] bg-surface-container flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-pulse" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Email Draft Card */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-xl shadow-charcoal/5 hover:scale-[1.01] transition-transform duration-500 ease-out">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 space-y-4 bg-surface-container-lowest/50">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Draft Preview</h2>
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-[10px] flex items-center space-x-1">
              {state === "DRAFT_READY" ? (
                <>
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Ready</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container animate-pulse"></span>
                  <span>Auto-Saving</span>
                </>
              )}
            </span>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="flex items-center text-body-md border-b border-outline-variant/20 pb-2">
              <span className="w-16 text-on-surface-variant font-medium text-sm">To:</span>
              <span className="text-on-surface">{draft.recipient}</span>
            </div>
            
            <div className="flex items-center text-body-md border-b border-outline-variant/20 pb-2">
              <span className="w-16 text-on-surface-variant font-medium text-sm">Subject:</span>
              <span className="text-on-surface font-semibold">{draft.subject}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
          {draft.body}
        </div>
      </div>

      {/* Action Buttons Panel */}
      <div className="glass-panel rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-xl shadow-charcoal/5">
        <button 
          onClick={conversation.endConversation}
          disabled={isSending}
          className="h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-body-md text-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <span>Discard</span>
        </button>

        <button 
          onClick={onEdit}
          disabled={isSending}
          className="h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-body-md text-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span>Edit Draft</span>
        </button>

        <button 
          onClick={onSend}
          disabled={isSending || !draft.recipient || !draft.subject}
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
