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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Timetable</h1>
        <p className="text-gray-500 dark:text-gray-400">Weekly class schedule with period timings.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Weekly Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weekDays.map((day) => (
            <div key={day} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/30">
              <p className="font-semibold text-gray-800 dark:text-gray-200">{day}</p>
              {grouped[day]?.length ? (
                <div className="mt-3 space-y-2">
                  {grouped[day].map((period, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-sm font-black text-gray-900 dark:text-white">{period.subject}</p>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase">{period.startTime} - {period.endTime}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 font-bold uppercase">No classes scheduled.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
