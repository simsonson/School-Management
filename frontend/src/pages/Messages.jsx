import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  User as UserIcon,
  Check,
  CheckCheck,
  Plus,
  X
} from 'lucide-react';
import api from '../lib/apiClient';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/messages/conversations');
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await api.get('/api/messages/contacts');
      setContacts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  // Fetch messages with selected user
  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/api/messages/${userId}`);
      setMessages(res.data.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, []);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      pollRef.current = setInterval(() => {
        fetchMessages(selectedUser._id);
        fetchConversations();
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sendingMsg) return;

    setSendingMsg(true);
    try {
      await api.post('/api/messages', {
        receiverId: selectedUser._id,
        content: newMessage.trim(),
      });
      setNewMessage('');
      fetchMessages(selectedUser._id);
      fetchConversations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setShowContacts(false);
  };

  const startNewChat = (contact) => {
    setSelectedUser(contact);
    setShowContacts(false);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {/* Sidebar - Conversations */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-100 dark:border-gray-800`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
              Messages
            </h2>
            <button
              onClick={() => { setShowContacts(true); fetchContacts(); }}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">No conversations yet</p>
              <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Start a new chat with the + button</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user._id}
                onClick={() => selectUser(conv.user)}
                className={`w-full flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-left border-b border-gray-50 dark:border-gray-800 ${
                  selectedUser?._id === conv.user._id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-600' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg flex-shrink-0">
                  {conv.user.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{conv.user.name}</p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex-shrink-0 ml-2">
                      {formatTime(conv.lastDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 min-w-[20px] h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase">{conv.user.role}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-4 bg-white dark:bg-gray-900">
              <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                {selectedUser.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-xs text-indigo-500 font-bold uppercase">{selectedUser.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-950/50">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-sm font-bold">No messages yet</p>
                  <p className="text-gray-300 text-xs mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender?._id === currentUser?.id || msg.sender?._id === currentUser?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-700'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-2 ${isMine ? 'justify-end' : ''}`}>
                          <span className={`text-[10px] ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMine && (
                            msg.isRead
                              ? <CheckCheck className="w-3 h-3 text-indigo-200" />
                              : <Check className="w-3 h-3 text-indigo-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMsg}
                  className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Select a conversation</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Choose from the sidebar or start a new chat</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showContacts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Start New Chat</h3>
              <button onClick={() => setShowContacts(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1">
                {filteredContacts.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No contacts found</p>
                ) : (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact._id}
                      onClick={() => startNewChat(contact)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        {contact.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-xs text-gray-400">{contact.email} • <span className="text-indigo-500 uppercase font-bold">{contact.role}</span></p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
