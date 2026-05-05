import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  Users, 
  Megaphone,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import api from '../lib/apiClient';

const Announcements = () => {
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    role: 'All'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/admin/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/api/admin/notifications', formData);
      setStatus({ type: 'success', message: 'Announcement sent successfully!' });
      setFormData({ title: '', message: '', role: 'All' });
      fetchNotifications();
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send announcement' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Announcements</h1>
          <p className="text-gray-500 font-medium">Broadcast notices to the entire school or specific roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Announcement Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
            <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              New Broadcast
            </h3>

            {status && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-bold text-sm">{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Audience</label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Teacher', 'Student', 'Parent', 'Principal'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({...formData, role: r})}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        formData.role === r 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                          : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message Content</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Write your announcement here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Sending...' : 'Send Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* History / Sent Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
              <h3 className="font-bold text-gray-900">Announcement History</h3>
              <span className="text-xs font-black text-gray-400 uppercase">{notifications.length} Sent</span>
            </div>

            <div className="divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold">No announcements sent yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="p-8 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            n.role === 'All' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            To: {n.role}
                          </span>
                          <h4 className="text-lg font-black text-gray-900 mt-1">{n.title}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 font-medium leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
