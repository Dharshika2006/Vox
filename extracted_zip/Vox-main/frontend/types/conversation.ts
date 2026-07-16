export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationResponse {
  session_id: string;
  message: string;
  state: string;
  action_required: boolean;
  draft?: {
    recipient: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  };
  clarification_options?: any[];
  resolved_contact?: any;
}
