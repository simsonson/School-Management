import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  ClipboardList, 
  ShieldCheck,
  Check,
  X,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Award,
  Calendar,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import api from '../lib/apiClient';

const PrincipalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/principal/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error('Principal Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleLeaveAction = async (id, status) => {
    try {
      await api.put(`/api/principal/leave/${id}`, { status });
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const stats = [
    { label: 'Total Students', value: data.studentCount, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Staff Members', value: data.teacherCount, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { label: 'Avg Attendance', value: `${data.attendanceRate}%`, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Standing', value: 'Excellent', icon: Award, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  const attendanceData = [
    { name: 'Mon', value: 92 },
    { name: 'Tue', value: 94 },
    { name: 'Wed', value: 91 },
    { name: 'Thu', value: 95 },
    { name: 'Fri', value: 93 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Principal Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">School-wide performance and administrative oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAnalytics}
            className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/principal/reports" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
            <TrendingUp className="w-4 h-4" />
            School Report
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Attendance Trend Chart */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Weekly Attendance Trend</h3>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                <ArrowUpRight className="w-4 h-4" />
                +2.4% from last week
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Requests */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Staff Leave Requests</h3>
              <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase">
                {data.leaveRequests.length} Pending
              </span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.leaveRequests.length === 0 ? (
                <div className="p-20 text-center">
                  <Check className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">All requests cleared!</p>
                </div>
              ) : (
                data.leaveRequests.map((req, i) => (
                  <div key={i} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center font-black text-xl text-indigo-600 dark:text-indigo-400">
                        {req.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-gray-900 dark:text-white">{req.user.name}</h4>
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">{req.user.role}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{req.reason}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleLeaveAction(req._id, 'Rejected')}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => handleLeaveAction(req._id, 'Approved')}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        Approve Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Insights Cards */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-200" />
                Growth Snapshot
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Student Retention</p>
                  <p className="text-2xl font-black mt-1">98.2%</p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Academic Avg</p>
                  <p className="text-2xl font-black mt-1">B+ <span className="text-xs font-medium text-indigo-200">(+0.3)</span></p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Teacher Performance */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Staff Performance</h3>
            <div className="space-y-6">
              {(data.teacherPerformance || []).slice(0, 3).map((teacher, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-sm font-black text-gray-500">
                      {teacher.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{teacher.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{teacher.marksUploaded} Entries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{teacher.avgScore ?? 0}%</p>
                  </div>
                </div>
              ))}
              {(!data.teacherPerformance || data.teacherPerformance.length === 0) && (
                <p className="text-center text-gray-400 font-bold italic py-4">No staff data available.</p>
              )}
            </div>
            <button className="w-full mt-8 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-black text-sm hover:text-indigo-600 transition-colors">
              View Detailed Report
            </button>
          </div>

          {/* Notice Board */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Upcoming Events</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <span className="text-xs font-black">15</span>
                  <span className="text-[10px] font-bold uppercase">May</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">Annual Sports Meet</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ground A • 08:00 AM</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <span className="text-xs font-black">22</span>
                  <span className="text-[10px] font-bold uppercase">May</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">PTA General Meeting</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auditorium • 04:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
