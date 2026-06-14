import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Filter, X, Edit2, Trash2, 
  DollarSign, TrendingUp, TrendingDown, Wallet,
  Calendar, Tag, FileText, RefreshCw, ArrowUpCircle,
  ArrowDownCircle, PieChart, Download, ChevronDown,
  Briefcase, ShoppingBag, Car, Home, Coffee, 
  Heart, Gift, Plane, Film, Book, Code, 
  Phone, Zap, Shield, Moon, Sun, Monitor,
  CreditCard, Landmark, PiggyBank, Award
} from 'lucide-react';

// Category icon mapping - JavaScript object without TypeScript types
const CATEGORY_ICONS = {
  // Income categories
  'Salary': Briefcase,
  'Freelance': Code,
  'Investment': TrendingUp,
  'Gift': Gift,
  'Refund': RefreshCw,
  // Expense categories
  'Food': Coffee,
  'Shopping': ShoppingBag,
  'Travel': Plane,
  'Bills': CreditCard,
  'Entertainment': Film,
  'Health': Heart,
  'Rent': Home,
  'Others': Tag,
};

const DEFAULT_CATEGORIES = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Others'],
  EXPENSE: ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Health', 'Rent', 'Others']
};

const PersonalFinance = () => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncomeINR: 0, totalExpenseINR: 0, netBalanceINR: 0 });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form Fields
  const [formType, setFormType] = useState('EXPENSE');
  const [formCategory, setFormCategory] = useState('Food');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('INR');
  const [formRate, setFormRate] = useState('84.0');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'ALL') params.type = filterType;
      if (filterCategory) params.category = filterCategory;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await api.get('/personal-transactions', { params });
      setTransactions(res.data.transactions);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      showToast('Error loading personal transactions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterType, filterCategory, filterStartDate, filterEndDate]);

  useEffect(() => {
    setFormCategory(DEFAULT_CATEGORIES[formType][0]);
  }, [formType]);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormType('EXPENSE');
    setFormCategory('Food');
    setFormAmount('');
    setFormCurrency('INR');
    setFormRate('84.0');
    setFormDesc('');
    setFormDate(new Date().toISOString().substring(0, 10));
    setShowModal(true);
  };

  const handleOpenEdit = (tx) => {
    setEditId(tx.id);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormAmount(Number(tx.amount));
    setFormCurrency(tx.currency);
    setFormRate(Number(tx.exchangeRate));
    setFormDesc(tx.description || '');
    setFormDate(new Date(tx.date).toISOString().substring(0, 10));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formAmount || Number(formAmount) <= 0) {
      showToast('Please enter a valid positive amount.', 'warning');
      return;
    }

    const payload = {
      type: formType,
      category: formCategory,
      amount: Number(formAmount),
      currency: formCurrency,
      exchangeRate: formCurrency === 'INR' ? 1.0 : Number(formRate || 84.0),
      description: formDesc,
      date: formDate
    };

    try {
      if (editId) {
        await api.put(`/personal-transactions/${editId}`, payload);
        showToast('Transaction updated successfully!', 'success');
      } else {
        await api.post('/personal-transactions', payload);
        showToast('Transaction added successfully!', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save transaction.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/personal-transactions/${id}`);
      showToast('Transaction deleted.', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete transaction.', 'error');
    }
  };

  const handleResetFilters = () => {
    setFilterType('ALL');
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchQuery('');
  };

  const filteredTransactions = searchQuery.trim()
    ? transactions.filter(t => t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || t.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    : transactions;

  const categoryTotals = {};
  transactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.baseAmountINR);
  });

  const totalBaseAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Tag;
    return Icon;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-themeText">
            My Wallet
          </h1>
          <p className="text-themeTextSecondary mt-1">Manage and track your personal finances</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-zinc to-zincLight hover:from-zincLight hover:to-zinc text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md shadow-zinc/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl shadow-sm hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Total Income</span>
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="relative">
            <span className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">₹{summary.totalIncomeINR.toLocaleString()}</span>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl shadow-sm hover:border-rose-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="relative flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">Total Expenses</span>
            <TrendingDown className="w-6 h-6 text-rose-400" />
          </div>
          <div className="relative">
            <span className="text-3xl font-extrabold text-rose-500 dark:text-rose-400">₹{summary.totalExpenseINR.toLocaleString()}</span>
          </div>
        </div>

        <div className={`group relative overflow-hidden p-6 rounded-2xl border shadow-sm transition-all duration-300 ${
          summary.netBalanceINR >= 0 
            ? 'bg-zinc/5 border-zinc/20 hover:border-zinc/40'
            : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
        }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-all ${
            summary.netBalanceINR >= 0 ? 'bg-zinc/10 group-hover:bg-zinc/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'
          }`}></div>
          <div className="relative flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-themeTextSecondary">Net Balance</span>
            <Wallet className={`w-6 h-6 ${summary.netBalanceINR >= 0 ? 'text-zinc' : 'text-rose-500'}`} />
          </div>
          <div className="relative">
            <span className={`text-3xl font-extrabold ${summary.netBalanceINR >= 0 ? 'text-zinc' : 'text-rose-500'}`}>
              ₹{summary.netBalanceINR.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between glass-panel p-4 cursor-pointer"
            >
              <span className="font-semibold text-themeText">Filters</span>
              <ChevronDown className={`w-5 h-5 text-themeTextSecondary transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`glass-panel p-5 space-y-5 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between border-b border-themeBorder pb-3">
                <h3 className="font-bold text-themeText flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc" />
                  Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-zinc hover:text-zincLight transition-colors cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-themeTextSecondary mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-themeTextSecondary" />
                  <input
                    type="text"
                    placeholder="Search description or category..."
                    className="w-full pl-10 pr-4 py-2 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText placeholder-themeTextSecondary/50 focus:outline-none focus:border-zinc text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-themeTextSecondary mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['ALL', 'INCOME', 'EXPENSE'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFilterType(type)}
                      className={`py-2 rounded-xl text-center font-semibold text-xs transition-all duration-200 cursor-pointer ${
                        filterType === type 
                          ? 'bg-gradient-to-r from-zinc to-zincLight text-white shadow-md'
                          : 'bg-themeSurfaceVariant/55 text-themeTextSecondary hover:text-themeText border border-themeBorder'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-themeTextSecondary mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-2 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc text-sm outline-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Object.values(DEFAULT_CATEGORIES).flat().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-themeTextSecondary">
                  Date Range
                </label>
                <div>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc text-sm outline-none"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    placeholder="Start Date"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc text-sm outline-none"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {totalBaseAmount > 0 && (
              <div className="glass-panel p-5 space-y-4">
                <h3 className="font-bold text-themeText flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-zinc" />
                  Spending by Category
                </h3>
                <div className="space-y-3">
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([cat, amt]) => {
                      const Icon = getCategoryIcon(cat);
                      const pct = Math.round((amt / totalBaseAmount) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3 h-3 text-zinc" />
                              <span className="font-semibold text-themeTextSecondary">{cat}</span>
                            </div>
                            <span className="text-themeText font-semibold">₹{amt.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-themeSurfaceVariant rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-zinc to-zincLight transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-themeText">Transaction History</h2>
            <span className="text-sm text-themeTextSecondary">{filteredTransactions.length} transactions</span>
          </div>
          
          {loading ? (
            /* Skeleton Loader list */
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel p-4 animate-pulse flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-themeSurfaceVariant"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-themeSurfaceVariant rounded w-1/3"></div>
                      <div className="h-3 bg-themeSurfaceVariant rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-themeSurfaceVariant rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="glass-panel text-center py-16">
              <Wallet className="w-16 h-16 text-themeTextSecondary mx-auto mb-4" />
              <p className="text-themeTextSecondary">No transactions found</p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 text-zinc hover:text-zincLight font-semibold cursor-pointer"
              >
                Add your first transaction →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map(tx => {
                const Icon = getCategoryIcon(tx.category);
                return (
                  <div key={tx.id} className="group glass-panel p-4 hover:bg-themeSurfaceVariant/45 transition-all duration-300">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${
                          tx.type === 'INCOME' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400'
                        }`}>
                          {tx.type === 'INCOME' ? (
                            <ArrowUpCircle className="w-6 h-6" />
                          ) : (
                            <ArrowDownCircle className="w-6 h-6" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-themeText">{tx.description || 'Untitled'}</h3>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-themeSurfaceVariant border border-themeBorder text-themeTextSecondary">
                              <Icon className="w-3 h-3 text-zinc" />
                              {tx.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-themeTextSecondary flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc" />
                              {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`block font-bold text-lg ${
                            tx.type === 'INCOME' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                          }`}>
                            {tx.type === 'INCOME' ? '+' : '-'}
                            {tx.currency === 'USD' ? '$' : '₹'}{Number(tx.amount).toLocaleString()}
                          </span>
                          {tx.currency === 'USD' && (
                            <span className="block text-xs text-themeTextSecondary">
                              ₹{Number(tx.baseAmountINR).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-2 text-themeTextSecondary hover:text-zinc hover:bg-zinc/10 rounded-lg transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 text-themeTextSecondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 bg-themeSurface/95 border border-themeBorder relative shadow-2xl rounded-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-themeText to-themeTextSecondary bg-clip-text text-transparent">
                {editId ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-themeSurfaceVariant rounded-lg transition-colors cursor-pointer text-themeTextSecondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('EXPENSE')}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      formType === 'EXPENSE'
                        ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md'
                        : 'bg-themeSurfaceVariant/55 text-themeTextSecondary hover:text-themeText border border-themeBorder'
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('INCOME')}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      formType === 'INCOME'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                        : 'bg-themeSurfaceVariant/55 text-themeTextSecondary hover:text-themeText border border-themeBorder'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Income
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc outline-none"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {DEFAULT_CATEGORIES[formType].map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc outline-none"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                    Currency
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc outline-none"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                  >
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                  </select>
                </div>
              </div>

              {/* Exchange Rate */}
              {formCurrency === 'USD' && (
                <div>
                  <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                    USD to INR Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc outline-none"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly groceries, Freelance payment"
                  className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText placeholder-themeTextSecondary/40 focus:outline-none focus:border-zinc outline-none"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-themeTextSecondary uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-themeSurfaceVariant/50 border border-themeBorder rounded-xl text-themeText focus:outline-none focus:border-zinc outline-none"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-themeSurface border border-themeBorder rounded-xl text-themeTextSecondary hover:text-themeText hover:bg-themeSurfaceVariant transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-zinc to-zincLight hover:from-zincLight hover:to-zinc text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-zinc/25"
                >
                  {editId ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalFinance;