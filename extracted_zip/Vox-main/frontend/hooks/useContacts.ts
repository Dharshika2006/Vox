"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { Contact } from "@/types";
import { useToast } from "./useToast";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error, success } = useToast();

  const fetchContacts = useCallback(async (searchQuery?: string) => {
    setIsLoading(true);
    try {
      const data = await api.contacts.getAll(searchQuery);
      setContacts(data.items);
    } catch (err: any) {
      console.error("Failed to fetch contacts:", err);
      error(err.message || "Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (name: string, email: string) => {
    try {
      await api.contacts.create({
        name,
        emails: [{ email, is_primary: true }]
      });
      fetchContacts();
      success("Contact added successfully");
      return true;
    } catch (err: any) {
      error(err.message || "Failed to add contact");
      return false;
    }
  };

  const updateContact = async (id: number, name: string, email: string) => {
    try {
      await api.contacts.update(id, {
        name,
        emails: [{ email, is_primary: true }]
      });
      fetchContacts();
      success("Contact updated successfully");
      return true;
    } catch (err: any) {
      error(err.message || "Failed to update contact");
      return false;
    }
  };

  const deleteContact = async (id: number) => {
    try {
      await api.contacts.delete(id);
      fetchContacts();
      success("Contact deleted successfully");
      return true;
    } catch (err: any) {
      error(err.message || "Failed to delete contact");
      return false;
    }
  };

  return {
    contacts,
    isLoading,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
  };
}
