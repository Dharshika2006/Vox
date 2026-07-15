"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { EmailHistory } from "@/types";
import { useToast } from "./useToast";

export function useEmailHistory() {
  const [emails, setEmails] = useState<EmailHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useToast();

  const fetchHistory = useCallback(async (skip = 0, limit = 50) => {
    setIsLoading(true);
    try {
      const data = await api.emails.getHistory(skip, limit);
      setEmails(data.items);
    } catch (err: any) {
      console.error("Failed to fetch email history:", err);
      error(err.message || "Failed to load email history");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sendDraft = useCallback(async (draftData: any) => {
    try {
      await api.emails.send(draftData);
      // Refresh history after sending
      fetchHistory();
      return true;
    } catch (err: any) {
      console.error("Failed to send email:", err);
      error(err.message || "Failed to send email");
      return false;
    }
  }, [fetchHistory, error]);

  return {
    emails,
    isLoading,
    fetchHistory,
    sendDraft,
  };
}
