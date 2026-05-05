import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../lib/apiClient';

const AssignHomework = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/teacher/classes')
      .then((res) => setClasses(res.data.data || []))
      .catch(() => setClasses([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/api/teacher/homework', formData);
      setStatus({ type: 'success', message: 'Homework assigned successfully!' });
      setTimeout(() => navigate('/teacher'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to assign homework' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-indigo-50/30">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Assign New Homework
          </h1>
          <p className="text-gray-500 mt-1">Create a new task for your students to complete.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {status && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{status.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Mathematics"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Class</label>
              <select
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls.value}>
                    {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Homework Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Quadratic Equations Exercise 4.2"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description / Instructions</label>
            <textarea
              required
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="Provide detailed instructions for the students..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all"
            >
              {loading ? 'Assigning...' : 'Assign Homework'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignHomework;
