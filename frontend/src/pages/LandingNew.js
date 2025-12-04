import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LandingNew = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 container mx-auto px-4 py-6"
      >
        <div className="flex justify-between items-center backdrop-blur-sm bg-[#1a1a1a]/50 rounded-2xl px-6 py-4 border border-gray-800/50">
          <div className="flex items-center gap-3">
            <motion.img 
              whileHover={{ scale: 1.05, rotate: 5 }}
              src="/logo.png" 
              alt="Cash Wallet Logo" 
              className="h-10 w-auto" 
            />
            <h1 className="text-2xl font-bold text-white hidden sm:block">Cash Wallet</h1>
          </div>
          <div className="flex gap-3">
            <LanguageSwitcher />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 font-semibold text-sm"
            >
              {t('login')}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={itemVariants} className={isRTL ? 'lg:order-2' : ''}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="inline-block mb-6"
              >
                <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold backdrop-blur-sm">
                  🚀 {i18n.language === 'ar' ? 'منصة صرافة موثوقة' : 'Trusted Exchange Platform'}
                </div>
              </motion.div>
              
              <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent">
                  {t('heroTitle')}
                </span>
              </h2>
              
              <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-lg font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                >
                  {t('getStarted')} →
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/5 border border-gray-700 text-white rounded-xl text-lg font-semibold backdrop-blur-sm hover:bg-white/10 hover:border-gray-600 transition-all duration-300"
                >
                  {i18n.language === 'ar' ? 'المزيد من المعلومات' : 'Learn More'}
                </motion.button>
              </div>

              {/* Stats */}
              <motion.div variants={itemVariants} className="mt-12 grid grid-cols-3 gap-6">
                {[
                  { value: '10K+', label: i18n.language === 'ar' ? 'مستخدم' : 'Users' },
                  { value: '$50M+', label: i18n.language === 'ar' ? 'حجم التداول' : 'Volume' },
                  { value: '99.9%', label: i18n.language === 'ar' ? 'وقت التشغيل' : 'Uptime' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              variants={itemVariants}
              className={`relative ${isRTL ? 'lg:order-1' : ''}`}
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  <img src="/hero.png" alt="Hero" className="w-full h-auto drop-shadow-2xl" />
                </motion.div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('features')}
          </h3>
          <p className="text-xl text-gray-400">
            {i18n.language === 'ar' ? 'لماذا تختار منصتنا' : 'Why Choose Our Platform'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {[
            {
              icon: '/handshake.png',
              title: t('featureSecure'),
              desc: i18n.language === 'ar' ? 'حماية متقدمة لأموالك' : 'Advanced protection for your funds'
            },
            {
              icon: '/finance1.png',
              title: t('featureMultiCurrency'),
              desc: i18n.language === 'ar' ? '4 عملات مدعومة' : '4 supported currencies'
            },
            {
              icon: '/finance2.png',
              title: t('featureInstant'),
              desc: i18n.language === 'ar' ? 'تحويلات فورية' : 'Instant transfers'
            },
            {
              icon: '/finance3.png',
              title: i18n.language === 'ar' ? 'دعم 24/7' : '24/7 Support',
              desc: i18n.language === 'ar' ? 'فريق دعم متاح دائماً' : 'Always available support team'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-3xl border border-gray-800 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <img src={feature.icon} alt={feature.title} className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {i18n.language === 'ar' ? 'ابدأ رحلتك المالية اليوم' : 'Start Your Financial Journey Today'}
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            {i18n.language === 'ar' ? 'انضم إلى آلاف المستخدمين الذين يثقون بنا' : 'Join thousands of users who trust us'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-lg font-semibold shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300"
          >
            {t('registerButton')} →
          </motion.button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-[#0a0a0a]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              <span className="text-gray-400 text-sm">© 2025 Cash Wallet. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingNew;