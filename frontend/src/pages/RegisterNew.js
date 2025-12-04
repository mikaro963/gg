import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const countries = [
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
];

const passwordRequirements = [
  { id: 'length', regex: /.{8,}/, text: 'At least 8 characters', textAr: 'على الأقل 8 أحرف' },
  { id: 'uppercase', regex: /[A-Z]/, text: 'One uppercase letter', textAr: 'حرف كبير واحد' },
  { id: 'lowercase', regex: /[a-z]/, text: 'One lowercase letter', textAr: 'حرف صغير واحد' },
  { id: 'number', regex: /[0-9]/, text: 'One number', textAr: 'رقم واحد' },
  { id: 'special', regex: /[!@#$%^&*(),.?":{}|<>]/, text: 'One special character', textAr: 'رمز خاص واحد' },
];

const RegisterNew = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [countryCode, setCountryCode] = useState('+963');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
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
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-orange-500';
    if (passwordStrength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
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
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/send-otp`, { email });
      setOtpSent(true);
      setGeneratedOtp(response.data.otp); // For testing only
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/verify-otp`, { email, otp });
      setEmailVerified(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP');
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
      birthDate,
      phone,
      countryCode
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-2xl w-full bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <img src="/logo.png" alt="Cash Wallet Logo" className="h-16 w-auto mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white text-center mb-8">{t('register')}</h2>
        
        {generatedOtp && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-200 text-sm">
            Test OTP: {generatedOtp}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold text-sm">
                {i18n.language === 'ar' ? 'الاسم الأول' : 'First Name'}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Email with OTP */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold text-sm">{t('email')}</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailVerified}
                className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                required
              />
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-semibold disabled:opacity-50"
                >
                  {otpSent ? (i18n.language === 'ar' ? 'إعادة إرسال' : 'Resend') : (i18n.language === 'ar' ? 'إرسال رمز' : 'Send Code')}
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
            <div>
              <label className="block text-gray-300 mb-2 font-semibold text-sm">
                {i18n.language === 'ar' ? 'رمز التحقق' : 'Verification Code'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={i18n.language === 'ar' ? 'أدخل الرمز' : 'Enter code'}
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || !otp}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-semibold disabled:opacity-50"
                >
                  {i18n.language === 'ar' ? 'تحقق' : 'Verify'}
                </button>
              </div>
            </div>
          )}

          {/* Birth Date */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold text-sm">
              {i18n.language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold text-sm">
              {i18n.language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-300 mb-2 font-semibold text-sm">{t('password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => {
                  setPasswordFocused(true);
                  setShowPasswordRequirements(true);
                }}
                onBlur={() => setPasswordFocused(false)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
            
            {/* Password Requirements Popup */}
            {showPasswordRequirements && passwordFocused && (
              <div className="mt-2 p-4 bg-[#0a0a0a] border border-gray-700 rounded-lg">
                <p className="text-gray-300 text-sm font-semibold mb-2">
                  {i18n.language === 'ar' ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
                </p>
                <ul className="space-y-1">
                  {passwordRequirements.map(req => (
                    <li key={req.id} className="flex items-center gap-2 text-sm">
                      {req.regex.test(password) ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={req.regex.test(password) ? 'text-emerald-400' : 'text-gray-500'}>
                        {i18n.language === 'ar' ? req.textAr : req.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password with Strength Bar */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold text-sm">{t('confirmPassword')}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => {
                  setConfirmPasswordFocused(true);
                  setShowPasswordRequirements(false);
                }}
                onBlur={() => setConfirmPasswordFocused(false)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
            
            {/* Password Strength Bar */}
            {password && (confirmPasswordFocused || passwordStrength > 0) && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">
                    {i18n.language === 'ar' ? 'قوة كلمة المرور:' : 'Password Strength:'}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: getStrengthColor().replace('bg-', 'text-') }}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !emailVerified}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 mt-6"
          >
            {loading ? t('loading') : t('registerButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            {t('login')}
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm">
            ← {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterNew;