import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Trash2, 
  Plus,
  Users,
  BookOpen,
  Upload
} from 'lucide-react';
import Papa from 'papaparse';
import api from '../lib/apiClient';

const UpdateMarks = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examData, setExamData] = useState({
    subject: '',
    examName: '',
    totalMarks: '100',
  });
  const [marks, setMarks] = useState({}); // { studentId: score }
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [classRes] = await Promise.all([
          api.get('/api/teacher/classes'),
        ]);
        setClasses(classRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudentsByClass = async () => {
        setFetching(true);
        try {
          const res = await api.get(`/api/teacher/students?className=${selectedClass}`);
          // Filter students locally if the API doesn't support class filtering yet
          const filtered = res.data.data.filter(s => s.className === selectedClass);
          setStudents(filtered);
          // Initialize marks state
          const initialMarks = {};
          filtered.forEach(s => {
            initialMarks[s._id] = '';
          });
          setMarks(initialMarks);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchStudentsByClass();
    }
  }, [selectedClass]);

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newMarks = { ...marks };
        results.data.forEach(row => {
          const student = students.find(s => 
            s.email === row.email || s.name === row.name
          );
          if (student && row.marks) {
            newMarks[student._id] = row.marks;
          }
        });
        setMarks(newMarks);
        setStatus({ type: 'success', message: 'Marks imported from CSV. Review and save.' });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !examData.subject || !examData.examName) {
      setStatus({ type: 'error', message: 'Please fill in all exam details.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        subject: examData.subject,
        examName: examData.examName,
        totalMarks: parseInt(examData.totalMarks),
        marks: Object.keys(marks)
          .filter(id => marks[id] !== '')
          .map(id => ({
            studentId: id,
            score: parseInt(marks[id])
          }))
      };

      if (payload.marks.length === 0) {
        setStatus({ type: 'error', message: 'Please enter marks for at least one student.' });
        setLoading(false);
        return;
      }

      await api.post('/api/teacher/marks/bulk', payload);
      setStatus({ type: 'success', message: `Successfully saved marks for ${payload.marks.length} students!` });
      // Reset marks but keep exam data for next class if needed
      const resetMarks = {};
      students.forEach(s => resetMarks[s._id] = '');
      setMarks(resetMarks);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to save marks' });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Digital Gradebook</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Record and manage academic marks in bulk.</p>
        </div>
        <label className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <Upload className="w-4 h-4" />
          Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Exam Configuration Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Exam Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Class</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c.value}>{c.value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Subject</label>
                <input 
                  type="text"
                  placeholder="e.g. Mathematics"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  value={examData.subject}
                  onChange={(e) => setExamData({...examData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Exam Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Midterm 2026"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  value={examData.examName}
                  onChange={(e) => setExamData({...examData, examName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Total Marks</label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  value={examData.totalMarks}
                  onChange={(e) => setExamData({...examData, totalMarks: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">
                Enter marks for each student in the list. Empty fields will be ignored.
              </p>
            </div>
          </div>
        </div>

        {/* Gradebook Spreadsheet */}
        <div className="lg:col-span-3 space-y-6">
          {status && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold text-sm">{status.message}</span>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {fetching && <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>}
              </div>
              <button 
                onClick={handleSubmit}
                disabled={loading || students.length === 0}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save All Marks'}
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">Student Name</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">Email</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 w-32">Marks Obtained</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 w-24">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-300 dark:text-gray-700">
                            <Users className="w-8 h-8" />
                          </div>
                          <p className="text-gray-400 dark:text-gray-600 font-bold">Select a class to load students.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.map((student) => {
                    const score = marks[student._id] || 0;
                    const percentage = examData.totalMarks > 0 ? (score / examData.totalMarks * 100).toFixed(0) : 0;
                    
                    return (
                      <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">{student.email}</td>
                        <td className="px-6 py-4">
                          <input 
                            type="number"
                            max={examData.totalMarks}
                            className="w-full text-right px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-gray-900 dark:text-white"
                            placeholder="0"
                            value={marks[student._id]}
                            onChange={(e) => handleMarkChange(student._id, e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                            percentage >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 
                            percentage >= 50 ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateMarks;
