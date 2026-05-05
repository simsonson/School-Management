import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Plus, Save } from 'lucide-react';
import api from '../lib/apiClient';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TeacherTimetable = () => {
  const [classes, setClasses] = useState([]);
  const [timetableRows, setTimetableRows] = useState([]);
  const [form, setForm] = useState({
    className: '',
    day: 'Monday',
    periods: [{ subject: '', startTime: '', endTime: '' }],
  });
  const [message, setMessage] = useState('');

  const fetchClasses = async () => {
    const res = await api.get('/api/teacher/classes');
    setClasses(res.data.data || []);
    if (!form.className && res.data.data?.length > 0) {
      setForm((prev) => ({ ...prev, className: res.data.data[0].value }));
    }
  };

  const fetchTimetable = async (className) => {
    if (!className) return;
    const res = await api.get('/api/teacher/timetable', { params: { className } });
    setTimetableRows(res.data.data || []);
  };

  useEffect(() => {
    fetchClasses().catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    fetchTimetable(form.className).catch(() => setTimetableRows([]));
  }, [form.className]);

  const dayMap = useMemo(() => {
    const map = {};
    timetableRows.forEach((row) => {
      map[row.day] = row.periods || [];
    });
    return map;
  }, [timetableRows]);

  const addPeriod = () => {
    setForm((prev) => ({
      ...prev,
      periods: [...prev.periods, { subject: '', startTime: '', endTime: '' }],
    }));
  };

  const updatePeriod = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      periods: prev.periods.map((period, index) => (index === idx ? { ...period, [key]: value } : period)),
    }));
  };

  const saveTimetable = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/api/teacher/timetable', form);
      setMessage('Timetable saved successfully.');
      await fetchTimetable(form.className);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to save timetable.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timetable Allocation</h1>
        <p className="text-gray-500">Create and manage weekly class timetable for students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={saveTimetable} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                value={form.className}
                onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}
              >
                {classes.map((item) => (
                  <option key={item._id} value={item.value}>
                    {item.name}{item.section ? ` - ${item.section}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Day</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                value={form.day}
                onChange={(e) => setForm((prev) => ({ ...prev, day: e.target.value }))}
              >
                {weekDays.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
          </div>

          {form.periods.map((period, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input
                placeholder="Subject"
                className="border border-gray-200 rounded-xl px-3 py-2"
                value={period.subject}
                onChange={(e) => updatePeriod(idx, 'subject', e.target.value)}
                required
              />
              <input
                type="time"
                className="border border-gray-200 rounded-xl px-3 py-2"
                value={period.startTime}
                onChange={(e) => updatePeriod(idx, 'startTime', e.target.value)}
                required
              />
              <input
                type="time"
                className="border border-gray-200 rounded-xl px-3 py-2"
                value={period.endTime}
                onChange={(e) => updatePeriod(idx, 'endTime', e.target.value)}
                required
              />
            </div>
          ))}

          <div className="flex gap-3">
            <button type="button" onClick={addPeriod} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200">
              <Plus className="w-4 h-4" /> Add Period
            </button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white">
              <Save className="w-4 h-4" /> Save Timetable
            </button>
          </div>
          {message && <p className="text-sm text-indigo-600">{message}</p>}
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Current Weekly Plan</h2>
          <div className="space-y-4">
            {weekDays.map((day) => (
              <div key={day} className="border border-gray-100 rounded-xl p-3">
                <p className="font-semibold text-gray-800">{day}</p>
                {dayMap[day]?.length ? (
                  <div className="mt-2 space-y-2">
                    {dayMap[day].map((period, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex justify-between">
                        <span>{period.subject}</span>
                        <span>{period.startTime} - {period.endTime}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">No periods allocated.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetable;
