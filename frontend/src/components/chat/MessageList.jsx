import React, { useEffect, useRef } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const SUGGESTIONS = ['What can you do?', 'Explain quantum computing', 'Help me brainstorm an app idea', "What's trending in AI?"];

const EmptyState = ({ onSuggestion }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-6">
      <Sparkles className="w-10 h-10 text-violet-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">Hey, I&apos;m Partner in Crime</h3>
    <p className="text-gray-500 max-w-md mb-6">Your unfiltered AI sidekick. Ask me anything — I can browse the web, brainstorm ideas, explain concepts, and more. Just can&apos;t help you build until you&apos;ve got a paid build.</p>
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTIONS.map(q => (
        <button key={q} onClick={() => onSuggestion(q)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
          {q}
        </button>
      ))}
    </div>
  </div>
);

export const MessageList = ({ messages, loading, onSuggestion }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4" data-testid="chat-message-list">
      {messages.length === 0 && <EmptyState onSuggestion={onSuggestion} />}
      {messages.map((msg) => (
        <div key={msg.id} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            msg.role === 'user'
              ? 'bg-gray-900 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
