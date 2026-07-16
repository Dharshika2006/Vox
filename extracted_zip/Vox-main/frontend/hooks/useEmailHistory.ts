"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { EmailHistory } from "@/types";
import { useToast } from "./useToast";

export function useEmailHistory() {
  const [emails, setEmails] = useState<EmailHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { error } = useToast();

  const fetchHistory = useCallback(async (skip = 0, limit = 50, append = false) => {
    setIsLoading(true);
    try {
      const data = await api.emails.getHistory(skip, limit);
      if (append) {
        setEmails((prev) => [...prev, ...data.items]);
      } else {
        setEmails(data.items);
      }
      setHasMore(data.items.length === limit);
      setPage(Math.floor(skip / limit));
    } catch (err: any) {
      console.error("Failed to fetch email history:", err);
      error(err.message || "Failed to load email history");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchHistory((page + 1) * 50, 50, true);
    }
  }, [isLoading, hasMore, page, fetchHistory]);

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
    hasMore,
    fetchHistory,
    loadMore,
    sendDraft,
  };
}
