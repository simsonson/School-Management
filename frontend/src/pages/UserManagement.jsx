import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  CheckCircle,
  AlertCircle,
  Mail,
  User as UserIcon,
  Shield,
  Upload
} from 'lucide-react';
import Papa from 'papaparse';
import api from '../lib/apiClient';

const UserManagement = ({ role }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: role,
    className: '',
    parentEmail: '',
  });
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${role}`);
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setFormData((prev) => ({ ...prev, role: role }));
    if (role === 'Student') {
      api.get('/api/admin/classes')
        .then((res) => setClasses(res.data.data || []))
        .catch(() => setClasses([]));
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Update
        await api.put(`/api/admin/users/${currentUser._id}`, formData);
        setStatus({ type: 'success', message: 'User updated successfully!' });
      } else {
        // Create
        await api.post('/api/admin/users', formData);
        setStatus({ type: 'success', message: 'User created successfully!' });
      }
      setIsModalOpen(false);
      fetchUsers();
      resetForm();
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Operation failed' });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const bulkData = results.data.map(row => ({
            name: row.name,
            email: row.email,
            password: row.password || 'Welcome@123',
            role: role,
            className: row.class || row.className || '',
            parentEmail: row.parentEmail || ''
          }));

          await api.post('/api/admin/users/bulk', { users: bulkData });
          setStatus({ type: 'success', message: `Successfully imported ${bulkData.length} users!` });
          fetchUsers();
        } catch (err) {
          setStatus({ type: 'error', message: 'Bulk import failed. Please check your CSV format.' });
        }
      }
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleToggleApproval = async (id) => {
    try {
      await api.put(`/api/admin/users/${id}/approve`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show hashed password
      role: user.role,
      className: user.className || '',
      parentEmail: user.parentEmail || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentUser(null);
    setFormData({ name: '', email: '', password: '', role: role, className: '', parentEmail: '' });
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{role} Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all {role.toLowerCase()}s in the system.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-bold transition-all shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="w-5 h-5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-5 h-5" />
            Add New {role}
          </button>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm">{status.message}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${role.toLowerCase()}s...`}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{role} Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email / Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{role === 'Teacher' ? 'Assigned Classes' : 'Class / Designation'}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">No {role.toLowerCase()}s found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name || 'Unknown'}</p>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{user.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <p>{user.email}</p>
                        {user.role === 'Student' && user.parentEmail && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Parent: {user.parentEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-400">
                      {user.role === 'Teacher' 
                        ? (user.assignedClasses?.join(', ') || 'No Classes')
                        : (user.className || 'N/A')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.isApproved 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleToggleApproval(user._id)}
                        className={`p-2 rounded-lg transition-all ${
                          user.isApproved 
                            ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-gray-800' 
                            : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800'
                        }`}
                        title={user.isApproved ? 'Revoke Approval' : 'Approve User'}
                      >
                        {user.isApproved ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser ? 'Edit' : 'Add'} {role}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {currentUser ? 'New Password (leave blank to keep)' : 'Password'}
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    required={!currentUser}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {role === 'Student' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Parent Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="email"
                        placeholder="parent@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Class Allocation</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.className || ''}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    >
                      <option value="">Select class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={`${cls.name}${cls.section ? `-${cls.section}` : ''}`}>
                          {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                >
                  {currentUser ? 'Save Changes' : `Create ${role}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
