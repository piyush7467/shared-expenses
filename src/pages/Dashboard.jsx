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
    <div className="space-y-6">
      {/* Mobile App Banner */}
      <div className="group relative overflow-hidden bg-gradient-to-r from-zinc/10 via-zincLight/5 to-zincDark/10 backdrop-blur-md rounded-2xl border border-zinc/20 p-5">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc/5 to-zincLight/5"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc/20 to-zincLight/20 flex items-center justify-center border border-zinc/30">
              <Smartphone className="w-6 h-6 text-zinc" />
            </div>
            <div>
              <h3 className="font-bold text-themeText flex items-center gap-2">
                MoneyMap Mobile App
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Available Now
                </span>
              </h3>
              <p className="text-sm text-themeTextSecondary mt-0.5">
                Track expenses, split bills, and settle up on the go
              </p>
            </div>
          </div>
          <a 
            href={`${backendUrl}/public/moneymap.apk`}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-zinc to-zincLight hover:from-zincLight hover:to-zinc text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md shadow-zinc/20 text-sm group"
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc/20 to-zincLight/20 flex items-center justify-center border border-zinc/30">
              <User className="w-6 h-6 text-zinc" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-themeText">
                Welcome back, <span className="bg-gradient-to-r from-zinc to-zincLight bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-themeTextSecondary mt-1">Manage your shared expenses across all groups</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="open-join-modal"
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-themeSurface hover:bg-themeSurfaceVariant border border-themeBorder rounded-xl text-themeTextSecondary hover:text-themeText font-semibold transition-all duration-200 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-zinc" />
            Join Group
          </button>
          <button
            id="open-create-modal"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-zinc to-zincLight hover:from-zincLight hover:to-zinc text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md shadow-zinc/20 cursor-pointer"
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
            <p className="text-xs font-semibold uppercase tracking-wider text-themeTextSecondary">Total Groups</p>
            <p className="text-2xl font-bold text-themeText mt-1">{totalGroups}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-zinc" />
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-themeTextSecondary">Active Groups</p>
            <p className="text-2xl font-bold text-themeText mt-1">{activeGroups}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-zinc" />
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-themeTextSecondary">Total Members</p>
            <p className="text-2xl font-bold text-themeText mt-1">{totalMembers}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-zinc" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-themeText">Your Groups</h2>
          {!loading && groups.length > 0 && (
            <span className="text-sm text-themeTextSecondary">
              {groups.length} group{groups.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          /* Skeleton Loader Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel p-6 space-y-4 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-themeSurfaceVariant"></div>
                      <div className="h-5 bg-themeSurfaceVariant rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-themeSurfaceVariant rounded w-5/6"></div>
                      <div className="h-4 bg-themeSurfaceVariant rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-themeBorder/40 flex items-center justify-between">
                  <div className="h-4 bg-themeSurfaceVariant rounded w-1/4"></div>
                  <div className="h-4 bg-themeSurfaceVariant rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-panel text-center py-20 px-4">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc/30 to-zincLight/30 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-themeSurfaceVariant flex items-center justify-center border border-themeBorder">
                <Users className="w-12 h-12 text-themeTextSecondary" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-themeText mb-2">No Groups Yet</h3>
            <p className="text-themeTextSecondary max-w-md mx-auto">
              Get started by creating a new expense group or join an existing one using an invite code.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-themeSurface hover:bg-themeSurfaceVariant border border-themeBorder rounded-xl text-themeTextSecondary hover:text-themeText font-semibold transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-zinc" />
                Join Group
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-zinc to-zincLight hover:from-zincLight hover:to-zinc text-white font-semibold rounded-xl transition-all transform hover:scale-105 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                Create Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <div 
                key={group.id} 
                className="group relative overflow-hidden glass-panel hover:bg-themeSurfaceVariant/40 transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-zinc/0 via-zinc/0 to-zinc/0 group-hover:from-zinc/5 group-hover:to-zincLight/5 transition-all duration-500"></div>
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc/20 to-zincLight/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-zinc" />
                        </div>
                        <h3 className="font-bold text-themeText text-lg truncate">{group.name}</h3>
                      </div>
                      <p className="text-sm text-themeTextSecondary line-clamp-2 min-h-[40px]">
                        {group.description || 'No description provided.'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold shrink-0 ml-2 ${
                      group.isActiveMember 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-themeBorder/40 text-themeTextSecondary border border-themeBorder/60'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${group.isActiveMember ? 'bg-emerald-400 animate-pulse' : 'bg-themeTextSecondary'}`}></div>
                      {group.isActiveMember ? 'Active' : 'Left'}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-themeBorder/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-themeTextSecondary">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-semibold text-themeText">{group.memberCount || 0}</span>
                      <span>member{group.memberCount !== 1 ? 's' : ''}</span>
                    </div>
                    <Link
                      to={`/group/${group.id}`}
                      className="inline-flex items-center gap-1 text-zinc hover:text-zincLight font-semibold text-sm transition-all group-hover:gap-2"
                    >
                      <span>View Group</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 bg-themeSurface/95 border border-themeBorder relative shadow-2xl rounded-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc/20 to-zincLight/20 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-zinc" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-themeText to-themeTextSecondary bg-clip-text text-transparent">
                  Create Group
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-themeSurfaceVariant rounded-lg transition-colors cursor-pointer text-themeTextSecondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                  Group Name
                </label>
                <input
                  id="group-name-input"
                  type="text"
                  required
                  placeholder="e.g., Flatmates 402, Trip to Goa"
                  className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText placeholder-themeTextSecondary/60 focus:outline-none focus:border-zinc focus:ring-2 focus:ring-zinc/20 transition-all outline-none"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="group-desc-input"
                  rows="3"
                  placeholder="Brief summary of group expenses..."
                  className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText placeholder-themeTextSecondary/60 focus:outline-none focus:border-zinc focus:ring-2 focus:ring-zinc/20 transition-all resize-none outline-none"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-themeSurface border border-themeBorder rounded-xl text-themeTextSecondary hover:text-themeText hover:bg-themeSurfaceVariant transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="create-group-btn"
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-zinc to-zincLight hover:from-zincLight hover:to-zinc text-white font-semibold rounded-xl transition-all transform hover:scale-105 cursor-pointer shadow-md shadow-zinc/25"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 bg-themeSurface/95 border border-themeBorder relative shadow-2xl rounded-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc/20 to-zincLight/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-zinc" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-themeText to-themeTextSecondary bg-clip-text text-transparent">
                  Join Group
                </h2>
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-2 hover:bg-themeSurfaceVariant rounded-lg transition-colors cursor-pointer text-themeTextSecondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinGroup} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                  Invite Code
                </label>
                <input
                  id="invite-code-input"
                  type="text"
                  required
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText text-center text-lg uppercase tracking-widest font-mono placeholder:text-themeTextSecondary/40 focus:outline-none focus:border-zinc focus:ring-2 focus:ring-zinc/20 transition-all outline-none"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-themeTextSecondary mt-2 text-center">
                  Enter the 6-character invite code shared by the group admin
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2.5 bg-themeSurface border border-themeBorder rounded-xl text-themeTextSecondary hover:text-themeText hover:bg-themeSurfaceVariant transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="join-group-btn"
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-zinc to-zincLight hover:from-zincLight hover:to-zinc text-white font-semibold rounded-xl transition-all transform hover:scale-105 cursor-pointer shadow-md shadow-zinc/25"
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
      `}</style>
    </div>
  );
};

export default Dashboard;