"use client";

import { useState } from "react";
import VoiceInterface from "@/components/dashboard/VoiceInterface";
import ConversationPanel from "@/components/dashboard/ConversationPanel";
import EmailComposer from "@/components/dashboard/EmailComposer";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { EmailDraft } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
  const assistant = useVoiceAssistant();
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { success, error } = useToast();

  const handleSend = async (draft: EmailDraft) => {
    setIsSending(true);
    try {
      await api.emails.send(draft);
      success("Email sent successfully!");
      setIsEditing(false);
      assistant.reset();
    } catch (err: any) {
      error(err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  // Convert assistant state to what ConversationPanel expects (or close enough)
  const conversationProp = {
    messages: assistant.message ? [{ role: "assistant", content: assistant.message }] : [],
    isProcessing: assistant.state === "PROCESSING",
    draft: assistant.draft,
    state: assistant.state,
    endConversation: assistant.reset,
  };

  return (
    <>
      {/* Mobile TopAppBar */}
      <header className="flex md:hidden justify-between items-center w-full bg-transparent py-4 shrink-0">
        <h1 className="font-display-lg-mobile text-headline-sm text-primary tracking-tight">Vox</h1>
        <button className="text-primary hover:opacity-80 transition-opacity scale-95 duration-200 ease-out">
          <span className="material-symbols-outlined text-[28px]">account_circle</span>
        </button>
      </header>

      {/* Center: Intelligent Assistant Interface */}
      <section className="flex-1 flex flex-col h-[600px] md:h-full rounded-2xl glass-panel relative overflow-hidden shadow-2xl shadow-charcoal/5">
        <VoiceInterface assistant={assistant} />
      </section>
      
      {/* Right Panel: Email Preview */}
      <aside className="w-full md:w-[400px] xl:w-[450px] h-[600px] md:h-full flex flex-col shrink-0 space-y-6 relative">
        <AnimatePresence mode="wait">
          {assistant.state === "SUCCESS" ? (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="flex h-full flex-col space-y-6 items-center justify-center bg-success-container/20 rounded-2xl border border-success/30 p-10 text-center glass-panel"
             >
               <span className="material-symbols-outlined text-[80px] text-success animate-bounce">check_circle</span>
               <h2 className="text-2xl font-headline-md text-on-surface mt-4">Email Sent!</h2>
               <p className="text-on-surface-variant font-body-md mt-2">Your email was sent successfully.</p>
               <button onClick={assistant.reset} className="mt-8 px-6 py-3 bg-primary text-on-primary rounded-full hover:scale-105 transition-transform">Start New</button>
             </motion.div>
          ) : isEditing && assistant.draft ? (
            <motion.div key="composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <EmailComposer 
                draft={assistant.draft} 
                onSend={handleSend} 
                onCancel={() => setIsEditing(false)} 
                isSending={isSending} 
              />
            </motion.div>
          ) : (
            <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <ConversationPanel 
                conversation={conversationProp} 
                onEdit={() => setIsEditing(true)} 
                onSend={() => assistant.draft && handleSend(assistant.draft)}
                isSending={isSending || assistant.state === "SENDING"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </>
  );
}
