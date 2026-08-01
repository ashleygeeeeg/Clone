import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, LogOut, MessageCircle, Rocket, Loader2 } from 'lucide-react';
import { BuildCard } from '../components/dashboard/BuildCard';
import { ConversationsSection } from '../components/dashboard/ConversationsSection';
import { NewBuildModal } from '../components/dashboard/NewBuildModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewBuild, setShowNewBuild] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [copiedBuildId, setCopiedBuildId] = useState(null);

  const fetchBuilds = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/builds`);
      setBuilds(res.data);
    } catch {
      setBuilds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/chat/sessions`);
      setSessions(res.data);
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    fetchBuilds();
    fetchSessions();
  }, [fetchBuilds, fetchSessions]);

  const createBuild = async (name, description) => {
    setCreating(true);
    try {
      await axios.post(`${API}/builds`, { name, description });
      setShowNewBuild(false);
      fetchBuilds();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create build');
    } finally {
      setCreating(false);
    }
  };

  const payForBuild = async (buildId) => {
    try {
      await axios.post(`${API}/builds/${buildId}/pay`, {});
      fetchBuilds();
    } catch (err) {
      alert(err.response?.data?.detail || 'Payment failed');
    }
  };

  const deployBuild = async (buildId) => {
    try {
      await axios.post(`${API}/builds/${buildId}/deploy`, {});
      fetchBuilds();
    } catch (err) {
      alert(err.response?.data?.detail || 'Deploy failed');
    }
  };

  const shareBuild = async (buildId) => {
    try {
      const res = await axios.post(`${API}/builds/${buildId}/share`, {});
      const link = `${window.location.origin}/share/${res.data.share_slug}`;
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        window.prompt('Copy your share link:', link);
      }
      setCopiedBuildId(buildId);
      setTimeout(() => setCopiedBuildId(null), 2500);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create share link');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="patient-dashboard">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-medium cursor-pointer" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }} onClick={() => navigate('/')}>maligeeAi</h1>
            <nav className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-900">Dashboard</button>
              <button onClick={() => navigate('/chat')} data-testid="nav-chat-btn" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors">
                <MessageCircle className="w-4 h-4" /> Partner in Crime
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline text-sm text-gray-500 truncate max-w-[200px]" data-testid="user-email-display">{user?.email}</span>
            <button onClick={handleLogout} data-testid="logout-btn" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'there'}!</h2>
          <p className="text-gray-500 mt-1">Manage your builds and deployments</p>
        </div>

        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Pricing: First build FREE, then $10/build</h3>
              <p className="text-gray-300 text-sm mt-1">All edits are free. AI Partner in Crime is always free.</p>
            </div>
            <button onClick={() => setShowNewBuild(true)} data-testid="new-build-btn" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors self-start sm:self-auto flex-shrink-0">
              <Plus className="w-4 h-4" /> New Build
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        )}
        {!loading && builds.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No builds yet</h3>
            <p className="text-gray-500 mb-6">Your first build is FREE! Create one to get started.</p>
            <button onClick={() => setShowNewBuild(true)} data-testid="create-first-build-btn" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" /> Create Your First Build
            </button>
          </div>
        )}
        {!loading && builds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builds.map(build => (
              <BuildCard
                key={build.id}
                build={build}
                copied={copiedBuildId === build.id}
                onPay={payForBuild}
                onDeploy={deployBuild}
                onShare={shareBuild}
              />
            ))}
          </div>
        )}

        <ConversationsSection
          sessions={sessions}
          onOpen={(sid) => navigate(`/chat?session=${sid}`)}
          onNew={() => navigate('/chat')}
        />
      </main>

      {showNewBuild && (
        <NewBuildModal
          isFirstBuild={builds.length === 0}
          creating={creating}
          onClose={() => setShowNewBuild(false)}
          onCreate={createBuild}
        />
      )}
    </div>
  );
};

export default DashboardPage;
