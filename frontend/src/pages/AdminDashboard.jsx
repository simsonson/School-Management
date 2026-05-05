import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  School, 
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import api from '../lib/apiClient';

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStatsData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Students', value: statsData.totalStudents, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Teachers', value: statsData.totalTeachers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Parents', value: statsData.totalParents, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Avg Attendance', value: `${statsData.attendanceRate || 0}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, Admin!</h1>
          <p className="text-gray-500">Here's what's happening in your school today.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +2.5%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Registrations</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'John Doe', class: 'Grade 10-A', date: '2 hours ago', status: 'Active' },
                  { name: 'Sarah Smith', class: 'Grade 8-B', date: '5 hours ago', status: 'Pending' },
                  { name: 'Mike Ross', class: 'Grade 12-C', date: 'Yesterday', status: 'Active' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {row.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        row.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Notices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-6">Upcoming Events</h3>
          <div className="space-y-6">
            {[
              { title: 'Annual Sports Meet', date: 'May 15, 2026', type: 'Event' },
              { title: 'Parent-Teacher Meeting', date: 'May 20, 2026', type: 'Meeting' },
              { title: 'Final Exams Start', date: 'June 01, 2026', type: 'Academic' },
            ].map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{event.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{event.date} • {event.type}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-all">
            + Add New Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
