"use client";

import { useState } from "react";
import { useEmailHistory } from "@/hooks/useEmailHistory";
import { formatDate } from "@/utils/format";

export default function EmailHistoryList() {
  const { emails, isLoading } = useEmailHistory();
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  if (isLoading && emails.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-10 text-center">
        <div className="mb-6 rounded-full bg-[var(--bg-primary)] p-4">
          <svg className="h-8 w-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-medium text-[var(--text-primary)]">
          No emails yet
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Emails you send using Vox will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
      <div className="border-b border-[var(--border)] bg-[var(--bg-primary)] px-6 py-4 flex justify-between items-center">
        <h2 className="font-semibold text-[var(--text-primary)]">History</h2>
        <span className="text-xs text-[var(--text-muted)]">{emails.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-primary)]/50">
              <th className="px-6 py-3 font-medium">Recipient</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {emails.map((email) => (
              <tr 
                key={email.id} 
                onClick={() => setSelectedEmail(email)}
                className="hover:bg-[var(--bg-primary)] cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
                  {email.recipient}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)] truncate max-w-xs group-hover:text-[var(--text-primary)] transition-colors">
                  {email.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    email.status === 'sent' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : email.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {email.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-muted)] text-right whitespace-nowrap">
                  {formatDate(email.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Email Details</h3>
              <button 
                onClick={() => setSelectedEmail(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-primary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4 mb-6 text-sm">
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span className="text-[var(--text-muted)] font-medium">To:</span>
                  <span className="text-[var(--text-primary)]">{selectedEmail.recipient}</span>
                </div>
                {selectedEmail.cc && (
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-[var(--text-muted)] font-medium">Cc:</span>
                    <span className="text-[var(--text-primary)]">{selectedEmail.cc}</span>
                  </div>
                )}
                {selectedEmail.bcc && (
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-[var(--text-muted)] font-medium">Bcc:</span>
                    <span className="text-[var(--text-primary)]">{selectedEmail.bcc}</span>
                  </div>
                )}
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <span className="text-[var(--text-muted)] font-medium">Date:</span>
                  <span className="text-[var(--text-primary)]">{formatDate(selectedEmail.created_at)}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 pt-2 border-t border-[var(--border-light)]">
                  <span className="text-[var(--text-muted)] font-medium mt-0.5">Subject:</span>
                  <span className="text-[var(--text-primary)] font-medium text-base">{selectedEmail.subject}</span>
                </div>
              </div>
              
              <div className="bg-[var(--bg-primary)] p-5 rounded-xl border border-[var(--border-light)] text-sm whitespace-pre-wrap text-[var(--text-secondary)] leading-relaxed font-sans min-h-[200px]">
                {selectedEmail.body}
              </div>
              
              {selectedEmail.transcript && (
                <div className="mt-6">
                  <h4 className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">Original Transcript</h4>
                  <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border-light)] border-dashed text-sm italic text-[var(--text-secondary)]">
                    "{selectedEmail.transcript}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
