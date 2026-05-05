import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  Clock,
  PlusCircle,
  FileText,
  Calendar,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  AlertCircle
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
  Cell
} from 'recharts';
import api from '../lib/apiClient';

const TeacherDashboard = () => {
  const [dashboard, setDashboard] = useState({
    homeworkCount: 0,
    studentCount: 0,
    attendanceMarkedToday: 0,
    marksUploaded: 0,
    recentHomework: [],
    classesToday: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await api.get('/api/teacher/dashboard');
        setDashboard(dashboardRes.data.data);
      } catch (err) {
        console.error('Teacher Dashboard Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const stats = [
    { label: 'Homeworks', value: dashboard.homeworkCount, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Students', value: dashboard.studentCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Grades Uploaded', value: dashboard.marksUploaded, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Attendance', value: dashboard.attendanceMarkedToday > 0 ? 'Marked' : 'Pending', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Teacher Console</h1>
          <p className="text-gray-500 font-medium mt-1">Ready to inspire some minds today?</p>
        </div>
        <div className="flex gap-3">
          <Link to="/teacher/homework" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <PlusCircle className="w-4 h-4" />
            Post Assignment
          </Link>
          <Link to="/teacher/attendance" className="flex items-center gap-2 bg-white border border-gray-100 text-gray-700 px-5 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all active:scale-95">
            <ClipboardList className="w-4 h-4" />
            Mark Attendance
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Schedule / Classes Today */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900">Today's Schedule</h3>
              <Calendar className="w-5 h-5 text-gray-300" />
            </div>
            <div className="space-y-4">
              {dashboard.classesToday.length > 0 ? dashboard.classesToday.map((item, i) => (
                <div key={i} className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-2xl hover:bg-indigo-50/50 transition-colors cursor-default border border-transparent hover:border-indigo-100">
                  <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <span className="text-xs font-black text-indigo-600 uppercase">Room</span>
                    <span className="text-xl font-black text-gray-900">102</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-gray-900">Mathematics</h4>
                    <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      09:00 AM - 10:00 AM
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase">Grade 10A</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold">No classes scheduled for today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Gradebook Preview */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900">Academic Overview</h3>
              <TrendingUp className="w-5 h-5 text-gray-300" />
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: '10A', score: 85}, {name: '9B', score: 78}, {name: '11C', score: 92}]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {[0,1,2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#6366f1' : '#e0e7ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-6 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-gray-600">88% Average Class Attendance</span>
              </div>
              <Link to="/teacher/marks" className="text-sm font-black text-indigo-600 hover:underline flex items-center gap-1">
                Open Gradebook
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Assignments / Homework */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-8">Active Assignments</h3>
            <div className="space-y-6">
              {dashboard.recentHomework.length > 0 ? dashboard.recentHomework.map((hw, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{hw.title}</h4>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase">{hw.subject} • {hw.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-900">Due {new Date(hw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <div className="mt-1 h-1 w-20 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[65%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 font-bold py-4 italic">No assignments posted yet.</p>
              )}
            </div>
            <Link to="/teacher/homework" className="block w-full text-center mt-8 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-black hover:border-indigo-400 hover:text-indigo-600 transition-all">
              View All Tasks
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-300" />
                Staff Notice
              </h3>
              <p className="text-sm font-bold text-indigo-100 leading-relaxed">
                Departmental meeting at 03:00 PM today in the Staff Lounge regarding the upcoming Final Exams.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Urgent</span>
                <span className="text-[10px] font-black text-indigo-300/50">Admin Office</span>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
