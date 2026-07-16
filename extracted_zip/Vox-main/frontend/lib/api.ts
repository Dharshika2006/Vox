export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  
  const res = await fetch(`${API_BASE}${path}`, { 
    ...options, 
    headers,
    credentials: "include"
  });
  
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
    logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  },
  voice: {
    transcribe: async (audioBlob: Blob) => {
      const formData = new FormData();
      let ext = 'webm';
      if (audioBlob.type.includes('mp4')) ext = 'mp4';
      else if (audioBlob.type.includes('ogg')) ext = 'ogg';
      else if (audioBlob.type.includes('wav')) ext = 'wav';
      
      formData.append("file", audioBlob, `audio.${ext}`);
      
      const res = await fetch(`${API_BASE}/voice/transcribe`, {
        method: "POST",
        body: formData,
        credentials: "include",
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
    rewrite: (data: { draft_text: string; instruction: string }) =>
      request<{ rewritten_text: string }>("/emails/rewrite", {
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
    update: (id: number, data: any) =>
      request<any>(`/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<any>(`/contacts/${id}`, {
        method: "DELETE",
      }),
  },
  settings: {
    get: () => request<any>("/settings"),
    update: (data: any) =>
      request<any>("/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  }
};