import { motion } from 'motion/react';
import { Sparkles, Zap, Brain, Heart, Eye, Award } from 'lucide-react';

export function FeatureShowcase() {
  const features = [
    {
      icon: Heart,
      title: 'Emotional AI',
      description: 'Connect your feelings to relevant ayahs',
      color: 'from-rose-500 to-pink-500',
      badge: 'UNIQUE'
    },
    {
      icon: Eye,
      title: 'Visual Mistakes',
      description: 'See exactly where errors occur, word by word',
      color: 'from-purple-500 to-violet-500',
      badge: 'ADVANCED'
    },
    {
      icon: Zap,
      title: 'Similarity X-Ray',
      description: 'AI detects confusing similar verses',
      color: 'from-amber-500 to-orange-500',
      badge: 'UNIQUE'
    },
    {
      icon: Brain,
      title: 'Smart Practice Queue',
      description: 'AI learns your weak points automatically',
      color: 'from-indigo-500 to-blue-500',
      badge: 'SMART'
    },
    {
      icon: Sparkles,
      title: 'Luxury Design',
      description: 'Motion-powered interface that feels alive',
      color: 'from-emerald-500 to-teal-500',
      badge: 'PREMIUM'
    },
    {
      icon: Award,
      title: 'Spiritual Analytics',
      description: 'Deep insights into your Qur\'anic journey',
      color: 'from-cyan-500 to-blue-500',
      badge: 'INSIGHTFUL'
    }
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="pointer-events-auto"
      >
        <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 p-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-medium text-slate-800">
              Features No Other App Has
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.7 + (index * 0.1) }}
                  whileHover={{ y: -4 }}
                  className="relative group"
                >
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 border border-slate-200 hover:border-purple-300 transition-all cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-2 shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xs font-medium text-slate-800 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {feature.description}
                    </p>
                    
                    {/* Badge */}
                    <div className="absolute -top-2 -right-2">
                      <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-full shadow-md font-medium">
                        {feature.badge}
                      </span>
                    </div>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                      Click to learn more
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
