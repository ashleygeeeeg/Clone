import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const { processGoogleSession } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const sessionId = new URLSearchParams(window.location.hash.substring(1)).get('session_id');
    if (!sessionId) {
      navigate('/auth', { replace: true });
      return;
    }
    processGoogleSession(sessionId)
      .then((user) => {
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/dashboard', { replace: true, state: { user } });
      })
      .catch(() => navigate('/auth', { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white" data-testid="auth-callback-loading">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
