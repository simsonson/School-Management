import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  Download,
  X
} from 'lucide-react';
import api from '../lib/apiClient';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFee, setNewFee] = useState({
    student: '',
    amount: '',
    type: 'Tuition',
    dueDate: ''
  });
  const [students, setStudents] = useState([]);

  const fetchFees = async () => {
    try {
      const [feeRes, studentRes] = await Promise.all([
        api.get('/api/admin/fees'),
        api.get('/api/admin/users/Student')
      ]);
      setFees(feeRes.data.data);
      setStudents(studentRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/fees', {
        ...newFee
      });
      setIsModalOpen(false);
      setNewFee({ student: '', amount: '', type: 'Tuition', dueDate: '' });
      fetchFees();
    } catch (err) {
      alert('Failed to create fee record');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/fees/${id}`, { status });
      fetchFees();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500">Track collections and manage fee structures.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Issue Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or invoice ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading records...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No fee records found.</td></tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {fee.student?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{fee.student?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.type}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">${fee.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit ${
                        fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {fee.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {fee.status === 'Unpaid' && (
                        <button 
                          onClick={() => updateStatus(fee._id, 'Paid')}
                          className="text-indigo-600 text-xs font-bold hover:underline"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Issue New Invoice</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateFee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Student</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newFee.student}
                  onChange={(e) => setNewFee({...newFee, student: e.target.value})}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fee Type</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newFee.type}
                  onChange={(e) => setNewFee({...newFee, type: e.target.value})}
                >
                  <option value="Tuition">Tuition</option>
                  <option value="Exam">Exam</option>
                  <option value="Library">Library</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newFee.amount}
                  onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newFee.dueDate}
                  onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                Issue Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
