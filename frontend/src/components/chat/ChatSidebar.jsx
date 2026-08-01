import React from 'react';
import { ArrowLeft, Plus, MessageCircle, Sparkles } from 'lucide-react';

export const ChatSidebar = ({ sessions, activeSessionId, onSelect, onNew, onBack }) => (
  <div className="w-72 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
    <div className="p-4 border-b border-gray-200">
      <button onClick={onBack} data-testid="chat-back-to-dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </button>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-violet-500" />
        <h2 className="text-lg font-bold text-gray-900">Partner in Crime</h2>
      </div>
      <button onClick={onNew} data-testid="new-chat-btn" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
        <Plus className="w-4 h-4" /> New Chat
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-2">
      {sessions.map(s => (
        <button
          key={s.session_id}
          data-testid={`chat-session-${s.session_id}`}
          onClick={() => onSelect(s.session_id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
            activeSessionId === s.session_id ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{s.last_message}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);
