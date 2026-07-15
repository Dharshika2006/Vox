"use client";

import { useState } from "react";
import { useContacts } from "@/hooks/useContacts";
import { getInitials } from "@/utils/format";
import { Contact } from "@/types";

export default function ContactList() {
  const { contacts, isLoading, fetchContacts, addContact } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Modal states
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts(searchQuery);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    
    setIsSubmitting(true);
    const success = await addContact(newName, newEmail);
    setIsSubmitting(false);
    
    if (success) {
      setIsAddingContact(false);
      setNewName("");
      setNewEmail("");
    }
  };

  if (isLoading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm relative">
      <div className="border-b border-[var(--border)] bg-[var(--bg-primary)] px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">Contacts</h2>
          <span className="text-xs text-[var(--text-muted)]">{contacts.length} people</span>
        </div>
        
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1a1917] border border-[var(--border)] rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
          
          <button 
            onClick={() => setIsAddingContact(true)}
            className="flex items-center justify-center bg-[var(--text-primary)] hover:bg-[var(--accent)] text-white p-1.5 px-3 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-4 rounded-full bg-[var(--bg-primary)] p-4">
              <svg className="h-8 w-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-medium text-[var(--text-primary)]">
              No contacts found
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {searchQuery ? "Try a different search term." : "Add some contacts to easily email them by name."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="group flex flex-col p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1a1917] hover:border-[var(--accent)]/50 hover:shadow-md transition-all cursor-pointer relative"
              >
                {contact.is_favorite && (
                  <div className="absolute top-3 right-3 text-yellow-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
                
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] font-bold text-sm">
                    {getInitials(contact.name)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {contact.name}
                    </h4>
                    {contact.nickname && (
                      <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
                        "{contact.nickname}"
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto space-y-1.5 pt-3 border-t border-[var(--border-light)]">
                  {contact.emails.slice(0, 2).map(email => (
                    <div key={email.id} className="flex items-center text-sm text-[var(--text-secondary)]">
                      <svg className="w-3.5 h-3.5 mr-2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{email.email}</span>
                      {email.is_primary && (
                        <span className="ml-2 text-[8px] uppercase tracking-widest text-[var(--accent)] border border-[var(--accent)]/30 rounded px-1 py-0.5">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                  {contact.emails.length > 2 && (
                    <p className="text-xs text-[var(--text-muted)] pl-5">
                      +{contact.emails.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Contact Modal */}
      {isAddingContact && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add New Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1917] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="e.g. Surya"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1917] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="surya@example.com"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
                <button 
                  type="button" 
                  onClick={() => setIsAddingContact(false)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newName || !newEmail}
                  className="px-4 py-2 bg-[var(--text-primary)] hover:bg-[var(--accent)] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
