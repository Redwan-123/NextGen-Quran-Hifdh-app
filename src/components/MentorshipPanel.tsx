import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { mentorsData, getOrCreateChatHistory, saveChatMessage } from '../data/mentorsData';
import { MessageCircle, Video, Star, Users, Send, Phone, Clock, DollarSign } from 'lucide-react';
import { Button } from './ui/button';

interface MentorshipPanelProps {
  darkMode?: boolean;
}

export function MentorshipPanel({ darkMode = false }: MentorshipPanelProps) {
  const [mentors, setMentors] = useState(() => {
    const stored = localStorage.getItem('mentors_dynamic');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.error('Failed to parse mentors cache', err);
      }
    }
    // Start empty so users add real mentors; no hardcoded fallbacks
    return [];
  });
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [newMentor, setNewMentor] = useState({ name: '', specialty: '', price: 25, rating: 4.8 });
  const userId = 'default_user'; // In a real app, this would come from auth context

  useEffect(() => {
    // Auto-select first mentor if none selected
    if (!selectedMentor && mentors.length > 0) {
      setSelectedMentor(mentors[0]);
      return;
    }

    if (!selectedMentor) {
      setChatHistory([]);
      return;
    }

    const history = getOrCreateChatHistory(userId, selectedMentor.id);
    if (history.length === 0) {
      setChatHistory([
        {
          id: '1',
          sender: 'mentor',
          text: `As-salamu alaykum! I'm ${selectedMentor.name}. I'm here to help you with ${selectedMentor.specialty}. How can I assist you today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setChatHistory(history);
    }
  }, [selectedMentor, mentors, userId]);

  // Persist mentors list when it changes
  useEffect(() => {
    localStorage.setItem('mentors_dynamic', JSON.stringify(mentors));
  }, [mentors]);

  const addMentor = () => {
    if (!newMentor.name.trim() || !newMentor.specialty.trim()) return;
    const entry = {
      id: `mentor-${Date.now()}`,
      name: newMentor.name,
      specialty: newMentor.specialty,
      available: true,
      rating: newMentor.rating,
      students: 0,
      responseTime: '1h avg',
      sessionPrice: newMentor.price,
      avatar: '🧕',
    };
    setMentors((prev) => [entry, ...prev]);
    setSelectedMentor(entry);
    setNewMentor({ name: '', specialty: '', price: 25, rating: 4.8 });
  };

  const handleSendMessage = () => {
    if (!selectedMentor) return;
    if (message.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory([...chatHistory, userMessage]);
      saveChatMessage(userId, selectedMentor.id, userMessage);
      setMessage('');

      // Simulate mentor response after a delay
      setTimeout(() => {
        const mentorResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'mentor',
          text: `Thank you for that question! That's a great area to focus on. Let me share some insights about ${userMessage.text.toLowerCase().substring(0, 30)}...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, mentorResponse]);
        saveChatMessage(userId, selectedMentor.id, mentorResponse);
      }, 1000);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50'}`}>
      <div className="max-w-7xl mx-auto px-6 pb-8">
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
                {mentors.length === 0 && (
                  <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-sm">
                    No mentors yet. Add your first mentor below to get started.
                  </div>
                )}
                {mentors.map((mentor, index) => (
                  <motion.button
                    key={mentor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedMentor(mentor)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedMentor?.id === mentor.id
                        ? 'bg-teal-50 border-teal-300 shadow-md'
                        : 'bg-white border-slate-200 hover:border-teal-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{mentor.avatar || '🧕'}</div>
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
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 text-center">Add your own mentor to track sessions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newMentor.name}
                      onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                      placeholder="Name"
                      className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                    <input
                      value={newMentor.specialty}
                      onChange={(e) => setNewMentor({ ...newMentor, specialty: e.target.value })}
                      placeholder="Specialty"
                      className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      value={newMentor.price}
                      onChange={(e) => setNewMentor({ ...newMentor, price: Number(e.target.value) })}
                      placeholder="Price"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={newMentor.rating}
                      onChange={(e) => setNewMentor({ ...newMentor, rating: Number(e.target.value) })}
                      placeholder="Rating"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                    <Button onClick={addMentor} className="col-span-2 bg-teal-600 hover:bg-teal-700 text-white w-full">Add Mentor</Button>
                  </div>
                </div>
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
              {selectedMentor ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-teal-500 to-emerald-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{selectedMentor?.avatar || '🧕'}</div>
                        <div>
                          <h2 className="text-white font-medium">{selectedMentor?.name}</h2>
                          <p className="text-sm text-white/80">{selectedMentor?.specialty}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          disabled={!selectedMentor?.available}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          disabled={!selectedMentor?.available}
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mentor Info */}
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-white text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>{selectedMentor?.rating} ({selectedMentor?.students} students)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedMentor?.responseTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>${selectedMentor?.sessionPrice}/session</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatHistory.map((msg, index) => (
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
                      <span>{selectedMentor?.name?.split(' ')[1] || 'Mentor'} is typing...</span>
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
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate-500">
                  <p className="text-lg font-semibold mb-2">No mentor selected yet</p>
                  <p className="text-sm">Add a mentor on the left to start chatting.</p>
                </div>
              )}
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
