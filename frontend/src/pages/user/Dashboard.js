import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get(`${API}/user/wallets`);
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const currencyIcons = {
    USD: '$',
    USDT: '₮',
    SYP: 'S£',
    TRY: '₺'
  };

  const currencyColors = {
    USD: 'from-green-500 to-emerald-600',
    USDT: 'from-teal-500 to-cyan-600',
    SYP: 'from-blue-500 to-indigo-600',
    TRY: 'from-red-500 to-rose-600'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-gray-400">
          {i18n.language === 'ar' ? 'مرحباً بك في محفظتك الرقمية' : 'Welcome to your digital wallet'}
        </p>
      </motion.div>

      {/* Active Wallets */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          {i18n.language === 'ar' ? 'محفظتك النشطة' : 'Active Wallets'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wallets.map((wallet, index) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currencyColors[wallet.currency]} flex items-center justify-center text-white text-xl font-bold`}>
                  {currencyIcons[wallet.currency]}
                </div>
                <span className="text-gray-400 text-sm font-medium">{wallet.currency}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-gray-500 text-sm">
                {i18n.language === 'ar' ? 'الرصيد المتاح' : 'Available Balance'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          {i18n.language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '💸', label: i18n.language === 'ar' ? 'إرسال' : 'Send', path: '/user/send', color: 'emerald' },
            { icon: '📥', label: i18n.language === 'ar' ? 'استقبال' : 'Receive', path: '/user/receive', color: 'blue' },
            { icon: '🔄', label: i18n.language === 'ar' ? 'صرف' : 'Exchange', path: '/user/exchange', color: 'purple' },
            { icon: '➕', label: i18n.language === 'ar' ? 'إيداع' : 'Deposit', path: '/user/deposit', color: 'green' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all"
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <div className="text-white font-semibold">{action.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          {i18n.language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
        </h2>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
          <div className="text-center text-gray-500 py-8">
            {i18n.language === 'ar' ? 'لا توجد معاملات حديثة' : 'No recent transactions'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;