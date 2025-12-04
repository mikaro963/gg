import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LanguageSwitcher from '../components/LanguageSwitcher';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletsRes, transactionsRes] = await Promise.all([
        axios.get(`${API}/user/wallets`),
        axios.get(`${API}/user/transactions`)
      ]);
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
          <h1 className="text-2xl font-bold text-white">Cash Wallet</h1>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">
          {t('welcome')}, {user?.name}!
        </h2>

        {/* Wallets Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">{t('myWallets')}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-purple-300 font-semibold">{wallet.currency}</span>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{wallet.currency.substring(0, 1)}</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {wallet.balance.toLocaleString()}
                </div>
                <div className="text-purple-200 text-sm">{t('balance')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">{t('recentTransactions')}</h3>
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
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('type')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('amount')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('currency')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('status')}</th>
                      <th className="px-6 py-4 text-left text-purple-200 font-semibold">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx) => (
                      <tr key={tx.id} className="border-t border-white/10 hover:bg-white/5">
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
                        <td className="px-6 py-4 text-purple-200 text-sm">
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
      </div>
    </div>
  );
};

export default UserDashboard;