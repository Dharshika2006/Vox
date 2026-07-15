"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { ConversationMessage, EmailDraft } from "@/types";
import { useToast } from "./useToast";

export function useConversation() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [state, setState] = useState<string>("IDLE");
  const { error } = useToast();

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    // Add user message to UI immediately
    setMessages((prev) => [...prev, { role: "user", content: transcript }]);
    setIsProcessing(true);

    try {
      const response = await api.conversation.process({
        transcript,
        session_id: sessionId || undefined,
      });

      setSessionId(response.session_id);
      setState(response.state);
      
      // Add assistant message
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: response.message }
      ]);
      
      if (response.draft) {
        setDraft(response.draft);
      }
      
    } catch (err: any) {
      console.error("Conversation error:", err);
      error(err.message || "Failed to process your request");
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, error]);

  const endConversation = useCallback(async () => {
    if (sessionId) {
      try {
        await api.conversation.end(sessionId);
      } catch (err) {
        console.error("Failed to end conversation on server:", err);
      }
    }
    
    setSessionId(null);
    setMessages([]);
    setDraft(null);
    setState("IDLE");
  }, [sessionId]);

  const updateDraft = useCallback((updatedDraft: EmailDraft) => {
    setDraft(updatedDraft);
  }, []);

  return {
    sessionId,
    messages,
    isProcessing,
    draft,
    state,
    processTranscript,
    endConversation,
    updateDraft,
  };
}
