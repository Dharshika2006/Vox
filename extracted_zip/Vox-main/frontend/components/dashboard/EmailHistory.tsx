"use client";

import { useState } from "react";
import { useEmailHistory } from "@/hooks/useEmailHistory";
import { formatDate } from "@/utils/format";
import { getInitials } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";

export default function EmailHistoryList() {
  const { emails, isLoading, hasMore, loadMore } = useEmailHistory();
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  if (isLoading && emails.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-variant border-t-primary" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-10 text-center bg-surface-bright rounded-[1.5rem] border border-surface-variant">
        <div className="mb-6 rounded-full bg-surface-container-high p-6">
          <span className="material-symbols-outlined text-[32px] text-secondary">inbox</span>
        </div>
        <h3 className="font-headline-lg-mobile text-on-surface mb-2">
          No emails yet
        </h3>
        <p className="font-body-md text-on-surface-variant max-w-md">
          Emails you process using Vox will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface-bright rounded-[1.5rem] p-4 md:p-8 border border-surface-variant shadow-[0_4px_24px_rgba(0,0,0,0.02)] w-full">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-4 border-b border-surface-variant mb-4 font-label-caps text-label-caps text-secondary tracking-widest">
          <div className="col-span-4">RECIPIENT</div>
          <div className="col-span-4">SUBJECT</div>
          <div className="col-span-2">DATE</div>
          <div className="col-span-2">STATUS</div>
        </div>

        {/* List Items */}
        <div className="flex flex-col gap-2">
          {emails.map((email) => (
            <div 
              key={email.id} 
              onClick={() => setSelectedEmail(email)}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl cursor-pointer transition-all hover:bg-surface-container hover:-translate-y-0.5 border border-transparent hover:border-surface-variant"
            >
              {/* Recipient */}
              <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(email.recipient)}
                </div>
                <span className="font-body-md text-on-surface font-medium truncate">
                  {email.recipient}
                </span>
              </div>
              
              {/* Subject */}
              <div className="col-span-1 md:col-span-4">
                <span className="font-body-md text-on-surface-variant truncate block">
                  {email.subject}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-1 md:col-span-2">
                <span className="font-label-sm text-secondary">
                  {formatDate(email.created_at)}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-start">
                <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-caps text-[10px] tracking-widest ${
                  email.status === 'sent' 
                    ? 'bg-primary-container/30 text-on-primary-container' 
                    : email.status === 'failed'
                    ? 'bg-error-container/30 text-on-error-container'
                    : 'bg-surface-container-high text-secondary'
                }`}>
                  {email.status}
                </span>
                <span className="material-symbols-outlined text-secondary md:hidden" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button 
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant bg-surface-container rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              {isLoading ? "LOADING..." : "LOAD MORE"}
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-[1.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-surface-variant">
                <span className="font-label-caps text-label-caps text-secondary tracking-widest">EMAIL DETAILS</span>
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="text-secondary hover:text-on-surface transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
                
                {/* Metadata */}
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <span className="font-label-caps text-label-caps text-secondary text-right pt-1">TO</span>
                    <div className="bg-surface-container-low px-4 py-2 rounded-full inline-flex items-center gap-2 w-fit">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                      <span className="font-body-md text-on-surface font-medium">{selectedEmail.recipient}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px_1fr] gap-4 items-baseline">
                    <span className="font-label-caps text-label-caps text-secondary text-right">SUBJECT</span>
                    <span className="font-headline-lg-mobile text-on-surface break-words leading-tight">
                      {selectedEmail.subject}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <span className="font-label-caps text-label-caps text-secondary text-right pt-1">DATE</span>
                    <span className="font-body-md text-secondary">
                      {formatDate(selectedEmail.created_at)}
                    </span>
                  </div>
                </div>
                
                {/* Body */}
                <div className="grid grid-cols-[80px_1fr] gap-4">
                  <span className="font-label-caps text-label-caps text-secondary text-right pt-2">MESSAGE</span>
                  <div className="bg-surface-bright rounded-xl p-6 border border-surface-variant font-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body}
                  </div>
                </div>
                
                {selectedEmail.transcript && (
                  <div className="grid grid-cols-[80px_1fr] gap-4 mt-2">
                    <span className="font-label-caps text-label-caps text-secondary text-right pt-2">AUDIO</span>
                    <div className="bg-surface-container-low p-4 rounded-xl border border-surface-variant text-sm italic text-secondary">
                      "{selectedEmail.transcript}"
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
