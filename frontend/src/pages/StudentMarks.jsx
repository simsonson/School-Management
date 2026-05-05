import React, { useEffect, useState } from 'react';
import api from '../lib/apiClient';

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/marks')
      .then((res) => setMarks(res.data.data || []))
      .catch(() => setMarks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Marks</h1>
        <p className="text-gray-500 dark:text-gray-400">Detailed subject-wise exam performance.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td className="px-6 py-8 text-gray-500 dark:text-gray-400" colSpan={4}>Loading marks...</td></tr>
              ) : marks.length === 0 ? (
                <tr><td className="px-6 py-8 text-gray-500 dark:text-gray-400" colSpan={4}>No marks available.</td></tr>
              ) : (
                marks.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{m.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{m.examName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{m.score}/{m.totalMarks}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{new Date(m.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentMarks;
