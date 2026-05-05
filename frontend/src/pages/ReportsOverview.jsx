import React, { useEffect, useState } from 'react';
import api from '../lib/apiClient';

const ReportsOverview = ({ role }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = role === 'Admin' ? '/api/admin/reports/overview' : '/api/principal/reports/overview';
    api.get(endpoint)
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [role]);

  const exportCsv = () => {
    if (!data) return;
    const lines = Object.entries(data).map(([k, v]) => `${k},${v}`);
    const blob = new Blob([`metric,value\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${role.toLowerCase()}-report-overview.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role} Reports</h1>
          <p className="text-gray-500">Overview metrics and quick export.</p>
        </div>
        <button onClick={exportCsv} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">
          Export CSV
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {loading ? (
          <p className="text-gray-500">Loading report data...</p>
        ) : !data ? (
          <p className="text-gray-500">No report data available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs text-gray-400">{k}</p>
                <p className="font-bold text-gray-900">{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsOverview;
