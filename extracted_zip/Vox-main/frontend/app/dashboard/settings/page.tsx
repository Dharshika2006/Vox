"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  
  const [language, setLanguage] = useState("en-US");
  const [autoSend, setAutoSend] = useState(false);
  const [signature, setSignature] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.settings.get();
        if (res) {
          setLanguage(res.voice_language || "en-US");
          setAutoSend(res.auto_send || false);
          setSignature(res.email_signature || "");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.settings.update({
        voice_language: language,
        auto_send: autoSend,
        email_signature: signature
      });
      success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex h-full flex-col p-6 sm:p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <header>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage your account and application preferences.
          </p>
        </header>

        <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-primary)]/50">
            <h2 className="font-semibold text-[var(--text-primary)]">Account Profile</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] text-2xl font-bold overflow-hidden border border-[var(--border)]">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg text-[var(--text-primary)]">{user?.name}</h3>
                <p className="text-[var(--text-secondary)] font-[family-name:var(--font-mono)] text-sm mt-1">{user?.email}</p>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Google Auth
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-primary)]/50">
            <h2 className="font-semibold text-[var(--text-primary)]">Preferences</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-sm text-[var(--text-secondary)]">Loading preferences...</div>
          ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Voice Language</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Select the primary language you speak in.</p>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-sm rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] block p-2.5 outline-none"
              >
                <option value="en-US">English (US)</option>
                <option value="en-UK">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
              </select>
            </div>
            
            <hr className="border-[var(--border-light)]" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Auto-send confident drafts</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">If Vox is 100% sure about your intent, send without asking.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoSend}
                  onChange={(e) => setAutoSend(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>
            
            <hr className="border-[var(--border-light)]" />
            
            <div className="space-y-3">
              <h3 className="font-medium text-[var(--text-primary)]">Email Signature</h3>
              <p className="text-sm text-[var(--text-secondary)]">Automatically append this to all generated emails.</p>
              <textarea 
                rows={3} 
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-sm rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] block p-2.5 outline-none font-sans resize-none"
                placeholder="Best regards,&#10;Your Name"
              ></textarea>
              <div className="flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--text-primary)] hover:bg-[var(--accent)] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
          )}
        </section>
      </div>
    </div>
  );
}
