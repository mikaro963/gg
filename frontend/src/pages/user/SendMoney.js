import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SendMoney = () => {
  const { t, i18n } = useTranslation();
  const [wallets, setWallets] = useState([]);
  const [fromWallet, setFromWallet] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('wallet');
  const [fee, setFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (amount) {
      const calculatedFee = parseFloat(amount) * 0.01; // 1% fee
      setFee(calculatedFee);
    } else {
      setFee(0);
    }
  }, [amount]);

  const fetchWallets = async () => {
    try {
      const response = await axios.get(`${API}/user/wallets`);
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFromWallet('');
        setToAddress('');
        setAmount('');
      }, 2000);
    }, 1500);
  };

  const total = parseFloat(amount || 0) + fee;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {i18n.language === 'ar' ? 'إرسال الأموال' : 'Send Money'}
        </h1>
        <p className="text-gray-400">
          {i18n.language === 'ar' ? 'قم بإرسال الأموال إلى محفظة أخرى' : 'Transfer funds to another wallet'}
        </p>
      </motion.div>

      {/* Active Wallets Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-emerald-400 font-semibold text-sm mb-1">{wallet.currency}</div>
            <div className="text-white text-lg font-bold">{wallet.balance.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/20 border border-emerald-500 rounded-xl p-4 text-emerald-300"
        >
          ✓ {i18n.language === 'ar' ? 'تم إرسال الأموال بنجاح!' : 'Money sent successfully!'}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-6">
        {/* From Wallet */}
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">
            {i18n.language === 'ar' ? 'من المحفظة' : 'From Wallet'}
          </label>
          <select
            value={fromWallet}
            onChange={(e) => setFromWallet(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">{i18n.language === 'ar' ? 'اختر المحفظة' : 'Select Wallet'}</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.currency}>
                {wallet.currency} - {wallet.balance.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Send Method */}
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">
            {i18n.language === 'ar' ? 'طريقة الإرسال' : 'Send Method'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'wallet', label: i18n.language === 'ar' ? 'محفظة' : 'Wallet' },
              { value: 'bank', label: i18n.language === 'ar' ? 'حساب بنكي' : 'Bank Account' },
              { value: 'cash', label: i18n.language === 'ar' ? 'نقداً' : 'Cash' }
            ].map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  method === m.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#0a0a0a] text-gray-400 border border-gray-700 hover:border-emerald-500/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* To Address */}
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">
            {i18n.language === 'ar' ? 'عنوان المحفظة' : 'Wallet Address'}
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={i18n.language === 'ar' ? 'أدخل عنوان المحفظة' : 'Enter wallet address'}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">
            {i18n.language === 'ar' ? 'المبلغ' : 'Amount'}
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
            required
          />
        </div>

        {/* Summary */}
        {amount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#0a0a0a] border border-gray-700 rounded-xl p-4 space-y-2"
          >
            <div className="flex justify-between text-gray-400">
              <span>{i18n.language === 'ar' ? 'المبلغ' : 'Amount'}:</span>
              <span className="text-white">{parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>{i18n.language === 'ar' ? 'رسوم التحويل' : 'Transfer Fee'}:</span>
              <span className="text-white">{fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between text-lg font-bold">
              <span className="text-white">{i18n.language === 'ar' ? 'الإجمالي' : 'Total'}:</span>
              <span className="text-emerald-400">{total.toFixed(2)}</span>
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {i18n.language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
            </span>
          ) : (
            i18n.language === 'ar' ? 'إرسال الأموال' : 'Send Money'
          )}
        </button>
      </form>
    </div>
  );
};

export default SendMoney;