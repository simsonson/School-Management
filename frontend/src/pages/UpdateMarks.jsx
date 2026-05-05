import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, User, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/apiClient';

const UpdateMarks = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    examName: '',
    score: '',
    totalMarks: '100',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/api/teacher/students');
        setStudents(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/api/teacher/marks', {
        ...formData,
        studentId: selectedStudent._id
      });
      setStatus({ type: 'success', message: 'Marks updated successfully!' });
      setFormData({ subject: '', examName: '', score: '', totalMarks: '100' });
      setSelectedStudent(null);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update marks' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Student List Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Select Student</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredStudents.map(student => (
              <button
                key={student._id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all ${
                  selectedStudent?._id === student._id 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  selectedStudent?._id === student._id ? 'bg-white/20' : 'bg-white text-indigo-600 border border-gray-100'
                }`}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold">{student.name}</p>
                  <p className={`text-xs ${selectedStudent?._id === student._id ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {student.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Marks Form */}
      <div className="lg:col-span-2">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[600px]">
          {!selectedStudent ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No Student Selected</h3>
              <p className="text-gray-500 max-w-xs mt-2">Please select a student from the list to update their marks.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Update Marks for {selectedStudent.name}</h2>
                  <p className="text-gray-500 mt-1">Student ID: {selectedStudent._id.slice(-6).toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Clear Selection
                </button>
              </div>

              {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium">{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Science"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Exam Type</label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                      value={formData.examName}
                      onChange={(e) => setFormData({...formData, examName: e.target.value})}
                    >
                      <option value="">Select Exam</option>
                      <option value="Unit Test 1">Unit Test 1</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Final Exam">Final Exam</option>
                      <option value="Internal Assessment">Internal Assessment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Obtained Marks</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={formData.score}
                      onChange={(e) => setFormData({...formData, score: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Marks</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {loading ? 'Updating Marks...' : 'Submit Grade'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateMarks;
