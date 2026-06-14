import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, Plus, LogIn, Download, Smartphone, 
  ChevronRight, User, Calendar, Wallet, 
  Gift, TrendingUp, Sparkles, X, 
  FolderPlus, UserPlus, Home, ArrowRight,
  Layers, Shield, Star, Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Group Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Join Group Form
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/groups/my-groups');
      setGroups(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch groups list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      showToast('Please enter a group name', 'warning');
      return;
    }
    try {
      await api.post('/groups/create', {
        name: groupName,
        description: groupDesc
      });
      setGroupName('');
      setGroupDesc('');
      setShowCreateModal(false);
      showToast('Group created successfully!', 'success');
      fetchGroups();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create group', 'error');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      showToast('Please enter an invite code', 'warning');
      return;
    }
    try {
      await api.post('/groups/join', { inviteCode });
      setInviteCode('');
      setShowJoinModal(false);
      showToast('Successfully joined group!', 'success');
      fetchGroups();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join group', 'error');
    }
  };

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

  // Calculate statistics
  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.isActiveMember).length;
  const totalMembers = groups.reduce((sum, group) => sum + (group.memberCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Mobile App Banner */}
        <div className="group relative overflow-hidden bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-5">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <Smartphone className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  MoneyMap Mobile App
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Available Now
                  </span>
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Track expenses, split bills, and settle up on the go
                </p>
              </div>
            </div>
            <a 
              href={`${backendUrl}/public/moneymap.apk`}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 text-sm group"
            >
              <Download className="w-4 h-4" />
              Download APK
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-gray-400 mt-1">Manage your shared expenses across all groups</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="open-join-modal"
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white font-semibold transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              Join Group
            </button>
            <button
              id="open-create-modal"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            >
              <FolderPlus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Groups</p>
              <p className="text-2xl font-bold text-white mt-1">{totalGroups}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Groups</p>
              <p className="text-2xl font-bold text-white mt-1">{activeGroups}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-white mt-1">{totalMembers}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-800 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-cyan-500 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {groups.length === 0 ? (
              <div className="glass-panel text-center py-20 px-4">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
                    <Users className="w-12 h-12 text-gray-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Groups Yet</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Get started by creating a new expense group or join an existing one using an invite code.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white font-semibold transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join Group
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create Group
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Your Groups</h2>
                  <span className="text-sm text-gray-400">{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group, index) => (
                    <div 
                      key={group.id} 
                      className="group relative overflow-hidden glass-panel hover:bg-gray-800/40 transition-all duration-300 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Gradient border on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:via-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>
                      
                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-cyan-400" />
                              </div>
                              <h3 className="font-bold text-white text-lg truncate">{group.name}</h3>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                              {group.description || 'No description provided.'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold shrink-0 ml-2 ${
                            group.isActiveMember 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-gray-500/10 text-gray-500 border border-gray-600/30'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${group.isActiveMember ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></div>
                            {group.isActiveMember ? 'Active' : 'Left'}
                          </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-semibold text-gray-300">{group.memberCount || 0}</span>
                            <span>member{group.memberCount !== 1 ? 's' : ''}</span>
                          </div>
                          <Link
                            to={`/group/${group.id}`}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all group-hover:gap-2"
                          >
                            <span>View Group</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 bg-gray-900/95 relative shadow-2xl rounded-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Create Group
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Group Name
                </label>
                <input
                  id="group-name-input"
                  type="text"
                  required
                  placeholder="e.g., Flatmates 402, Trip to Goa"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="group-desc-input"
                  rows="3"
                  placeholder="Brief summary of group expenses..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  id="create-group-btn"
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN GROUP MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 bg-gray-900/95 relative shadow-2xl rounded-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Join Group
                </h2>
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleJoinGroup} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Invite Code
                </label>
                <input
                  id="invite-code-input"
                  type="text"
                  required
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-center text-lg uppercase tracking-widest font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-character invite code shared by the group admin
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  id="join-group-btn"
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .glass-panel {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 1rem;
          transition: all 0.3s ease;
        }
        .glass-panel:hover {
          border-color: rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;