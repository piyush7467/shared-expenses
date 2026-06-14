import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, Users, Wallet, TrendingUp, TrendingDown, 
  Plus, Download, LogOut, Trash2, Copy, Check, 
  Calendar, DollarSign, User, FileText, Upload, 
  AlertCircle, CheckCircle, XCircle, Clock, 
  MessageSquare, PieChart, Settings, UserPlus,
  CreditCard, Receipt, Scale, Send, ArrowRight,
  ChevronRight, Filter, Search, MoreVertical, Eye,
  Edit, X, Percent, Equal, Tag, BookOpen, Database,
  Shield
} from 'lucide-react';

const GroupDetails = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [group, setGroup] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);
  const isFirstSyncRef = useRef(true);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddSettlement, setShowAddSettlement] = useState(false);

  // New Expense Form State
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCurrency, setExpCurrency] = useState('INR');
  const [expRate, setExpRate] = useState('1.0');
  const [expSplitType, setExpSplitType] = useState('EQUAL');
  const [expPayer, setExpPayer] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().substring(0, 10));
  const [expParticipants, setExpParticipants] = useState({});

  // New Settlement Form State
  const [setFrom, setSetFrom] = useState('');
  const [setTo, setSetTo] = useState('');
  const [setAmount, setSetAmount] = useState('');
  const [setDate, setSetDate] = useState(new Date().toISOString().substring(0, 10));

  // CSV file import state
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [lastImportResult, setLastImportResult] = useState(null);

  const loadGroupData = async () => {
    try {
      // Parallelize fetches to prevent sequential network bottlenecks
      const [memRes, myGroupsRes, expRes, balRes, sugRes, setRes, repRes] = await Promise.all([
        api.get(`/groups/${groupId}/members`),
        api.get('/groups/my-groups'),
        api.get(`/expenses/group/${groupId}`),
        api.get(`/balances/group/${groupId}`),
        api.get(`/settlement-suggestions/group/${groupId}`),
        api.get(`/settlements/group/${groupId}`),
        api.get(`/import/reports/group/${groupId}`)
      ]);

      setMemberships(memRes.data);
      
      const g = myGroupsRes.data.find(item => item.id === groupId);
      if (g) {
        setGroup(g);
      } else {
        showToast('Group details could not be retrieved.', 'error');
      }

      setExpenses(expRes.data);
      setBalances(balRes.data);
      setSuggestions(sugRes.data);
      setSettlements(setRes.data);
      setReports(repRes.data);

    } catch (err) {
      console.error(err);
      showToast('Error loading group details.', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadingRef.current = true;
    setLoading(true);
    loadGroupData();
  }, [groupId]);

  const expensesRef = useRef(expenses);
  const settlementsRef = useRef(settlements);

  useEffect(() => {
    expensesRef.current = expenses;
  }, [expenses]);

  useEffect(() => {
    settlementsRef.current = settlements;
  }, [settlements]);

  // Real-time Background Sync Polling
  useEffect(() => {
    if (!groupId) return;

    // Reset sync flag on group ID change to prevent toast alert storm
    isFirstSyncRef.current = true;

    const pollInterval = setInterval(async () => {
      // Skip background sync checks while the page is running its initial load
      if (loadingRef.current) return;

      try {
        const expRes = await api.get(`/expenses/group/${groupId}`);
        const setRes = await api.get(`/settlements/group/${groupId}`);

        const currentExpenses = expensesRef.current;
        const currentSettlements = settlementsRef.current;

        const newExpenses = expRes.data;
        const newSettlements = setRes.data;

        // Skip toast comparisons on the very first sync tick
        if (isFirstSyncRef.current) {
          isFirstSyncRef.current = false;
          return;
        }

        let hasChanges = false;

        newExpenses.forEach(newExp => {
          const exists = currentExpenses.some(e => e.id === newExp.id);
          if (!exists) {
            hasChanges = true;
            if (newExp.payerId !== user?.id) {
              showToast(`${newExp.payer?.name || 'Someone'} added expense: "${newExp.description}"`, 'info');
            }
          }
        });

        if (newExpenses.length !== currentExpenses.length) {
          const wasDeleted = currentExpenses.some(oldExp => !newExpenses.some(ne => ne.id === oldExp.id));
          if (wasDeleted) {
            hasChanges = true;
            showToast('Expenses ledger updated.', 'info');
          }
        }

        newSettlements.forEach(newSet => {
          const exists = currentSettlements.some(s => s.id === newSet.id);
          if (!exists) {
            hasChanges = true;
            if (newSet.payerId !== user?.id) {
              showToast(`${newSet.payer?.name || 'Someone'} recorded a payment to ${newSet.payee?.name || 'Someone'} of ₹${Number(newSet.amount)}`, 'info');
            }
          }
        });

        if (newSettlements.length !== currentSettlements.length) {
          hasChanges = true;
        }

        if (hasChanges) {
          loadGroupData();
        }
      } catch (err) {
        console.error('Background sync poll error:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [groupId, user]);

  useEffect(() => {
    if (memberships.length > 0 && !expPayer) {
      const isMember = memberships.find(m => m.userId === user?.id && m.leftAt === null);
      setExpPayer(isMember ? user.id : memberships[0]?.userId);

      const initialParts = {};
      memberships.forEach(m => {
        if (m.leftAt === null) {
          initialParts[m.userId] = expSplitType === 'EQUAL' ? true : '';
        }
      });
      setExpParticipants(initialParts);
    }
  }, [memberships]);

  useEffect(() => {
    const initialParts = {};
    memberships.forEach(m => {
      if (m.leftAt === null) {
        initialParts[m.userId] = expSplitType === 'EQUAL' ? true : '';
      }
    });
    setExpParticipants(initialParts);
  }, [expSplitType]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();

    const splitArr = [];
    const pKeys = Object.keys(expParticipants);

    if (expSplitType === 'EQUAL') {
      const selectedIds = pKeys.filter(k => expParticipants[k] === true);
      if (selectedIds.length === 0) {
        showToast('Please select at least one split participant.', 'warning');
        return;
      }
      selectedIds.forEach(id => {
        splitArr.push({ userId: id });
      });
    } else if (expSplitType === 'PERCENTAGE') {
      let sumPct = 0;
      for (const id of pKeys) {
        const pct = Number(expParticipants[id] || 0);
        if (pct > 0) {
          sumPct += pct;
          splitArr.push({ userId: id, percentage: pct });
        }
      }
      if (Math.abs(sumPct - 100) > 0.05) {
        showToast(`Sum of percentages must equal 100%. Current sum: ${sumPct}%`, 'warning');
        return;
      }
    } else if (expSplitType === 'EXACT') {
      let sumAmt = 0;
      for (const id of pKeys) {
        const amt = Number(expParticipants[id] || 0);
        if (amt > 0) {
          sumAmt += amt;
          splitArr.push({ userId: id, amount: amt });
        }
      }
      if (Math.abs(sumAmt - Number(expAmount)) > 0.05) {
        showToast(`Sum of exact split amounts must equal total expense amount (${expAmount}). Current sum: ${sumAmt}`, 'warning');
        return;
      }
    }

    try {
      await api.post('/expenses/create', {
        groupId,
        description: expDesc,
        originalAmount: expAmount,
        currency: expCurrency,
        exchangeRate: expCurrency === 'INR' ? 1.0 : Number(expRate),
        splitType: expSplitType,
        date: expDate,
        payerId: expPayer,
        splits: splitArr
      });

      showToast('Expense added successfully!', 'success');
      setExpDesc('');
      setExpAmount('');
      setShowAddExpense(false);
      loadGroupData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add expense', 'error');
    }
  };

  const handleRecordSettlement = async (e) => {
    e.preventDefault();

    if (setFrom === setTo) {
      showToast('Sender and recipient cannot be the same person.', 'warning');
      return;
    }

    try {
      await api.post('/settlements/create', {
        groupId,
        payerId: setFrom,
        payeeId: setTo,
        amount: setAmount,
        date: setDate
      });

      showToast('Settlement recorded successfully!', 'success');
      setSetAmount('');
      setShowAddSettlement(false);
      loadGroupData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record settlement', 'error');
    }
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      await api.put(`/expenses/${expenseId}`, { status: 'APPROVED' });
      showToast('Expense approved successfully!', 'success');
      loadGroupData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve expense', 'error');
    }
  };

  const handleRejectExpense = async (expenseId) => {
    try {
      await api.put(`/expenses/${expenseId}`, { status: 'REJECTED' });
      showToast('Expense rejected/ignored.', 'info');
      loadGroupData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject expense', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      showToast('Expense deleted.', 'success');
      loadGroupData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete expense', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group? You will retain your historical split records.')) return;
    try {
      await api.put(`/groups/leave/${groupId}`);
      showToast('Successfully left the group.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to leave group', 'error');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete this group? This will permanently erase all expenses, split sheets, settlements, and reports for all members. This action cannot be undone.')) return;
    try {
      await api.delete(`/groups/${groupId}`);
      showToast('Group deleted successfully.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete group', 'error');
    }
  };

  const handleDownloadReport = async () => {
    try {
      showToast('Generating report...', 'info');
      const response = await api.get(`/groups/${groupId}/report`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${group?.name.replace(/\s+/g, '_')}_summary_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Group report downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to download group report.', 'error');
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      showToast('Please select a CSV file to import.', 'warning');
      return;
    }

    setCsvUploading(true);
    setLastImportResult(null);

    const formData = new FormData();
    formData.append('groupId', groupId);
    formData.append('file', csvFile);

    try {
      const response = await api.post('/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showToast('CSV processing complete.', 'success');
      setLastImportResult(response.data);
      setCsvFile(null);
      
      const fileInput = document.getElementById('csv-file-selector');
      if (fileInput) fileInput.value = '';

      loadGroupData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to import CSV', 'error');
    } finally {
      setCsvUploading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group?.inviteCode);
    setCopied(true);
    showToast('Invite code copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-themeBg transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-themeBorder rounded-full opacity-60"></div>
            <div className="absolute inset-0 border-4 border-accentCyan border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-themeTextSecondary animate-pulse">Loading group details...</p>
        </div>
      </div>
    );
  }

  const activeMemberships = memberships.filter(m => m.leftAt === null);
  const tabs = [
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'balances', label: 'Balances', icon: Scale },
    { id: 'suggestions', label: 'Settlements', icon: Send },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'csv-import', label: 'CSV Import', icon: Upload },
    { id: 'import-reports', label: 'Reports', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-themeBg transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden border border-gray-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                {group?.name}
              </h1>
              
              <p className="text-gray-400">{group?.description || 'No description provided.'}</p>
              
              <div className="flex items-center gap-2 mt-3">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-500">
                  Admin: <span className="text-cyan-400 font-semibold">{group?.admin?.name || 'Unknown'}</span>
                </span>
              </div>
            </div>

            {group?.isActiveMember && (
              <div className="flex flex-wrap gap-3">
                <div className="bg-gray-800/50 backdrop-blur rounded-xl px-4 py-3 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Invite Code</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-cyan-400 text-lg tracking-wider">
                          {group?.inviteCode}
                        </code>
                        <button
                          onClick={copyInviteCode}
                          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy Invite Code"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  Report
                </button>

                <button
                  onClick={handleLeaveGroup}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Leave
                </button>

                {group?.adminId === user?.id && (
                  <button
                    onClick={handleDeleteGroup}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 rounded-xl text-rose-400 hover:text-rose-300 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-800 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all relative ${
                    activeTab === tab.id
                      ? 'text-cyan-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Expenses Ledger</h2>
              {group?.isActiveMember && (
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
              )}
            </div>

            {expenses.length === 0 ? (
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl text-center py-16 border border-gray-700/50">
                <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No expenses recorded yet</p>
                {group?.isActiveMember && (
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="mt-4 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Add your first expense →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((exp) => {
                  const isPending = exp.status === 'PENDING';
                  const StatusIcon = isPending ? Clock : exp.status === 'APPROVED' ? CheckCircle : XCircle;
                  const statusColor = isPending ? 'text-amber-400' : exp.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400';
                  
                  return (
                    <div key={exp.id} className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-5 hover:bg-gray-800/40 transition-all duration-300 border border-gray-700/50">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h3 className="text-lg font-bold text-white">{exp.description}</h3>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${isPending ? 'bg-amber-950/30 text-amber-400 border-amber-900/30' : exp.status === 'APPROVED' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30' : 'bg-rose-950/30 text-rose-400 border-rose-900/30'}`}>
                              <StatusIcon className="w-3 h-3" />
                              {exp.status}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(exp.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Paid by <span className="text-white font-semibold">{exp.payer?.name}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {exp.splits.map((split) => (
                              <span
                                key={split.id}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-gray-800/50 text-gray-300"
                              >
                                <User className="w-3 h-3" />
                                {split.user?.name}: ₹{split.amountOwed}
                                {split.percentage && ` (${Number(split.percentage)}%)`}
                              </span>
                            ))}
                          </div>

                          {isPending && exp.anomalies && exp.anomalies.length > 0 && (
                            <div className="mt-4 p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-semibold text-amber-400">Anomalies Detected</span>
                              </div>
                              {exp.anomalies.map((anom) => (
                                <p key={anom.id} className="text-xs text-amber-300">• {anom.description}</p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-400">
                            {exp.currency === 'USD' ? '$' : '₹'}{Number(exp.originalAmount).toLocaleString()}
                          </div>
                          {exp.currency === 'USD' && (
                            <div className="text-xs text-gray-500 mt-1">
                              ₹{Number(exp.baseAmountINR).toLocaleString()} @ rate {Number(exp.exchangeRate)}
                            </div>
                          )}
                          
                          {isPending && group?.isActiveMember && (
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleApproveExpense(exp.id)}
                                className="px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900 text-emerald-400 text-xs rounded-lg transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectExpense(exp.id)}
                                className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900 text-rose-400 text-xs rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {group?.isActiveMember && (
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="mt-2 text-xs text-gray-500 hover:text-rose-400 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Balances Tab */}
        {activeTab === 'balances' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Balance Sheet</h2>
              {group?.isActiveMember && (
                <button
                  onClick={() => {
                    if (activeMemberships.length > 1) {
                      setSetFrom(activeMemberships[0].userId);
                      setSetTo(activeMemberships[1].userId);
                    }
                    setShowAddSettlement(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Record Settlement
                </button>
              )}
            </div>

            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400">Member</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400">Paid</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400">Owed</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400">Settled</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {balances.map((bal) => {
                      const offsets = bal.settlementsPaid - bal.settlementsReceived;
                      return (
                        <tr key={bal.userId} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-white">{bal.name}</span>
                            {bal.userId === user?.id && (
                              <span className="ml-2 text-xs text-cyan-400">(You)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-300">₹{bal.totalPaid.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-gray-300">₹{bal.totalOwed.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-xs text-gray-400">
                            {offsets > 0 ? `Sent ₹${offsets}` : offsets < 0 ? `Recv ₹${Math.abs(offsets)}` : '—'}
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${
                            bal.netBalance > 0 ? 'text-emerald-400' : bal.netBalance < 0 ? 'text-rose-400' : 'text-gray-400'
                          }`}>
                            {bal.netBalance > 0 ? `+₹${bal.netBalance.toLocaleString()}` : `₹${bal.netBalance.toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Settlement History */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Settlement History</h3>
              {settlements.length === 0 ? (
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl text-center py-8 border border-gray-700/50">
                  <p className="text-gray-500">No recorded settlements yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settlements.map((setl) => (
                    <div key={setl.id} className="bg-gray-900/60 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center justify-between border border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-300">
                          <span className="font-semibold text-white">{setl.payer?.name}</span> paid{' '}
                          <span className="font-semibold text-white">{setl.payee?.name}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400">₹{Number(setl.amount).toLocaleString()}</span>
                        <div className="text-xs text-gray-500">{new Date(setl.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Settlement Suggestions</h2>
              <p className="text-sm text-gray-400">
                Optimized settlement plan to resolve all outstanding balances with minimum transactions
              </p>
            </div>

            {suggestions.length === 0 ? (
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl text-center py-16 border border-gray-700/50">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-gray-400">All debts are settled! No payments required.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((sug, idx) => (
                  <div key={idx} className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-5 flex items-center justify-between border border-gray-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/20 to-rose-600/20 flex items-center justify-center border border-rose-500/30">
                        <span className="font-bold text-rose-400">{sug.fromUser.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{sug.fromUser.name}</span>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-white">{sug.toUser.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-cyan-400">₹{sug.amount.toLocaleString()}</span>
                      {group?.isActiveMember && (
                        <button
                          onClick={() => {
                            setSetFrom(sug.fromUser.id);
                            setSetTo(sug.toUser.id);
                            setSetAmount(sug.amount);
                            setShowAddSettlement(true);
                          }}
                          className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-semibold transition-all"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Members</h2>
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="space-y-4">
                {memberships.map((m) => {
                  const isActive = m.leftAt === null;
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-600/20 text-gray-500'
                        }`}>
                          {m.user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{m.user?.name}</span>
                            {m.userId === user?.id && (
                              <span className="text-xs text-cyan-400">(You)</span>
                            )}
                            {!isActive && (
                              <span className="text-xs text-rose-400">(Left)</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{m.user?.email}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-600">
                            <span>Joined: {new Date(m.joinedAt).toLocaleDateString()}</span>
                            {m.leftAt && (
                              <span>Left: {new Date(m.leftAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CSV Import Tab */}
        {activeTab === 'csv-import' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">CSV Import</h2>
              <p className="text-sm text-gray-400">
                Bulk import expenses from a CSV file. Required columns: Date, Description, OriginalAmount, Currency, ExchangeRate, PayerEmail, SplitType, Participants, SplitValues
              </p>
            </div>

            <form onSubmit={handleCSVUpload} className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
              <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-cyan-500 transition-all duration-300">
                <input
                  id="csv-file-selector"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
                <label htmlFor="csv-file-selector" className="cursor-pointer block">
                  <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-300 font-semibold mb-1">
                    {csvFile ? csvFile.name : 'Click to select CSV file'}
                  </p>
                  <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                </label>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={csvUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {csvUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload & Import
                    </>
                  )}
                </button>
              </div>
            </form>

            {lastImportResult && (
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
                <h3 className="text-lg font-bold text-white mb-4">Import Results</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                    <p className="text-xs text-gray-500">Total Rows</p>
                    <p className="text-2xl font-bold text-white">{lastImportResult.report?.totalRows}</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-950/30 rounded-xl">
                    <p className="text-xs text-emerald-500">Imported</p>
                    <p className="text-2xl font-bold text-emerald-400">{lastImportResult.report?.importedRows}</p>
                  </div>
                  <div className="text-center p-3 bg-rose-950/30 rounded-xl">
                    <p className="text-xs text-rose-500">Failed</p>
                    <p className="text-2xl font-bold text-rose-400">{lastImportResult.report?.failedRows}</p>
                  </div>
                  <div className="text-center p-3 bg-amber-950/30 rounded-xl">
                    <p className="text-xs text-amber-500">Anomalies</p>
                    <p className="text-2xl font-bold text-amber-400">{lastImportResult.anomalies?.length || 0}</p>
                  </div>
                </div>

                {lastImportResult.anomalies?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-400">Validation Details</p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {lastImportResult.anomalies.map((anom, idx) => (
                        <div key={idx} className={`text-xs p-2 rounded-lg ${anom.status === 'FAILED_IMPORT' ? 'bg-rose-950/20 text-rose-300' : 'bg-amber-950/20 text-amber-300'}`}>
                          <span className="font-mono">[{anom.rowDesc || 'Row'}]:</span> {anom.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Import Reports Tab */}
        {activeTab === 'import-reports' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Import History</h2>
            
            {reports.length === 0 ? (
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl text-center py-16 border border-gray-700/50">
                <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No import reports found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-800">
                      <div>
                        <h3 className="font-bold text-white">{report.fileName}</h3>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(report.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="text-gray-400">Total: {report.totalRows}</span>
                        <span className="text-emerald-400">✓ {report.importedRows}</span>
                        <span className="text-rose-400">✗ {report.failedRows}</span>
                      </div>
                    </div>

                    {report.anomalies && report.anomalies.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">Issues Found:</p>
                        {report.anomalies.map((anom) => (
                          <div key={anom.id} className="text-xs text-gray-400 flex justify-between items-center py-1">
                            <span>• {anom.description}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              anom.status === 'PENDING' ? 'text-amber-400 bg-amber-950/30' :
                              anom.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-950/30' :
                              'text-rose-400 bg-rose-950/30'
                            }`}>
                              {anom.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl w-full max-w-2xl p-6 border border-gray-700/50 my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Add Expense</h2>
              </div>
              <button onClick={() => setShowAddExpense(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dinner at Restaurant"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Currency</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    value={expCurrency}
                    onChange={(e) => {
                      const curr = e.target.value;
                      setExpCurrency(curr);
                      setExpRate(curr === 'USD' ? '84.0' : '1.0');
                    }}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {expCurrency === 'USD' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Exchange Rate (1 USD to INR)</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    value={expRate}
                    onChange={(e) => setExpRate(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Paid By</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    value={expPayer}
                    onChange={(e) => setExpPayer(e.target.value)}
                  >
                    {activeMemberships.map((m) => (
                      <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Split Type</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    value={expSplitType}
                    onChange={(e) => setExpSplitType(e.target.value)}
                  >
                    <option value="EQUAL">Equal</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="EXACT">Exact Amount</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase">Participants</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {activeMemberships.map((m) => (
                    <div key={m.userId} className="flex items-center justify-between">
                      <span className="text-gray-300">{m.user?.name}</span>
                      
                      {expSplitType === 'EQUAL' && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={expParticipants[m.userId] === true}
                            onChange={(e) => setExpParticipants(prev => ({ ...prev, [m.userId]: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span className="text-xs text-gray-500">Include</span>
                        </label>
                      )}
                      
                      {expSplitType === 'PERCENTAGE' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="0"
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm text-right"
                            value={expParticipants[m.userId] || ''}
                            onChange={(e) => setExpParticipants(prev => ({ ...prev, [m.userId]: e.target.value }))}
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      )}
                      
                      {expSplitType === 'EXACT' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{expCurrency === 'USD' ? '$' : '₹'}</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm text-right"
                            value={expParticipants[m.userId] || ''}
                            onChange={(e) => setExpParticipants(prev => ({ ...prev, [m.userId]: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Settlement Modal */}
      {showAddSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Record Settlement</h2>
              </div>
              <button onClick={() => setShowAddSettlement(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleRecordSettlement} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Sender (Payer)</label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  value={setFrom}
                  onChange={(e) => setSetFrom(e.target.value)}
                >
                  {activeMemberships.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Recipient (Payee)</label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  value={setTo}
                  onChange={(e) => setSetTo(e.target.value)}
                >
                  {activeMemberships.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Amount (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-cyan-500"
                  value={setAmount}
                  onChange={(e) => setSetAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  value={setDate}
                  onChange={(e) => setSetDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddSettlement(false)} className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;