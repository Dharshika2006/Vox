"use client";

import EmailHistoryList from "@/components/dashboard/EmailHistory";

export default function InboxPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-12 text-center md:text-left">
        <h1 className="font-display text-headline-lg-mobile md:text-display text-on-surface mb-2 tracking-tight">Processed Voice Memos</h1>
        <p className="font-body-md text-on-surface-variant text-[16px] max-w-2xl opacity-80">
          Your recent audio commands, transcribed and formatted into actionable emails.
        </p>
      </div>
      
      <div className="flex-1 w-full">
        <EmailHistoryList />
      </div>
    </div>
  );
}
