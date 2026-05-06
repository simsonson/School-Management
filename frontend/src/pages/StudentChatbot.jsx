import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  BookOpen,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Zap,
  ChevronDown
} from 'lucide-react';
import api from '../lib/apiClient';

const StudentChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch subjects
    api.get('/api/chatbot/subjects')
      .then((res) => setSubjects(res.data.data || []))
      .catch(() => {});

    // Welcome message
    setMessages([
      {
        role: 'bot',
        content: `👋 **Hello! I'm your EduManage Study Buddy!**\n\nI'm here to help you learn and understand your school subjects better. I can explain concepts in:\n\n📐 **Mathematics** — Algebra, Geometry, Trigonometry, Statistics\n🔬 **Science** — Physics, Chemistry, Biology\n📚 **English** — Grammar, Writing, Literature\n📖 **Hindi** — व्याकरण, साहित्य\n🌍 **Social Studies** — History, Geography, Civics\n\nJust type your question or select a subject to get started! 🚀`,
        suggestions: ['mathematics', 'science', 'english', 'hindi', 'social studies'],
        timestamp: new Date(),
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chatbot/message', {
        message: text.trim(),
        subject: selectedSubject,
      });

      const data = res.data.data;

      if (data.detectedSubject) {
        setSelectedSubject(data.detectedSubject);
      }

      const botMsg = {
        role: 'bot',
        content: data.reply,
        suggestions: data.suggestions || [],
        topic: data.topic,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: "Sorry, I couldn't process that. Please try again!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const selectSubject = (subjectKey) => {
    setSelectedSubject(subjectKey);
    setShowSubjectPicker(false);
    sendMessage(subjectKey);
  };

  const renderContent = (content) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold
      let rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (rendered.startsWith('• ') || rendered.startsWith('- ')) {
        rendered = `<span class="inline-block ml-2">${rendered}</span>`;
      }
      // Table rows
      if (rendered.startsWith('|') && rendered.endsWith('|')) {
        return null; // Skip table rendering in simple mode
      }
      return (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: rendered || '&nbsp;' }} />
      );
    });
  };

  const getSubjectIcon = (key) => {
    const icons = { mathematics: '📐', science: '🔬', english: '📚', hindi: '📖', 'social studies': '🌍' };
    return icons[key] || '📚';
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                Study Buddy
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </h2>
              <p className="text-indigo-200 text-sm font-medium">Your AI Learning Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedSubject && (
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                {getSubjectIcon(selectedSubject)} {subjects.find(s => s.key === selectedSubject)?.name || selectedSubject}
              </span>
            )}
            <button
              onClick={() => setShowSubjectPicker(!showSubjectPicker)}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/20 hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Subjects
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Background pattern */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-1/3 translate-y-1/2 w-32 h-32 bg-purple-300/10 rounded-full blur-xl"></div>

        {/* Subject Picker Dropdown */}
        {showSubjectPicker && (
          <div className="absolute top-full right-6 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-20 w-72 overflow-hidden">
            <div className="p-3">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">Select a Subject</p>
              {subjects.map((subject) => (
                <button
                  key={subject.key}
                  onClick={() => selectSubject(subject.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    selectedSubject === subject.key
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-2xl">{subject.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{subject.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{subject.topicCount} topics</p>
                  </div>
                </button>
              ))}
              {selectedSubject && (
                <button
                  onClick={() => { setSelectedSubject(null); setShowSubjectPicker(false); }}
                  className="w-full p-2 text-center text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mt-1 transition-all"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            {msg.role === 'bot' && (
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? '' : ''}`}>
              <div className={`p-5 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-100 dark:border-gray-700'
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {renderContent(msg.content)}
                </div>
                {msg.topic && (
                  <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-gray-700">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Topic: {msg.topic}
                    </span>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.suggestions.map((sug, j) => (
                    <button
                      key={j}
                      onClick={() => handleSuggestionClick(sug)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 shadow-sm"
                    >
                      <Zap className="w-3 h-3" />
                      {sug.charAt(0).toUpperCase() + sug.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              <span className={`text-[10px] mt-1.5 block ${
                msg.role === 'user' ? 'text-right text-gray-400' : 'text-gray-300 dark:text-gray-600'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 ml-3 mt-1 font-bold">
                You
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl rounded-bl-md border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-400 font-medium ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Topics */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2 bg-gray-50/50 dark:bg-gray-950/30">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Quick Start</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {subjects.slice(0, 5).map((subject) => (
              <button
                key={subject.key}
                onClick={() => selectSubject(subject.key)}
                className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all text-left group"
              >
                <span className="text-xl">{subject.icon}</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{subject.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={selectedSubject ? `Ask about ${subjects.find(s => s.key === selectedSubject)?.name || selectedSubject}...` : 'Ask me anything about your subjects...'}
            className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 mt-2 font-medium">
          Study Buddy helps you learn — answers are generated from course content
        </p>
      </form>
    </div>
  );
};

export default StudentChatbot;
