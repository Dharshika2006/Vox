"use client";

import { useState } from "react";
import { useContacts } from "@/hooks/useContacts";
import { getInitials } from "@/utils/format";
import { Contact } from "@/types";

export default function ContactList() {
  const { contacts, isLoading, fetchContacts, addContact, updateContact, deleteContact } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Modal states
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
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

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !newName || !newEmail) return;
    
    setIsSubmitting(true);
    const success = await updateContact(selectedContact.id, newName, newEmail);
    setIsSubmitting(false);
    
    if (success) {
      setIsEditingContact(false);
      setSelectedContact(null);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    if (confirm(`Are you sure you want to delete ${selectedContact.name}?`)) {
      const success = await deleteContact(selectedContact.id);
      if (success) {
        setSelectedContact(null);
      }
    }
  };

  const openEditModal = () => {
    if (!selectedContact) return;
    setNewName(selectedContact.name);
    setNewEmail(selectedContact.emails[0]?.email || "");
    setIsEditingContact(true);
  };

  if (isLoading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 w-full h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/40 backdrop-blur-2xl rounded-[2rem] border border-white/60 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] w-full max-w-5xl mx-auto relative z-20">
      <div className="border-b border-white/40 bg-white/30 backdrop-blur-md px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">Contacts</h2>
          <span className="text-sm text-gray-400 font-medium">{contacts.length} people</span>
        </div>
        
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
            <svg 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
          
          <button 
            onClick={() => setIsAddingContact(true)}
            className="flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap active:scale-95"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-6 rounded-full bg-gray-100 p-5">
              <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-black">
              No contacts found
            </h3>
            <p className="mt-3 text-base text-gray-500 max-w-sm">
              {searchQuery ? "Try a different search term." : "Add some contacts to easily email them by name."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  setIsEditingContact(false);
                }}
                className="group flex flex-col p-6 rounded-2xl border border-transparent bg-white/60 hover:bg-white/80 hover:border-white/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative backdrop-blur-sm"
              >
                {contact.is_favorite && (
                  <div className="absolute top-4 right-4 text-yellow-400">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
                
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold text-lg">
                    {getInitials(contact.name)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-black text-lg">
                      {contact.name}
                    </h4>
                    {contact.nickname && (
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        "{contact.nickname}"
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto space-y-2 pt-4 border-t border-gray-50">
                  {contact.emails.slice(0, 2).map(email => (
                    <div key={email.id} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{email.email}</span>
                      {email.is_primary && (
                        <span className="ml-2 text-[9px] uppercase tracking-widest text-black font-bold bg-gray-100 rounded px-1.5 py-0.5">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                  {contact.emails.length > 2 && (
                    <p className="text-xs text-gray-400 pl-6.5 font-medium mt-1">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-lg p-8">
            <h3 className="text-2xl font-semibold text-black mb-6">Add New Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  placeholder="e.g. Sarah Jones"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  placeholder="sarah.j@design.co"
                  required
                />
              </div>
              
              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddingContact(false)}
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newName || !newEmail}
                  className="px-8 py-3 bg-black hover:bg-gray-900 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Contact Modal */}
      {selectedContact && !isEditingContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-lg p-8 relative">
            <button 
              onClick={() => setSelectedContact(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center mb-8">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold text-3xl">
                {getInitials(selectedContact.name)}
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-bold text-black">{selectedContact.name}</h3>
                {selectedContact.nickname && (
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    "{selectedContact.nickname}"
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Addresses</h4>
              {selectedContact.emails.map(email => (
                <div key={email.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center text-base font-medium text-black">
                    <svg className="w-5 h-5 mr-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{email.email}</span>
                  </div>
                  {email.is_primary && (
                    <span className="text-[10px] uppercase tracking-widest text-black font-bold bg-white border border-gray-200 rounded px-2 py-1 shadow-sm">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleDeleteContact}
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  onClick={openEditModal}
                  className="px-8 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-gray-900 transition-all active:scale-95"
                >
                  Edit Contact
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {selectedContact && isEditingContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-lg p-8">
            <h3 className="text-2xl font-semibold text-black mb-6">Edit Contact</h3>
            <form onSubmit={handleUpdateContact} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
              </div>
              
              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditingContact(false)}
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newName || !newEmail}
                  className="px-8 py-3 bg-black hover:bg-gray-900 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
