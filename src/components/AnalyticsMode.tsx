import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getUserAnalytics, getThemeEngagement } from '../data/userAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Eye, EyeOff, Heart, Calendar, Zap } from 'lucide-react';

interface AnalyticsModeProps {
  darkMode?: boolean;
}

export function AnalyticsMode({ darkMode = false }: AnalyticsModeProps) {
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [themeData, setThemeData] = useState<any[]>([]);

  useEffect(() => {
    // Load user data
    const analytics = getUserAnalytics();
    const themes = getThemeEngagement();
    
    setUserAnalytics(analytics);
    setThemeData(themes);
  }, []);

  if (!userAnalytics) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading analytics...</div>;
  }

  const totalVisited = userAnalytics.monthlyEngagement.reduce((sum: number, d: any) => sum + d.visited, 0);
  const totalSkipped = userAnalytics.monthlyEngagement.reduce((sum: number, d: any) => sum + d.skipped, 0);
  const totalRevisited = userAnalytics.monthlyEngagement.reduce((sum: number, d: any) => sum + d.revisited, 0);

  const themeColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  // Mock heatmap data
  const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    engagement: Math.floor(Math.random() * 100)
  }));

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50'}`}>
      <div className="max-w-6xl mx-auto p-3 md:p-6 pb-4 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className={`text-xl md:text-4xl font-bold mb-2 ${
              darkMode 
                ? 'bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'
            }`}>
              Qur'an Witness Mode
            </h1>
            <p className={`text-xs md:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Deep insights into your spiritual journey
            </p>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Eye className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {totalVisited}
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Ayahs Visited
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <EyeOff className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <TrendingDown className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {totalSkipped}
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Ayahs Skipped
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Heart className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {totalRevisited}
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Ayahs Revisited
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Zap className={`w-6 h-6 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              <Calendar className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {Math.round((totalRevisited / totalVisited) * 100)}%
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Engagement Rate
            </p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement Timeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={`rounded-3xl p-8 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Engagement Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userAnalytics.monthlyEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                  dataKey="month" 
                  stroke={darkMode ? '#94a3b8' : '#64748b'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={darkMode ? '#94a3b8' : '#64748b'}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: darkMode ? '#e2e8f0' : '#334155' }}
                />
                <Bar dataKey="visited" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revisited" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="skipped" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Revisited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Skipped</span>
              </div>
            </div>
          </motion.div>

          {/* Theme Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className={`rounded-3xl p-8 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Most Visited Themes
            </h2>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={themeData}
                    dataKey="count"
                    nameKey="theme"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.percentage}%`}
                  >
                    {themeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={themeColors[index % themeColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {themeData.map((theme, index) => (
                <div key={theme.theme} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: themeColors[index % themeColors.length] }}
                  />
                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {theme.theme}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Spiritual Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`rounded-3xl p-8 shadow-xl border ${
            darkMode 
              ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}
        >
          <h2 className={`text-xl mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            30-Day Spiritual Heatmap
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Visualize your engagement patterns and discover your peak reflection times
          </p>
          
          <div className="grid grid-cols-10 gap-2">
            {heatmapData.map((data) => {
              const intensity = data.engagement;
              const getColor = () => {
                if (darkMode) {
                  if (intensity > 80) return 'bg-purple-500';
                  if (intensity > 60) return 'bg-purple-600';
                  if (intensity > 40) return 'bg-purple-700';
                  if (intensity > 20) return 'bg-purple-800';
                  return 'bg-slate-700';
                } else {
                  if (intensity > 80) return 'bg-purple-500';
                  if (intensity > 60) return 'bg-purple-400';
                  if (intensity > 40) return 'bg-purple-300';
                  if (intensity > 20) return 'bg-purple-200';
                  return 'bg-slate-200';
                }
              };

              return (
                <motion.div
                  key={data.day}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + (data.day * 0.01) }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className={`aspect-square rounded-lg ${getColor()} cursor-pointer relative group`}
                  title={`Day ${data.day}: ${intensity}% engagement`}
                >
                  <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    <span className="text-xs font-medium">{data.day}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
            <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Less engaged
            </span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${
                    darkMode
                      ? ['bg-slate-700', 'bg-purple-800', 'bg-purple-700', 'bg-purple-600', 'bg-purple-500'][i]
                      : ['bg-slate-200', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500'][i]
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              More engaged
            </span>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 gap-6 mt-8"
        >
          <div className={`rounded-2xl p-6 border ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700' 
              : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
          }`}>
            <h3 className={`text-lg mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              💡 Key Insight
            </h3>
            <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
              You revisit verses about <strong>mercy</strong> 3x more often than other themes. 
              This shows a deep spiritual need for reassurance and forgiveness.
            </p>
          </div>

          <div className={`rounded-2xl p-6 border ${
            darkMode 
              ? 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-700' 
              : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
          }`}>
            <h3 className={`text-lg mb-3 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
              🎯 Recommendation
            </h3>
            <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
              You've skipped ayahs about <strong>patience</strong> recently. 
              Consider revisiting Surah Asr to strengthen this area of your spiritual growth.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
