import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  ClipboardList, 
  CreditCard,
  TrendingUp,
  AlertCircle,
  Calendar,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import api from '../lib/apiClient';

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        const [dataRes, performanceRes] = await Promise.all([
          api.get('/api/parent/child-data'),
          api.get('/api/parent/performance')
        ]);
        setData(dataRes.data.data);
        setPerformance(performanceRes.data.data);
      } catch (err) {
        console.error('Parent Dashboard Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParentData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!data) return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <User className="w-10 h-10 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Child Linked</h3>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Please contact the school administration to link your child's profile to your account.</p>
    </div>
  );

  const attendanceRate = data.attendance.length > 0 
    ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/30">
              {data.student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{data.student.name}'s Portal</h1>
              <div className="flex items-center gap-3 mt-2 text-indigo-100 font-medium">
                <span className="bg-white/10 px-3 py-0.5 rounded-full text-xs border border-white/20 uppercase tracking-wider">
                  {data.student.className || 'Grade 10-A'}
                </span>
                <span>•</span>
                <span>ID: {data.student.id?.slice(-6) || 'STU992'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/parent/messages')}
              className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Teacher
            </button>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Attendance</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{attendanceRate}%</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:rotate-12 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Average Grade</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {performance?.length > 0 ? Math.round(performance.reduce((acc, curr) => acc + curr.avgScore, 0) / performance.length) : 0}%
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:rotate-12 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Fees Due</p>
            <h3 className="text-2xl font-black text-red-600 dark:text-red-400">
              ${data.fees.filter(f => f.status === 'Unpaid').reduce((acc, curr) => acc + curr.amount, 0)}
            </h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl group-hover:rotate-12 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Academic Progress</h3>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase">Subject Wise</div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance?.map(p => ({ subject: p._id, score: Math.round(p.avgScore) })) || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Marks List */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Latest Exam Results</h3>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.marks.slice(0, 5).map((mark, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{mark.subject}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tighter">{mark.examName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-black text-lg ${mark.score >= 80 ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {mark.score}/{mark.totalMarks}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{new Date(mark.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {data.marks.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm font-medium">No exam results recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Fees Widget */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Recent Fees
            </h3>
            <div className="space-y-4">
              {data.fees.map((fee, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 transition-all">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{fee.type}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">${fee.amount}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      fee.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    }`}>
                      {fee.status}
                    </span>
                  </div>
                </div>
              ))}
              {data.fees.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm italic">No fee records found.</div>
              )}
            </div>
            <button className="w-full mt-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
              Pay All Pending
            </button>
          </div>

          {/* Quick Notice */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-200" />
              School Notices
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs font-bold leading-tight">Annual Sports Day postponed to May 25th due to weather.</p>
                <p className="text-[10px] text-white/50 mt-1">2 hours ago</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs font-bold leading-tight">Parent-Teacher conference scheduled for this Friday.</p>
                <p className="text-[10px] text-white/50 mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
