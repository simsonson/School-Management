import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  BookOpen, 
  TrendingUp, 
  CreditCard,
  Calendar,
  Bell,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import api from '../lib/apiClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    feeCollection: {
      paidFees: 0,
      unpaidFees: 0
    },
    attendanceRate: '0.00'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Admin Dashboard Error:', err);
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

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Active Teachers', value: stats.totalTeachers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { label: 'Classes', value: stats.totalClasses, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Attendance', value: `${stats.attendanceRate}%`, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  // Mock fee collection trend for visualization
  const feeTrendData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 },
    { month: 'Jun', amount: 67000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Admin Console</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Enterprise management for institutional excellence.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/reports" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none font-black text-sm hover:bg-indigo-700 transition-all active:scale-95">
            Generate School Report
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
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
        {/* Fee Collection Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Financial Trend</h3>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                Paid: {stats.feeCollection.paidFees}
              </span>
              <span className="flex items-center gap-2 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                Unpaid: {stats.feeCollection.unpaidFees}
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" strokeOpacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Quick Management</h3>
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 flex-1">
            <Link to="/admin/students" className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-600 transition-all border border-transparent hover:border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-white transition-colors">Add Student</p>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-100 transition-colors">Individual or Bulk</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/admin/parents" className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-600 transition-all border border-transparent hover:border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-white transition-colors">Parents</p>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-100 transition-colors">Manage links</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/admin/principals" className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-rose-600 transition-all border border-transparent hover:border-rose-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-rose-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-white transition-colors">Principal</p>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-rose-100 transition-colors">Manage Leadership</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/admin/timetable" className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-cyan-600 transition-all border border-transparent hover:border-cyan-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-cyan-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-white transition-colors">Timetable</p>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-cyan-100 transition-colors">Master Schedule</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/admin/announcements" className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-600 transition-all border border-transparent hover:border-purple-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-white transition-colors">Broadcast</p>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-purple-100 transition-colors">Send notices</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/admin/fees" className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-600 transition-all border border-transparent hover:border-orange-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-orange-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-white transition-colors">Finance</p>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-orange-100 transition-colors">Fees & Revenue</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
