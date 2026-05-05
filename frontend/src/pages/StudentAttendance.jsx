import React, { useEffect, useState } from 'react';
import api from '../lib/apiClient';

const StudentAttendance = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/attendance')
      .then((res) => {
        setRows(res.data.data || []);
        setSummary(res.data.summary || summary);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
        <p className="text-gray-500 dark:text-gray-400">Clear attendance status and summary.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          ['Total', summary.total],
          ['Present', summary.present],
          ['Absent', summary.absent],
          ['Late', summary.late],
          ['Excused', summary.excused],
          ['Rate', `${summary.rate}%`],
        ].map(([k, v]) => (
          <div key={k} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-400 dark:text-gray-500">{k}</p>
            <p className="font-bold text-gray-800 dark:text-white">{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-2">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading attendance...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No attendance entries.</p>
        ) : (
          rows.map((r) => (
            <div key={r._id} className="flex justify-between items-center rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">{new Date(r.date).toLocaleDateString()}</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{r.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
