import { motion } from 'motion/react';
import { useState } from 'react';
import { mockMentors } from '../data/mockData';
import { MessageCircle, Video, Star, Users, Send, Phone } from 'lucide-react';
import { Button } from './ui/button';

export function MentorshipPanel() {
  const [selectedMentor, setSelectedMentor] = useState(mockMentors[0]);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'mentor',
      text: "As-salamu alaykum! I've reviewed your recent practice sessions. MashAllah, great progress on Surah Al-Mulk!",
      time: '10:30 AM'
    },
    {
      id: '2',
      sender: 'user',
      text: "Wa alaykumu as-salam! JazakAllah khair. I'm struggling with the similar ayahs in Surah Al-Baqarah.",
      time: '10:32 AM'
    },
    {
      id: '3',
      sender: 'mentor',
      text: "I understand. Let's focus on the distinct endings of those verses. I'll send you a custom practice schedule.",
      time: '10:35 AM'
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now().toString(),
        sender: 'user',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Mentorship & Guidance
          </h1>
          <p className="text-slate-600">Connect with scholars for personalized Qur'an learning</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mentor List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <h2 className="text-lg text-slate-800 mb-4">Available Mentors</h2>
              
              <div className="space-y-3">
                {mockMentors.map((mentor, index) => (
                  <motion.button
                    key={mentor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedMentor(mentor)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedMentor.id === mentor.id
                        ? 'bg-teal-50 border-teal-300 shadow-md'
                        : 'bg-white border-slate-200 hover:border-teal-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{mentor.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-slate-800 truncate">
                            {mentor.name}
                          </h3>
                          {mentor.available && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{mentor.specialty}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-slate-600">{mentor.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Users className="w-3 h-3" />
                            <span>{mentor.students}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  All mentors are certified in Qur'anic sciences
                </p>
              </div>
            </motion.div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden h-[600px] flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-teal-500 to-emerald-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{selectedMentor.avatar}</div>
                    <div>
                      <h2 className="text-white font-medium">{selectedMentor.name}</h2>
                      <p className="text-sm text-white/80">{selectedMentor.specialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl p-4 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-tr-sm'
                          : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <p className={`text-xs text-slate-500 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Mentor is typing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-500 text-sm"
                >
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span>{selectedMentor.name.split(' ')[1]} is typing...</span>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-200 bg-slate-50/50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 text-slate-700"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4 mt-6"
            >
              <button className="p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white transition-all shadow-md">
                <MessageCircle className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-slate-700">Quick Question</p>
              </button>
              <button className="p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white transition-all shadow-md">
                <Video className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-slate-700">Schedule Session</p>
              </button>
              <button className="p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white transition-all shadow-md">
                <Star className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-slate-700">Leave Review</p>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
