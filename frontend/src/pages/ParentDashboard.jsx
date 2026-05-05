import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  ClipboardList, 
  CreditCard,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../lib/apiClient';

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const res = await api.get('/api/parent/child-data');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading Child Data...</div>;
  if (!data) return <div className="text-center p-10 text-gray-500">No child linked to this account.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
            {data.student.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.student.name}'s Progress</h1>
            <p className="text-gray-500">Parent Portal Overview</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-400">Class</p>
          <p className="text-lg font-bold text-indigo-600">Grade 10-A</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">92%</span>
          </div>
          <p className="text-sm font-medium text-gray-400">Total Attendance</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">Excellent</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Rank: 4th</span>
          </div>
          <p className="text-sm font-medium text-gray-400">Academic Performance</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">Good Progress</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            {data.fees.some(f => f.status === 'Unpaid') ? (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Pending</span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Cleared</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-400">Fees Status</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {data.fees.length > 0 ? `${data.fees.filter(f => f.status === 'Unpaid').length} Invoice(s)` : 'No Fees Due'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Child's Marks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Latest Grades</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">Full Report</button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.marks.slice(0, 5).map((mark, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{mark.subject}</p>
                      <p className="text-xs text-gray-400">{mark.examName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{mark.score}%</p>
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${mark.score}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fees Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">Fees Overview</h3>
          <div className="space-y-4">
            {data.fees.map((fee, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{fee.type} Fee</p>
                    <p className="text-xs text-gray-400">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${fee.amount}</p>
                  <p className={`text-[10px] font-bold uppercase ${fee.status === 'Paid' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {fee.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Pay Online
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
