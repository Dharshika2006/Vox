"use client";

import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { EmailDraft } from "@/types";
import { useState } from "react";

interface VoiceInterfaceProps {
  assistant: ReturnType<typeof useVoiceAssistant>;
  onSend: (draft: EmailDraft) => Promise<void>;
  isSending: boolean;
}

export default function VoiceInterface({ assistant, onSend, isSending }: VoiceInterfaceProps) {
  const { state, startInteraction, reset, draft, stopRecording } = assistant;

  // Local state for inline editing
  const [editableDraft, setEditableDraft] = useState<EmailDraft | null>(null);

  // Initialize editable draft when we receive one
  if (draft && !editableDraft) {
    setEditableDraft(draft);
  }

  const isListening = state === "LISTENING" || state === "PROCESSING" || state === "SPEAKING";
  const showConfirm = (state === "PREVIEW" || draft) && editableDraft;

  const handleFieldChange = (field: keyof EmailDraft, value: string) => {
    if (editableDraft) {
      setEditableDraft({ ...editableDraft, [field]: value });
    }
  };

  return (
    <>
      <div 
        id="shader-container" 
        className={`transition-all duration-700 ease-in-out ${isListening ? 'listening-active' : ''}`}
      />

      <div id="interface-states" className="relative z-20 w-full flex justify-center items-center h-full">
        {/* STATE 1: Idle / Tap to Speak */}
        <div 
          id="state-idle" 
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${!isListening && !showConfirm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <p className="text-xs tracking-[0.2em] text-gray-500 mb-6 font-medium uppercase">Tap to start speaking</p>
          <button 
            className="w-20 h-20 bg-black rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200" 
            onClick={startInteraction}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </button>
        </div>

        {/* STATE 2: Listening / Processing */}
        <div 
          id="state-listening" 
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${isListening && !showConfirm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <p className="text-xs tracking-[0.2em] text-gray-700 mb-6 font-medium uppercase">
            {state === "PROCESSING" ? "Processing..." : "Listening..."}
          </p>
          <button 
            className="w-20 h-20 bg-black rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200" 
            onClick={() => {
              if (stopRecording) stopRecording();
            }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </button>
        </div>

        {/* STATE 3: Confirm Draft Card */}
        <div 
          id="state-confirm" 
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${showConfirm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <p className="text-xs tracking-[0.2em] text-gray-400 mb-6 font-medium uppercase">Confirm Draft</p>
          
          <div className="bg-white rounded-3xl shadow-[0_10px_50px_-12px_rgba(0,0,0,0.1)] w-full max-w-xl p-10 border border-gray-100 relative">
            
            <div className="mb-8 group">
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-xs tracking-wider text-gray-400 uppercase font-medium">Recipient</label>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <input 
                type="text"
                value={editableDraft?.recipient || ''}
                onChange={(e) => handleFieldChange("recipient", e.target.value)}
                className="w-full text-2xl font-semibold text-black cursor-text group-hover:bg-gray-50 p-2 -ml-2 rounded transition-colors focus:bg-gray-50 focus:outline-none"
              />
            </div>
            
            <div className="mb-8 group">
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-xs tracking-wider text-gray-400 uppercase font-medium">Subject</label>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <input 
                type="text"
                value={editableDraft?.subject || ''}
                onChange={(e) => handleFieldChange("subject", e.target.value)}
                className="w-full text-2xl font-semibold text-black cursor-text group-hover:bg-gray-50 p-2 -ml-2 rounded transition-colors focus:bg-gray-50 focus:outline-none"
              />
            </div>
            
            <div className="mb-10 group">
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-xs tracking-wider text-gray-400 uppercase font-medium">Message</label>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <textarea 
                value={editableDraft?.body || ''}
                onChange={(e) => handleFieldChange("body", e.target.value)}
                className="w-full text-lg text-gray-800 leading-relaxed cursor-text group-hover:bg-gray-50 p-2 -ml-2 rounded transition-colors focus:bg-gray-50 focus:outline-none resize-none min-h-[120px]"
              />
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <button 
                onClick={() => {
                  setEditableDraft(null);
                  reset();
                }}
                disabled={isSending}
                className="text-sm tracking-widest text-gray-400 font-bold uppercase hover:text-black transition-colors px-4 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => editableDraft && onSend(editableDraft)}
                disabled={isSending || !editableDraft?.recipient || !editableDraft?.subject}
                className="bg-black text-white text-sm tracking-widest font-bold uppercase px-8 py-4 rounded-full hover:bg-gray-900 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{isSending ? "Sending..." : "Send via Gmail"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
