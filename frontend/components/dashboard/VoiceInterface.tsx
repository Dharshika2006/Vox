"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export default function VoiceInterface({ assistant }: { assistant: any }) {
  const {
    state,
    message,
    clarificationOptions,
    isTranscribing,
    recordingError,
    startInteraction,
    stopRecording,
  } = assistant;

  const isRecording = state === "LISTENING";
  const isProcessing = state === "PROCESSING" || isTranscribing;
  const isSpeaking = state === "SPEAKING";
  
  const isError = state === "ERROR" || recordingError;
  const errorMessage = recordingError || message;

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startInteraction();
    }
  };

  return (
    <div className="flex h-full w-full flex-col relative">
      {/* Top Status Area */}
      <div className="p-6 flex justify-between items-start z-10 absolute top-0 w-full">
        <AnimatePresence>
          {isRecording ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-primary-container"
            >
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">Listening...</span>
            </motion.div>
          ) : isProcessing ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-primary"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">Thinking...</span>
            </motion.div>
          ) : isSpeaking ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-secondary"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">Speaking...</span>
            </motion.div>
          ) : (
            <div></div> // Placeholder
          )}
        </AnimatePresence>
        
        <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Transcription Canvas (Displays AI Messages / Clarifications) */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto flex flex-col justify-end space-y-6 z-10 mt-16" id="transcription-canvas">
        <div className="flex items-start space-x-4 max-w-2xl">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px] text-on-secondary-container">auto_awesome</span>
          </div>
          <div className="font-body-lg text-body-lg text-on-surface-variant pt-1 leading-relaxed">
            {message || "I'm ready. What would you like to say?"}
          </div>
        </div>
        
        {clarificationOptions && clarificationOptions.length > 0 && (
            <div className="pl-12 flex flex-col space-y-2 max-w-2xl">
                {clarificationOptions.map((opt: any, i: number) => (
                    <div key={opt.id} className="p-3 bg-surface-container rounded-lg border border-outline-variant/30 text-on-surface">
                        <span className="font-medium text-primary mr-2">{i + 1}.</span> {opt.name} ({opt.email})
                    </div>
                ))}
            </div>
        )}

        {isRecording && (
          <div className="flex items-start justify-end space-x-4 w-full">
            <div className="font-display-lg text-headline-md md:text-display-lg-mobile text-on-surface text-right max-w-3xl leading-tight">
              <span className="opacity-40 typewriter-fade-in">Listening...</span>
            </div>
          </div>
        )}
      </div>

      {/* Central Microphone / Visualization Area */}
      <div className="h-48 md:h-64 w-full relative flex items-center justify-center mt-auto shrink-0 border-t border-outline-variant/10">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent z-0"></div>
        
        {/* Waveform Visualization */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
          {isRecording ? (
            <div className="flex items-end justify-center gap-2 h-24 w-full z-0 opacity-60">
              <div className="w-2 h-full bg-primary/40 rounded-full waveform-bar delay-1"></div>
              <div className="w-2 h-full bg-primary/60 rounded-full waveform-bar delay-2"></div>
              <div className="w-2 h-full bg-primary rounded-full waveform-bar delay-3"></div>
              <div className="w-2 h-full bg-primary/60 rounded-full waveform-bar delay-4"></div>
              <div className="w-2 h-full bg-primary/40 rounded-full waveform-bar delay-5"></div>
            </div>
          ) : (
            <div className="w-3/4 h-32 rounded-full bg-gradient-to-r from-transparent via-primary-container/20 to-transparent blur-xl"></div>
          )}
        </div>

        <button 
          onClick={toggleRecording}
          disabled={isProcessing || isSpeaking}
          className={cn(
            "relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isRecording 
              ? "bg-error text-on-error mic-active-glow hover:scale-105 active:scale-95" 
              : (isProcessing || isSpeaking)
              ? "bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-50" 
              : "bg-primary text-on-primary hover:scale-105 active:scale-95 shadow-primary/20"
          )}
        >
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isRecording ? 'stop' : 'mic'}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isError && errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-error-container bg-error-container/20 p-4 text-sm text-error backdrop-blur-md"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
