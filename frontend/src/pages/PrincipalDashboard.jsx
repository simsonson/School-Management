import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  ClipboardList, 
  ShieldCheck,
  Check,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../lib/apiClient';

const PrincipalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/principal/analytics');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleLeaveAction = async (id, status) => {
    try {
      await api.put(`/api/principal/leave/${id}`, { status });
      // Refresh data
      const res = await api.get('/api/principal/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading Analytics...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Principal's Overview</h1>
          <p className="text-gray-500">School-wide analytics and approvals.</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400">Total Students</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.studentCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400">Total Teachers</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.teacherCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Target: 95%</span>
          </div>
          <p className="text-sm font-medium text-gray-400">Avg. Attendance</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.attendanceRate}%</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400">Academic Standing</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">Excellent</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Pending Leave Requests</h3>
            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded-lg">
              {data.leaveRequests.length} Pending
            </span>
          </div>
          <div className="p-6 space-y-4">
            {data.leaveRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending requests to approve.</p>
            ) : (
              data.leaveRequests.map((req, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm border border-gray-100">
                      {req.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{req.user.name}</p>
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">{req.user.role}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{req.reason}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleLeaveAction(req._id, 'Rejected')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleLeaveAction(req._id, 'Approved')}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-6">School Insights</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-2 text-emerald-700">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold text-sm">Attendance Spike</span>
              </div>
              <p className="text-xs text-emerald-600">Student attendance increased by 4% this month across all grades.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-2">Top Students</p>
              {(data.topStudents || []).map((student) => (
                <div key={student.studentId} className="flex justify-between text-xs py-1">
                  <span className="text-gray-700">{student.name}</span>
                  <span className="font-bold text-emerald-600">{student.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-2">Bottom Students</p>
              {(data.bottomStudents || []).map((student) => (
                <div key={student.studentId} className="flex justify-between text-xs py-1">
                  <span className="text-gray-700">{student.name}</span>
                  <span className="font-bold text-red-600">{student.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-2 text-indigo-700">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-sm">Exam Season</span>
              </div>
              <p className="text-xs text-indigo-600">Midterm examinations are scheduled to start in 12 days. Preparation underway.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500">Teacher Performance (by marks upload)</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              {(data.teacherPerformance || []).map((teacher) => (
                <p key={teacher.teacherId} className="text-xs text-gray-600">
                  {teacher.name || 'Unknown'} - {teacher.marksUploaded} uploads - Avg {teacher.avgScore ?? 0}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
