import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Save,
  Calendar as CalendarIcon
} from 'lucide-react';
import api from '../lib/apiClient';

const AttendanceManagement = () => {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/api/teacher/students');
        setStudents(res.data.data);
        
        // Initialize attendance state
        const initialData = {};
        res.data.data.forEach(s => {
          initialData[s._id] = 'Present';
        });
        setAttendanceData(initialData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData({ ...attendanceData, [studentId]: status });
  };

  const submitAttendance = async () => {
    try {
      const promises = Object.entries(attendanceData).map(([studentId, status]) => {
        return api.post('/api/teacher/attendance', {
          studentId,
          status,
          date,
          className: 'Grade 10-A' // Mock class
        });
      });

      await Promise.all(promises);
      setStatus({ type: 'success', message: 'Attendance marked successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to mark attendance' });
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500">Mark daily attendance for your classes.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <CalendarIcon className="w-5 h-5 text-gray-400 ml-2" />
          <input 
            type="date" 
            className="outline-none text-sm font-bold text-gray-700 p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={submitAttendance}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="2" className="px-6 py-10 text-center text-gray-500">Loading students...</td></tr>
              ) : filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">ID: {student._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {['Present', 'Absent', 'Late'].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(student._id, s)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            attendanceData[student._id] === s
                              ? s === 'Present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' :
                                s === 'Absent' ? 'bg-red-600 text-white shadow-lg shadow-red-100' :
                                'bg-orange-500 text-white shadow-lg shadow-orange-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {status && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${
          status.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-bold">{status.message}</span>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
