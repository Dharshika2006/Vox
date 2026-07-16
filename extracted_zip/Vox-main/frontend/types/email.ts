export type EmailStatus = "draft" | "sent" | "failed";

export interface EmailHistory {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  status: EmailStatus;
  gmail_message_id?: string;
  sent_at?: string;
  created_at: string;
}

export interface EmailDraft {
  recipient: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}
