"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VoiceInterface from "@/components/dashboard/VoiceInterface";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { EmailDraft } from "@/types";

import { Suspense } from "react";

function DashboardContent() {
  const assistant = useVoiceAssistant();
  const searchParams = useSearchParams();
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const draftId = searchParams.get("draftId");
    if (draftId) {
      api.emails.get(parseInt(draftId)).then((email) => {
        // Construct the draft object expected by loadDraft
        const draft = {
          draft_id: email.id,
          recipient: email.recipient,
          subject: email.subject,
          body: email.body,
          cc: email.cc,
          bcc: email.bcc
        };
        assistant.loadDraft(draft);
      }).catch((err) => {
        console.error("Failed to load draft", err);
      });
    }
  }, [searchParams, assistant.loadDraft]);

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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
