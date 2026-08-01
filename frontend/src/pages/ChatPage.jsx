import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, Menu } from 'lucide-react';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { MessageList } from '../components/chat/MessageList';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const newMsgId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/chat/sessions`);
      setSessions(res.data);
    } catch {
      setSessions([]);
    }
  }, []);

  const loadSession = useCallback(async (sid) => {
    setSessionId(sid);
    try {
      const res = await axios.get(`${API}/chat/history/${sid}`);
      setMessages(res.data.map((m, i) => ({ id: `${sid}-${i}`, role: m.role, content: m.content })));
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchSessions();
    const sid = searchParams.get('session');
    if (sid) loadSession(sid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchSessions, loadSession]);

  const newChat = () => {
    setSessionId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: newMsgId(), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, { message: userMsg, session_id: sessionId });
      setMessages(prev => [...prev, { id: newMsgId(), role: 'assistant', content: res.data.response }]);
      if (!sessionId) {
        setSessionId(res.data.session_id);
        fetchSessions();
      }
    } catch {
      setMessages(prev => [...prev, { id: newMsgId(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" data-testid="chat-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} md:static md:flex md:z-auto h-full`}>
        <ChatSidebar
          sessions={sessions}
          activeSessionId={sessionId}
          onSelect={(sid) => { loadSession(sid); setSidebarOpen(false); }}
          onNew={() => { newChat(); setSidebarOpen(false); }}
          onBack={() => navigate('/dashboard')}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} data-testid="chat-sidebar-toggle" className="md:hidden text-gray-500 hover:text-gray-700 flex-shrink-0">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">Partner in Crime</h3>
              <p className="text-xs text-gray-500 truncate">Your unfiltered AI sidekick • Always free</p>
            </div>
          </div>
          {user && <span className="hidden sm:inline text-sm text-gray-400 truncate max-w-[200px]" data-testid="chat-user-email">{user.email}</span>}
        </div>

        <MessageList messages={messages} loading={loading} onSuggestion={setInput} />

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Partner in Crime anything..."
              data-testid="chat-input"
              className="flex-1 px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              data-testid="chat-send-btn"
              className="w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-2">Partner in Crime is free to use • Can&apos;t help build until you pay for a build</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
