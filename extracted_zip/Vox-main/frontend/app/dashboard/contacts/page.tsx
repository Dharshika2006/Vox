"use client";

import ContactList from "@/components/dashboard/ContactList";

export default function ContactsPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <ContactList />
      </div>
    </div>
  );
}
