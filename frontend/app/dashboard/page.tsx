"use client";

import { useState } from "react";
import VoiceInterface from "@/components/dashboard/VoiceInterface";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { EmailDraft } from "@/types";

export default function DashboardPage() {
  const assistant = useVoiceAssistant();
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { success, error } = useToast();

  const handleSend = async (draft: EmailDraft) => {
    setIsSending(true);
    try {
      await api.emails.send(draft);
      success("Email sent successfully!");
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        assistant.reset();
      }, 3000);
    } catch (err: any) {
      error(err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <VoiceInterface 
        assistant={assistant} 
        onSend={handleSend} 
        isSending={isSending}
        isSuccess={isSuccess}
      />
    </>
  );
}
