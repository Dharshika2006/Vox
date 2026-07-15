export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("vox_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch (e) {
      body = null;
    }
    throw new ApiError(res.status, body, body?.detail || `API Error ${res.status}`);
  }
  
  return res.json();
}

import { User, ConversationResponse } from "@/types";

export const api = {
  auth: {
    login: () => request<{ url: string }>("/auth/login"),
    me: () => request<User>("/auth/me"),
  },
  voice: {
    transcribe: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      
      const token = typeof window !== "undefined" ? localStorage.getItem("vox_token") : null;
      const headers: HeadersInit = {};
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE}/voice/transcribe`, {
        method: "POST",
        headers,
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error("Failed to transcribe audio");
      }
      return res.json();
    },
  },
  conversation: {
    process: (data: { transcript: string; session_id?: string }) => 
      request<ConversationResponse>("/conversation", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    end: (sessionId: string) => 
      request<{ status: string }>(`/conversation/${sessionId}`, {
        method: "DELETE",
      }),
  },
  emails: {
    getHistory: (skip = 0, limit = 50) => 
      request<{ items: any[], total: number }>(`/emails?skip=${skip}&limit=${limit}`),
    send: (data: unknown) => 
      request<unknown>("/emails/send", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  contacts: {
    getAll: (search?: string) => 
      request<{ items: any[], total: number }>(`/contacts${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    create: (data: { name: string; nickname?: string; is_favorite?: boolean; emails: { email: string; is_primary: boolean }[] }) =>
      request<any>("/contacts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  }
};