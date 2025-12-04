import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Auth
      "login": "Login",
      "register": "Register",
      "email": "Email",
      "password": "Password",
      "name": "Name",
      "confirmPassword": "Confirm Password",
      "alreadyHaveAccount": "Already have an account?",
      "dontHaveAccount": "Don't have an account?",
      "loginButton": "Sign In",
      "registerButton": "Create Account",
      
      // Navigation
      "dashboard": "Dashboard",
      "wallets": "Wallets",
      "transactions": "Transactions",
      "profile": "Profile",
      "logout": "Logout",
      "admin": "Admin Panel",
      
      // Dashboard
      "welcome": "Welcome",
      "totalBalance": "Total Balance",
      "recentTransactions": "Recent Transactions",
      "myWallets": "My Wallets",
      
      // Admin
      "totalUsers": "Total Users",
      "newUsersToday": "New Users Today",
      "pendingTransactions": "Pending Transactions",
      "completedDeposits": "Completed Deposits",
      "completedWithdrawals": "Completed Withdrawals",
      "profits": "Profits",
      "users": "Users",
      "allWallets": "All Wallets",
      "allTransactions": "All Transactions",
      
      // Common
      "currency": "Currency",
      "balance": "Balance",
      "amount": "Amount",
      "status": "Status",
      "type": "Type",
      "date": "Date",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      
      // Status
      "pending": "Pending",
      "completed": "Completed",
      "failed": "Failed",
      
      // Types
      "deposit": "Deposit",
      "withdrawal": "Withdrawal",
      "exchange": "Exchange",
      
      // Landing
      "heroTitle": "Digital Currency Exchange Platform",
      "heroSubtitle": "Trade USD, USDT, SYP, and TRY securely and easily",
      "getStarted": "Get Started",
      "features": "Features",
      "featureSecure": "Secure Transactions",
      "featureMultiCurrency": "Multi-Currency Support",
      "featureInstant": "Instant Exchange"
    }
  },
  ar: {
    translation: {
      // Auth
      "login": "تسجيل الدخول",
      "register": "إنشاء حساب",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "name": "الاسم",
      "confirmPassword": "تأكيد كلمة المرور",
      "alreadyHaveAccount": "لديك حساب بالفعل؟",
      "dontHaveAccount": "ليس لديك حساب؟",
      "loginButton": "دخول",
      "registerButton": "إنشاء حساب",
      
      // Navigation
      "dashboard": "لوحة التحكم",
      "wallets": "المحافظ",
      "transactions": "المعاملات",
      "profile": "الملف الشخصي",
      "logout": "تسجيل الخروج",
      "admin": "لوحة الإدارة",
      
      // Dashboard
      "welcome": "مرحباً",
      "totalBalance": "الرصيد الإجمالي",
      "recentTransactions": "آخر المعاملات",
      "myWallets": "محافظي",
      
      // Admin
      "totalUsers": "إجمالي المستخدمين",
      "newUsersToday": "المستخدمون الجدد اليوم",
      "pendingTransactions": "المعاملات قيد الانتظار",
      "completedDeposits": "إجمالي الإيداعات المكتملة",
      "completedWithdrawals": "إجمالي السحوبات المكتملة",
      "profits": "الأرباح",
      "users": "المستخدمون",
      "allWallets": "جميع المحافظ",
      "allTransactions": "جميع المعاملات",
      
      // Common
      "currency": "العملة",
      "balance": "الرصيد",
      "amount": "المبلغ",
      "status": "الحالة",
      "type": "النوع",
      "date": "التاريخ",
      "loading": "جار التحميل...",
      "error": "خطأ",
      "success": "نجح",
      
      // Status
      "pending": "معلق",
      "completed": "مكتمل",
      "failed": "فشل",
      
      // Types
      "deposit": "إيداع",
      "withdrawal": "سحب",
      "exchange": "صرف",
      
      // Landing
      "heroTitle": "منصة صرافة العملات الرقمية",
      "heroSubtitle": "تداول USD و USDT و SYP و TRY بأمان وسهولة",
      "getStarted": "ابدأ الآن",
      "features": "المميزات",
      "featureSecure": "معاملات آمنة",
      "featureMultiCurrency": "دعم عملات متعددة",
      "featureInstant": "صرف فوري"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;