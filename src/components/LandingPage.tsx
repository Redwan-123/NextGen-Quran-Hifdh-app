import { motion } from 'framer-motion';
import { Globe, Heart, Brain, Zap, Users, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Heart,
      title: 'Emotional Connection',
      description: 'Find Quranic verses that resonate with your emotional state and provide spiritual guidance.',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'Intelligent Learning',
      description: 'AI-powered recommendations help you memorize and understand the Quran more effectively.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Sparkles,
      title: 'Rich Insights',
      description: 'Deep tafsir explanations, similar verses, and scholarly perspectives from multiple traditions.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Mentorship',
      description: 'Connect with certified scholars and mentors for personalized Quranic guidance and support.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Practice & Progress',
      description: 'Track your memorization journey, practice with audio recitations, and celebrate milestones.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: MessageCircle,
      title: 'Community',
      description: 'Share insights, ask questions, and grow spiritually with a supportive community.',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  const stats = [
    { number: '114', label: 'Complete Surahs' },
    { number: '6,236', label: 'Verses' },
    { number: '50+', label: 'Reciters' },
    { number: '8', label: 'Emotions' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10">
        {/* Header/Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative w-10 h-10">
              {/* Central Globe */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <Globe className="w-10 h-10 text-white" />
              </motion.div>
              
              {/* Orbiting planets */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white/60 rounded-full"></div>
              </motion.div>
            </div>
            <span className="text-2xl font-bold text-white">
              QuranVerse
            </span>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <motion.div
              className="inline-block mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white">
              Your Spiritual Journey Begins Here
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Connect with the Quran on an emotional level. Find verses that speak to your heart, learn from world-class scholars, and grow in faith.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-purple-600 font-bold shadow-lg hover:shadow-xl transition-shadow uppercase tracking-wide"
            >
              LAUNCH APP <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-white/20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {stat.number}
                </p>
                <p className="text-sm text-white/80 mt-2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Powerful Features for Your Growth
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Everything you need to deepen your relationship with the Quran
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 py-20 text-center"
        >
          <div className="bg-white/10 rounded-3xl border border-white/20 p-12 backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Quranic Journey?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are deepening their understanding of the Quran with personalized guidance and AI-powered insights.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-purple-600 font-bold shadow-lg hover:shadow-xl transition-shadow uppercase tracking-wide"
            >
              START YOUR JOURNEY <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="border-t border-white/20 py-8 text-center text-white/80">
          <p>© 2026 QuranVerse. Helping you connect with the Quran on a deeper level.</p>
        </div>
      </div>
    </div>
  );
}
