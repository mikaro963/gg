import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import OtpInput from 'react-otp-input';
import PhoneInput from 'react-phone-number-input';
import DatePicker from 'react-datepicker';
import 'react-phone-number-input/style.css';
import 'react-datepicker/dist/react-datepicker.css';
import LanguageSwitcherDropdown from '../components/LanguageSwitcherDropdown';
import axios from 'axios';

// Use Railway API
const BACKEND_URL = 'https://proactive-youthfulness-production-6422.up.railway.app';
const API = `${BACKEND_URL}/api`;

const passwordRequirements = [
  { id: 'length', regex: /.{8,}/, textEn: 'At least 8 characters', textAr: 'على الأقل 8 أحرف' },
  { id: 'uppercase', regex: /[A-Z]/, textEn: 'One uppercase letter', textAr: 'حرف كبير واحد' },
  { id: 'lowercase', regex: /[a-z]/, textEn: 'One lowercase letter', textAr: 'حرف صغير واحد' },
  { id: 'number', regex: /[0-9]/, textEn: 'One number', textAr: 'رقم واحد' },
  { id: 'special', regex: /[!@#$%^&*(),.?":{}|<>]/, textEn: 'One special character', textAr: 'رمز خاص واحد' },
];

const RegisterAdvanced = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Step management
  const [step, setStep] = useState(1);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    passwordRequirements.forEach(req => {
      if (req.regex.test(pwd)) strength += 20;
    });
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);
  
  const getStrengthColor = () => {
    if (passwordStrength < 40) return { bg: 'bg-red-500', text: 'text-red-400' };
    if (passwordStrength < 60) return { bg: 'bg-orange-500', text: 'text-orange-400' };
    if (passwordStrength < 80) return { bg: 'bg-yellow-500', text: 'text-yellow-400' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return i18n.language === 'ar' ? 'ضعيفة' : 'Weak';
    if (passwordStrength < 60) return i18n.language === 'ar' ? 'متوسطة' : 'Medium';
    if (passwordStrength < 80) return i18n.language === 'ar' ? 'جيدة' : 'Good';
    return i18n.language === 'ar' ? 'قوية جداً' : 'Very Strong';
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError(i18n.language === 'ar' ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter email');
      return;
    }
    
    // For now, just simulate sending OTP (Railway doesn't have separate send-otp endpoint)
    setOtpSent(true);
    setGeneratedOtp('123456'); // For testing
    setError('');
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/verify-otp`, { 
        email, 
        code: otp 
      });
      
      if (response.data.success) {
        setEmailVerified(true);
        setError('');
        setStep(2);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailVerified) {
      setError(i18n.language === 'ar' ? 'الرجاء التحقق من البريد الإلكتروني أولاً' : 'Please verify email first');
      return;
    }

    if (password !== confirmPassword) {
      setError(i18n.language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (passwordStrength < 80) {
      setError(i18n.language === 'ar' ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak');
      return;
    }

    setLoading(true);
    const result = await register(
      firstName,
      email,
      password,
      i18n.language,
      lastName,
      birthDate ? birthDate.toISOString().split('T')[0] : '',
      phone || '',
      ''
    );
    
    if (result.success) {
      // Registration successful, now login
      navigate('/login');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const canProceedToStep2 = firstName && lastName && email && emailVerified;
  const canProceedToStep3 = birthDate && phone;

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcherDropdown />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-xl"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Cash Wallet Logo" className="h-16 w-auto mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('register')}</h2>
            <p className="text-gray-400">
              {i18n.language === 'ar' ? 'انضم إلى آلاف المستخدمين' : 'Join thousands of users'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center items-center gap-4 mb-10">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step >= s
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-xs ${step >= s ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {s === 1 ? (i18n.language === 'ar' ? 'المعلومات' : 'Info') :
                     s === 2 ? (i18n.language === 'ar' ? 'التفاصيل' : 'Details') :
                     (i18n.language === 'ar' ? 'الأمان' : 'Security')}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`h-0.5 w-16 transition-colors ${
                    step > s ? 'bg-emerald-500' : 'bg-gray-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Test OTP Display */}
          {generatedOtp && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-xl text-blue-300 text-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test OTP: <strong className="font-mono">{generatedOtp}</strong>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-300 text-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Info & Email Verification */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Names */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2 font-semibold text-sm">
                        {i18n.language === 'ar' ? 'الاسم الأول' : 'First Name'}
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder={i18n.language === 'ar' ? 'أدخل الاسم الأول' : 'Enter first name'}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 font-semibold text-sm">
                        {i18n.language === 'ar' ? 'الاسم الثاني' : 'Last Name'}
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder={i18n.language === 'ar' ? 'أدخل الاسم الثاني' : 'Enter last name'}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold text-sm">
                      {t('email')}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={emailVerified}
                        className="flex-1 px-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                        placeholder={i18n.language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        required
                      />
                      {!emailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={loading || !email}
                          className="px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50 whitespace-nowrap"
                        >
                          {otpSent ? (i18n.language === 'ar' ? 'إعادة إرسال' : 'Resend') : (i18n.language === 'ar' ? 'إرسال الرمز' : 'Send Code')}
                        </button>
                      )}
                      {emailVerified && (
                        <div className="flex items-center px-4 text-emerald-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OTP Verification */}
                  {otpSent && !emailVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-gray-300 mb-3 font-semibold text-sm">
                        {i18n.language === 'ar' ? 'أدخل رمز التحقق' : 'Enter verification code'}
                      </label>
                      <div className="flex flex-col items-center gap-4">
                        <OtpInput
                          value={otp}
                          onChange={setOtp}
                          numInputs={6}
                          renderSeparator={<span className="mx-2"></span>}
                          renderInput={(props) => <input {...props} />}
                          inputStyle={{
                            width: '3rem',
                            height: '3.5rem',
                            fontSize: '1.5rem',
                            borderRadius: '0.75rem',
                            border: '2px solid #374151',
                            backgroundColor: '#0a0a0a',
                            color: '#fff',
                            outline: 'none',
                          }}
                          focusStyle={{
                            border: '2px solid #10b981',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={loading || otp.length !== 6}
                          className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50"
                        >
                          {loading ? (i18n.language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (i18n.language === 'ar' ? 'تحقق' : 'Verify')}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="button"
                    onClick={() => canProceedToStep2 && setStep(2)}
                    disabled={!canProceedToStep2}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {i18n.language === 'ar' ? 'التالي' : 'Next'} →
                  </button>
                </motion.div>
              )}

              {/* Step 2: Additional Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Birth Date */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold text-sm">
                      {i18n.language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
                    </label>
                    <DatePicker
                      selected={birthDate}
                      onChange={(date) => setBirthDate(date)}
                      dateFormat="dd/MM/yyyy"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      placeholderText={i18n.language === 'ar' ? 'اختر تاريخ الميلاد' : 'Select birth date'}
                      className="w-full px-4 py-4 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      wrapperClassName="w-full"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold text-sm">
                      {i18n.language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="SY"
                      value={phone}
                      onChange={setPhone}
                      className="phone-input-custom"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                    >
                      ← {i18n.language === 'ar' ? 'السابق' : 'Back'}
                    </button>
                    <button
                      type="button"
                      onClick={() => canProceedToStep3 && setStep(3)}
                      disabled={!canProceedToStep3}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {i18n.language === 'ar' ? 'التالي' : 'Next'} →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Password */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold text-sm">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        className="w-full px-4 py-4 pr-14 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder={i18n.language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {password && !confirmPasswordFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 space-y-2"
                      >
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">
                            {i18n.language === 'ar' ? 'قوة كلمة المرور:' : 'Password Strength:'}
                          </span>
                          <span className={`font-semibold ${getStrengthColor().text}`}>
                            {getStrengthText()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength}%` }}
                            className={`h-full ${getStrengthColor().bg} transition-all duration-300`}
                          />
                        </div>
                        
                        {/* Requirements */}
                        <div className="mt-3 space-y-2 p-4 bg-[#0a0a0a] rounded-xl border border-gray-800">
                          <p className="text-gray-300 text-xs font-semibold mb-2">
                            {i18n.language === 'ar' ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {passwordRequirements.map(req => (
                              <div key={req.id} className="flex items-center gap-2 text-xs">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                  req.regex.test(password) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-600'
                                }`}>
                                  {req.regex.test(password) ? '✓' : '○'}
                                </div>
                                <span className={req.regex.test(password) ? 'text-emerald-400' : 'text-gray-500'}>
                                  {i18n.language === 'ar' ? req.textAr : req.textEn}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold text-sm">
                      {t('confirmPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-4 pr-14 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder={i18n.language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {i18n.language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                    >
                      ← {i18n.language === 'ar' ? 'السابق' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading || passwordStrength < 80 || password !== confirmPassword}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('loading')}
                        </div>
                      ) : (
                        t('registerButton')
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                {t('login')}
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm transition-colors inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .phone-input-custom input {
          width: 100%;
          padding: 1rem 1rem 1rem 3.5rem;
          background-color: #0a0a0a;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        .phone-input-custom input:focus {
          border-color: #10b981;
          ring: 2px;
          ring-color: #10b981;
        }
        .phone-input-custom .PhoneInputCountry {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
        }
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker-popper {
          z-index: 50;
        }
        .react-datepicker {
          background-color: #1a1a1a;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          color: white;
        }
        .react-datepicker__header {
          background-color: #0a0a0a;
          border-bottom: 1px solid #374151;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: white;
        }
        .react-datepicker__day {
          color: #9ca3af;
        }
        .react-datepicker__day:hover {
          background-color: #10b981;
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #10b981;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default RegisterAdvanced;