"use client";

import EmailHistoryList from "@/components/dashboard/EmailHistory";

export default function HistoryPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <EmailHistoryList />
      </div>
    </div>
  );
}
