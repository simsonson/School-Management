import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  Clock,
  PlusCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/apiClient';

const TeacherDashboard = () => {
  const [dashboard, setDashboard] = useState({
    homeworkCount: 0,
    studentCount: 0,
    attendanceMarkedToday: 0,
    marksUploaded: 0,
    recentHomework: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await api.get('/api/teacher/dashboard');
        setDashboard(dashboardRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'My Homeworks', value: dashboard.homeworkCount, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Students', value: dashboard.studentCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Marks Uploaded', value: dashboard.marksUploaded, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Attendance Today', value: dashboard.attendanceMarkedToday, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Central</h1>
          <p className="text-gray-500">Manage your classes, assignments, and grades.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/teacher/homework" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg">
            <PlusCircle className="w-4 h-4" />
            New Homework
          </Link>
          <Link to="/teacher/marks" className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all shadow-sm">
            <FileText className="w-4 h-4" />
            Update Marks
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/teacher/attendance" className="p-4 text-left rounded-xl bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group block">
              <div className="p-2 bg-white rounded-lg w-fit mb-3 shadow-sm group-hover:text-indigo-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-900 block">Mark Attendance</span>
              <span className="text-xs text-gray-500">Today's Class 10A</span>
            </Link>
            <Link to="/teacher/marks" className="p-4 text-left rounded-xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group block">
              <div className="p-2 bg-white rounded-lg w-fit mb-3 shadow-sm group-hover:text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-900 block">Class Progress</span>
              <span className="text-xs text-gray-500">View performance trends</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Recent Homeworks</h3>
          <div className="space-y-4">
            {dashboard.homeworkCount === 0 ? (
              <p className="text-gray-500 text-center py-4">No homework assigned yet.</p>
            ) : (
              <>
                <p className="text-indigo-600 font-medium">Active assignments ({dashboard.homeworkCount})</p>
                {dashboard.recentHomework.map((hw) => (
                  <div key={hw._id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{hw.title}</p>
                    <p className="text-xs text-gray-500">{hw.subject} - {hw.class}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
