import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LanguageSwitcher from '../components/LanguageSwitcher';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, walletsRes, transactionsRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard-stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/wallets`),
        axios.get(`${API}/admin/transactions`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setWallets(walletsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Cash Wallet - {t('admin')}</h1>
          <div className="flex items-center gap-4">
            <span className="text-purple-200">{user?.name}</span>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-semibold"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {['overview', 'users', 'wallets', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              {t(tab === 'overview' ? 'dashboard' : tab === 'users' ? 'users' : tab === 'wallets' ? 'allWallets' : 'allTransactions')}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">{t('dashboard')}</h2>
            
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="text-purple-300 mb-2">{t('totalUsers')}</div>
                <div className="text-3xl font-bold text-white">{stats.total_users}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="text-purple-300 mb-2">{t('newUsersToday')}</div>
                <div className="text-3xl font-bold text-white">{stats.new_users_today}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="text-purple-300 mb-2">{t('pendingTransactions')}</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.pending_transactions}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="text-purple-300 mb-2">{t('completedDeposits')}</div>
                <div className="text-3xl font-bold text-green-400">{stats.completed_deposits}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="text-purple-300 mb-2">{t('completedWithdrawals')}</div>
                <div className="text-3xl font-bold text-blue-400">{stats.completed_withdrawals}</div>
              </div>
            </div>

            {/* Currency Balances */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">{t('totalBalance')}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(stats.currency_balances).map(([currency, balance]) => (
                  <div
                    key={currency}
                    className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md p-6 rounded-2xl border border-white/20"
                  >
                    <div className="text-purple-300 mb-2">{currency}</div>
                    <div className="text-3xl font-bold text-white">{balance.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">{t('users')}</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('name')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('email')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">Language</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4 text-white">{u.name}</td>
                        <td className="px-6 py-4 text-purple-300">{u.email}</td>
                        <td className="px-6 py-4 text-white uppercase">{u.language}</td>
                        <td className="px-6 py-4 text-purple-200">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">{t('allWallets')}</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">User ID</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('currency')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('balance')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((w) => (
                      <tr key={w.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4 text-purple-300 text-sm font-mono">
                          {w.user_id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">{w.currency}</td>
                        <td className="px-6 py-4 text-white">{w.balance.toLocaleString()}</td>
                        <td className="px-6 py-4 text-purple-200">
                          {new Date(w.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">{t('allTransactions')}</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-purple-300">
                  No transactions yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">User ID</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('type')}</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('amount')}</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('currency')}</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('status')}</th>
                        <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-t border-white/10 hover:bg-white/5">
                          <td className="px-6 py-4 text-purple-300 text-sm font-mono">
                            {tx.user_id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-white capitalize">{t(tx.type)}</td>
                          <td className="px-6 py-4 text-white font-semibold">{tx.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-purple-300">{tx.currency}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                tx.status === 'completed'
                                  ? 'bg-green-500/20 text-green-300'
                                  : tx.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {t(tx.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-purple-200">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;