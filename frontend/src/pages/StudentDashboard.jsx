import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../lib/apiClient';

const StudentDashboard = () => {
  const [data, setData] = useState({
    homework: [],
    marks: [],
    attendance: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/student/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading Dashboard...</div>;

  const attendanceRate = data.attendance.length > 0 
    ? (data.attendance.filter(a => a.status === 'Present').length / data.attendance.length * 100).toFixed(0) 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Academic Overview</h1>
          <p className="text-gray-500">Track your progress, assignments, and attendance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <ClipboardList className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-400">Attendance Rate</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{attendanceRate}%</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-400">Active Assignments</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.homework.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-400">Avg. Grade</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">A-</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-400">New Notices</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.notifications.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Marks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Exam Marks</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="p-6 space-y-4">
            {data.marks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No marks uploaded yet.</p>
            ) : (
              data.marks.map((mark, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">{mark.subject}</p>
                    <p className="text-xs text-gray-500">{mark.examName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{mark.score} / {mark.totalMarks}</p>
                    <p className="text-xs text-gray-400">{new Date(mark.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Homework */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Upcoming Assignments</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="p-6 space-y-4">
            {data.homework.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending assignments.</p>
            ) : (
              data.homework.map((hw, i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-200 transition-all">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{hw.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{hw.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                        {hw.subject}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Attendance Status (Detailed)</h3>
        </div>
        <div className="p-6">
          {data.attendance.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No attendance records available.</p>
          ) : (
            <div className="space-y-3">
              {data.attendance.map((entry) => (
                <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm text-gray-700">{new Date(entry.date).toLocaleDateString()}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    entry.status === 'Present'
                      ? 'bg-emerald-100 text-emerald-700'
                      : entry.status === 'Absent'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
