import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import api from '../lib/apiClient';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentTimetable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/timetable')
      .then((res) => setRows(res.data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      map[row.day] = row.periods || [];
    });
    return map;
  }, [rows]);

  if (loading) return <div className="text-gray-500">Loading timetable...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
        <p className="text-gray-500">Weekly class schedule with period timings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Weekly Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weekDays.map((day) => (
            <div key={day} className="rounded-xl border border-gray-100 p-4">
              <p className="font-semibold text-gray-800">{day}</p>
              {grouped[day]?.length ? (
                <div className="mt-3 space-y-2">
                  {grouped[day].map((period, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{period.subject}</p>
                      <p className="text-xs text-gray-500">{period.startTime} - {period.endTime}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">No classes scheduled.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
