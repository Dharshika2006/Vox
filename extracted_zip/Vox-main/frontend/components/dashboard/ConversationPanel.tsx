"use client";

interface ConversationPanelProps {
  conversation: any;
  onEdit?: () => void;
  onSend?: () => void;
  isSending?: boolean;
}

export default function ConversationPanel({ conversation, onEdit, onSend, isSending }: ConversationPanelProps) {
  const { draft } = conversation;

  if (!draft) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 opacity-100 pointer-events-auto z-30">
      <p className="text-xs tracking-[0.2em] text-gray-400 mb-6 font-medium uppercase">Confirm Draft</p>
      
      <div className="bg-white rounded-3xl shadow-[0_10px_50px_-12px_rgba(0,0,0,0.1)] w-full max-w-xl p-10 border border-gray-100 pointer-events-auto relative">
        <div className="mb-8 group" onClick={onEdit}>
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-xs tracking-wider text-gray-400 uppercase font-medium">Recipient</label>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="text-2xl font-semibold text-black cursor-text group-hover:bg-gray-50 p-2 -ml-2 rounded transition-colors">
            {draft.recipient}
          </div>
        </div>
        
        <div className="mb-8 group" onClick={onEdit}>
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-xs tracking-wider text-gray-400 uppercase font-medium">Subject</label>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="text-2xl font-semibold text-black cursor-text group-hover:bg-gray-50 p-2 -ml-2 rounded transition-colors">
            {draft.subject}
          </div>
        </div>
        
        <div className="mb-10 group" onClick={onEdit}>
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-xs tracking-wider text-gray-400 uppercase font-medium">Message</label>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-lg text-gray-800 leading-relaxed cursor-text group-hover:bg-gray-50 p-2 -ml-2 rounded transition-colors whitespace-pre-wrap max-h-[30vh] overflow-y-auto">
            {draft.body}
          </p>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <button 
            disabled={isSending}
            className="text-sm tracking-widest text-gray-400 font-bold uppercase hover:text-black transition-colors px-4 py-2 disabled:opacity-50" 
            onClick={conversation.endConversation}
          >
            Cancel
          </button>
          <button 
            disabled={isSending || !draft.recipient || !draft.subject}
            onClick={onSend}
            className="bg-black text-white text-sm tracking-widest font-bold uppercase px-8 py-4 rounded-full hover:bg-gray-900 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{isSending ? "Sending..." : "Send via Gmail"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
