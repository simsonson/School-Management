import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  ChevronRight,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/apiClient';

const StudentDashboard = () => {
  const [data, setData] = useState({
    homework: [],
    marks: [],
    attendance: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/student/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Student Dashboard Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const attendanceRate = data.attendance.length > 0 
    ? Math.round((data.attendance.filter(a => a.status === 'Present').length / data.attendance.length) * 100)
    : 0;

  const chartData = data.marks.slice().reverse().map((m, i) => ({
    name: m.subject.charAt(0),
    score: m.score,
  }));

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header with Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Hey, {authUser?.name?.split(' ')[0] || 'there'}! <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Ready to conquer your goals today?</p>
        </div>
        <div className="flex -space-x-3 overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
          <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
            +12
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Attendance</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{attendanceRate}%</h3>
            <div className="mt-4 w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
            </div>
          </div>
          <ClipboardList className="absolute -right-4 -bottom-4 w-20 h-20 text-indigo-50 dark:text-indigo-900/10 group-hover:text-indigo-100 transition-colors" />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tasks</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{data.homework.length} Pending</h3>
            <span className="inline-block mt-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">Need attention</span>
          </div>
          <BookOpen className="absolute -right-4 -bottom-4 w-20 h-20 text-purple-50 dark:text-purple-900/10 group-hover:text-purple-100 transition-colors" />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Avg Grade</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {data.marks.length > 0 ? Math.round(data.marks.reduce((acc, curr) => acc + curr.score, 0) / data.marks.length) : 0}%
            </h3>
            <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Top 10%</span>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-20 h-20 text-emerald-50 dark:text-emerald-900/10 group-hover:text-emerald-100 transition-colors" />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Rank</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">4th Place</h3>
            <span className="inline-block mt-2 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">Rising Star</span>
          </div>
          <Award className="absolute -right-4 -bottom-4 w-20 h-20 text-yellow-50 dark:text-yellow-900/10 group-hover:text-yellow-100 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Performance Over Time</h3>
              <select className="text-xs font-black text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl border-none focus:ring-0 outline-none">
                <option>Last 5 Subjects</option>
              </select>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Upcoming Tasks</h3>
              <Link to="/student/homework" className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.homework.slice(0, 4).map((hw, i) => (
                <div key={i} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">Urgent</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{hw.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-4">{hw.subject}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500">Due {new Date(hw.dueDate).toLocaleDateString()}</span>
                    <button className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-all">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {data.homework.length === 0 && (
                <div className="col-span-2 text-center py-10 text-gray-400 font-bold italic">No pending tasks! Enjoy your day.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Notifications / Feed */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Notifications
            </h3>
            <div className="space-y-6">
              {data.notifications.map((n, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== data.notifications.length - 1 && <div className="absolute left-4 top-10 bottom-0 w-[1px] bg-gray-100"></div>}
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border-4 border-white flex items-center justify-center text-indigo-600 flex-shrink-0 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-2 uppercase">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {data.notifications.length === 0 && (
                <p className="text-center text-gray-400 text-sm font-medium">All caught up!</p>
              )}
            </div>
          </div>

          {/* Schedule Summary */}
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-200" />
                Next Class
              </h3>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">11:00 AM</p>
                <h4 className="text-xl font-black mt-1">History of Science</h4>
                <p className="text-sm font-bold text-indigo-100 mt-2">Room 204 • Prof. Miller</p>
              </div>
              <button className="w-full mt-6 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 text-sm">
                View Full Timetable
              </button>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
