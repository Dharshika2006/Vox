"use client";

import { motion } from "framer-motion";

export default function LearnPage() {
  const steps = [
    {
      id: "step1",
      title: "Start Listening",
      desc: "Tap the central microphone on the Assistant page. Vox instantly enters active listening mode, waiting for your instruction.",
      icon: "mic",
      colSpan: "col-span-1",
      delay: 0.1
    },
    {
      id: "step2",
      title: "Speak a Command",
      desc: "Use natural language. e.g. 'Email Sarah about the project update and tell her the visual DNA extraction is complete.'",
      icon: "record_voice_over",
      colSpan: "col-span-1",
      delay: 0.2
    },
    {
      id: "step3",
      title: "Intent Recognition",
      desc: "Our AI processes the audio, extracts context from your contacts, determines the recipient, and structures the email perfectly.",
      icon: "psychology",
      colSpan: "col-span-1 md:col-span-2",
      delay: 0.3
    },
    {
      id: "step4",
      title: "Generation & Review",
      desc: "A draft overlay appears with the To, Subject, and Message pre-filled. You can edit it manually or just tap Send.",
      icon: "draw",
      colSpan: "col-span-1 md:col-span-2",
      delay: 0.4
    }
  ];

  return (
    <div className="flex h-full flex-col relative z-10 items-center w-full max-w-5xl mx-auto">
      
      {/* Background ambient blob for visual interest */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] animate-[pulse-organic_10s_ease-in-out_infinite_alternate] pointer-events-none z-[-1]" />

      <div className="mb-16 text-center">
        <h1 className="font-display text-display text-on-surface mb-6 tracking-tight">Understanding the Workflow</h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto opacity-80 leading-relaxed">
          Vox transforms your stream-of-consciousness thoughts into structured, professional emails in seconds. Here's how it works.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {steps.map((step) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: step.delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-tertiary-container rounded-[1.5rem] p-8 md:p-10 hover:scale-[1.02] transition-transform duration-300 ${step.colSpan} flex flex-col gap-6 relative overflow-hidden group`}
          >
            <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[28px] text-tertiary" style={{ fontVariationSettings: "'FILL' 0" }}>
                {step.icon}
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-headline-lg-mobile text-on-surface mb-3">{step.title}</h3>
              <p className="font-body-lg text-on-surface-variant opacity-80 leading-relaxed max-w-md">
                {step.desc}
              </p>
            </div>

            {/* Decorative background number */}
            <div className="absolute -right-4 -bottom-8 font-display text-[120px] text-on-surface/5 font-bold pointer-events-none transition-transform group-hover:scale-110 group-hover:-translate-y-2">
              {step.id.replace('step', '')}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
