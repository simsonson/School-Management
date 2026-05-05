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
  Shield
} from 'lucide-react';
import api from '../lib/apiClient';

const UserManagement = ({ role }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: role,
    className: '',
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
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
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentUser(null);
    setFormData({ name: '', email: '', password: '', role: role, className: '' });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role} Management</h1>
          <p className="text-gray-500">Manage all {role.toLowerCase()}s in the system.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Add New {role}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${role.toLowerCase()}s...`}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No {role.toLowerCase()}s found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">{user.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{currentUser ? 'Edit' : 'Add'} {role}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {currentUser ? 'New Password (leave blank to keep)' : 'Password'}
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required={!currentUser}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {role === 'Student' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Class Allocation</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
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
