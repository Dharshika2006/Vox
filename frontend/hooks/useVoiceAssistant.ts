"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { useVoiceRecording } from "./useVoiceRecording";
import { ConversationResponse } from "@/types";

export type AssistantState = 
  | "IDLE"
  | "LISTENING"
  | "PROCESSING"
  | "SPEAKING"
  | "PREVIEW"
  | "SUCCESS"
  | "ERROR";

export function useVoiceAssistant() {
  const {
    isRecording,
    isProcessing: isTranscribing,
    transcript,
    error: recordingError,
    audioData,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceRecording();

  const [state, setState] = useState<AssistantState>("IDLE");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationState, setConversationState] = useState<string>("IDLE");
  const [draft, setDraft] = useState<any>(null);
  const [resolvedContact, setResolvedContact] = useState<any>(null);
  const [clarificationOptions, setClarificationOptions] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");

  const isHandlingTranscript = useRef(false);

  // Play audio TTS
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }
    
    window.speechSynthesis.cancel(); // Clear any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Process transcript when it arrives
  useEffect(() => {
    if (transcript && !isHandlingTranscript.current) {
      isHandlingTranscript.current = true;
      handleTranscript(transcript);
    }
  }, [transcript]);

  // Sync isRecording with state
  useEffect(() => {
    if (isRecording) {
      setState("LISTENING");
    } else if (state === "LISTENING") {
      // If recording stopped but we're still in LISTENING, move to PROCESSING
      setState("PROCESSING");
    }
  }, [isRecording]);

  const handleTranscript = async (text: string) => {
    setState("PROCESSING");
    
    try {
      const response = await api.conversation.process({
        transcript: text,
        session_id: sessionId || undefined,
      });
      
      setSessionId(response.session_id);
      setConversationState(response.state);
      setMessage(response.message);
      
      if (response.draft) setDraft(response.draft);
      if (response.resolved_contact) setResolvedContact(response.resolved_contact);
      if (response.clarification_options) setClarificationOptions(response.clarification_options);
      
      // Update UI state based on Backend state
      if (response.state === "ERROR") {
        setState("ERROR");
      } else if (response.state === "SUCCESS") {
        setState("SUCCESS");
      } else if (response.state === "PREVIEW") {
        setState("PREVIEW");
      } else {
        // If we need clarification, we will speak and then listen again
        setState("SPEAKING");
      }
      
      // Speak the response if there is a message
      if (response.message) {
        setState("SPEAKING");
        speak(response.message, () => {
          if (response.action_required) {
            // Automatically start listening again for user confirmation/clarification
            clearTranscript();
            isHandlingTranscript.current = false;
            startRecording();
          } else {
            // Keep in current state (PREVIEW, SUCCESS, or ERROR)
            if (response.state === "PREVIEW") setState("PREVIEW");
            else if (response.state === "SUCCESS") setState("SUCCESS");
            else if (response.state === "ERROR") setState("ERROR");
            else setState("IDLE");
            isHandlingTranscript.current = false;
          }
        });
      } else {
        isHandlingTranscript.current = false;
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to process conversation.");
      setState("ERROR");
      isHandlingTranscript.current = false;
    }
  };

  const startInteraction = () => {
    clearTranscript();
    setSessionId(null);
    setDraft(null);
    setResolvedContact(null);
    setConversationState("IDLE");
    setMessage("");
    startRecording();
  };
  
  const reset = () => {
    if (sessionId) api.conversation.end(sessionId).catch(console.error);
    setSessionId(null);
    setDraft(null);
    setResolvedContact(null);
    setConversationState("IDLE");
    setMessage("");
    setState("IDLE");
    clearTranscript();
  };

  return {
    state,
    message,
    draft,
    resolvedContact,
    clarificationOptions,
    audioData,
    isTranscribing,
    recordingError,
    startInteraction,
    stopRecording,
    reset,
  };
}
