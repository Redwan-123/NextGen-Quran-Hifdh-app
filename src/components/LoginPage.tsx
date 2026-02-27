import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBack?: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#0f051a]">
      </div>

      {/* Back button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-purple-300/70 text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2"
        >
          ← Back
        </motion.button>
      )}

      {/* Islamic decorative border (top) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/40" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/40" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glowing border effect */}
        <div className="absolute -inset-[1px] bg-purple-500/30 rounded-3xl blur-sm" />
        
        <div className="relative bg-[#110520]/90 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-[0_30px_100px_rgba(100,50,200,0.15)]">
          
          {/* Logo / Branding */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-purple-600/20 border border-white/10 flex items-center justify-center text-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Quran <span className="text-amber-400">Teacher</span>
            </h1>
            <p className="text-purple-200/50 text-sm mt-1 tracking-wide">
              Digital Mushaf • Student Tracking • Progress Analytics
            </p>
          </motion.div>

          {/* Tab switcher */}
          <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6 border border-white/[0.06]">
            {(['signin', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsSignUp(tab === 'signup'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  (tab === 'signin' && !isSignUp) || (tab === 'signup' && isSignUp)
                    ? 'bg-purple-600/30 text-white shadow-lg shadow-purple-500/10 border border-purple-500/20'
                    : 'text-purple-300/50 hover:text-purple-200/70'
                }`}
              >
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error / Success messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-xs font-medium text-purple-300/60 mb-1.5 uppercase tracking-widest">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.06] transition-all duration-300"
                    placeholder="Sheikh Ahmad"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-purple-300/60 mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.06] transition-all duration-300"
                placeholder="teacher@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-300/60 mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.06] transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <span className="relative z-10">
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    ⟳
                  </motion.span>
                ) : isSignUp ? 'Create Teacher Account' : 'Sign In'}
              </span>
              <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#110520] text-purple-300/40 uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <motion.button
            type="button"
            onClick={async () => {
              setError('');
              const { error } = await signInWithGoogle();
              if (error) setError(error.message);
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white font-medium text-sm tracking-wide hover:bg-white/[0.1] transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="group-hover:text-white/90 transition-colors">Continue with Google</span>
          </motion.button>

          {/* Footer decorative */}
          <div className="mt-6 pt-6 border-t border-white/[0.05] text-center">
            <p className="text-purple-300/30 text-xs tracking-wider">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
