import React from 'react';
import { Plus, MessageCircle } from 'lucide-react';

export const ConversationsSection = ({ sessions, onOpen, onNew }) => (
  <div className="mt-12" data-testid="recent-conversations-section">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Recent Conversations</h3>
        <p className="text-sm text-gray-500">Pick up where you left off with Partner in Crime</p>
      </div>
      <button onClick={onNew} className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1.5 transition-colors" data-testid="new-conversation-btn">
        <Plus className="w-4 h-4" /> New Conversation
      </button>
    </div>
    {sessions.length === 0 && (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center" data-testid="no-conversations">
        <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No conversations yet. Say hi to Partner in Crime!</p>
      </div>
    )}
    {sessions.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sessions.slice(0, 6).map(s => (
          <button
            key={s.session_id}
            onClick={() => onOpen(s.session_id)}
            data-testid={`conversation-card-${s.session_id}`}
            className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate group-hover:text-gray-900">{s.last_message}</p>
                <p className="text-xs text-gray-400 mt-1">{s.message_count} messages • {new Date(s.last_time).toLocaleDateString()}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);
