"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className={cn(
              "relative z-50 w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-[var(--bg-primary)] p-2 shadow-2xl ring-1 ring-white/10 dark:ring-white/5",
              className
            )}
          >
            <div className="h-full w-full rounded-[calc(2.5rem-8px)] bg-[var(--bg-card)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between px-8 pt-8 pb-4">
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-primary)] text-[var(--text-muted)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]"
                >
                  <X weight="bold" className="h-4 w-4 transition-transform group-hover:rotate-90 group-hover:scale-110" />
                </button>
              </div>
              <div className="px-8 pb-8 pt-2">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
