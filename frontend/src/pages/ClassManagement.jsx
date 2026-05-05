import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  X,
  Layers,
  Users
} from 'lucide-react';
import api from '../lib/apiClient';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', section: '', subjects: [], classTeacher: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [newAllocation, setNewAllocation] = useState({ teacher: '', className: '', subject: '' });

  const fetchData = async () => {
    try {
      const [classRes, subjectRes, teacherRes, allocationRes] = await Promise.all([
        api.get('/api/admin/classes'),
        api.get('/api/admin/subjects'),
        api.get('/api/admin/teachers'),
        api.get('/api/admin/allocations'),
      ]);
      setClasses(classRes.data.data);
      setSubjects(subjectRes.data.data);
      setTeachers(teacherRes.data.data);
      setAllocations(allocationRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/classes', {
        ...newClass,
        classTeacher: newClass.classTeacher || undefined,
      });
      setIsModalOpen(false);
      setNewClass({ name: '', section: '', subjects: [], classTeacher: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create class');
    }
  };

  const deleteClass = async (id) => {
    try {
      await api.delete(`/api/admin/classes/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete class');
    }
  };

  const addSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/subjects', newSubject);
      setNewSubject({ name: '', code: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add subject');
    }
  };

  const createAllocation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/allocations', newAllocation);
      setNewAllocation({ teacher: '', className: '', subject: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to allocate teacher');
    }
  };

  const removeAllocation = async (id) => {
    try {
      await api.delete(`/api/admin/allocations/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete allocation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class & Subject Management</h1>
          <p className="text-gray-500">Organize school classes and their curriculum.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="p-6 bg-indigo-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">{cls.name}{cls.section ? ` - ${cls.section}` : ''}</h3>
              </div>
              <button 
                onClick={() => deleteClass(cls._id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Class Teacher</p>
                <p className="text-sm text-gray-700">{cls.classTeacher?.name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {cls.subjects.map((sub) => (
                    <span key={sub._id || sub} className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                      {sub.name || sub}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Roster in student module</span>
                </div>
                <span className="text-indigo-600 text-xs font-bold">Subjects: {cls.subjects.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Subjects (Core 5 + custom)</h3>
          <form onSubmit={addSubject} className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Subject name"
              className="px-3 py-2 rounded-xl border border-gray-200"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            />
            <input
              required
              placeholder="Code (e.g. MATH)"
              className="px-3 py-2 rounded-xl border border-gray-200"
              value={newSubject.code}
              onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
            />
            <button className="col-span-2 bg-indigo-600 text-white rounded-xl py-2 font-bold">Add Subject</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <span key={s._id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{s.name} ({s.code})</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Teacher-Class-Subject Allocation</h3>
          <form onSubmit={createAllocation} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              required
              className="px-3 py-2 rounded-xl border border-gray-200"
              value={newAllocation.teacher}
              onChange={(e) => setNewAllocation({ ...newAllocation, teacher: e.target.value })}
            >
              <option value="">Teacher</option>
              {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <select
              required
              className="px-3 py-2 rounded-xl border border-gray-200"
              value={newAllocation.className}
              onChange={(e) => setNewAllocation({ ...newAllocation, className: e.target.value })}
            >
              <option value="">Class</option>
              {classes.map((c) => <option key={c._id} value={`${c.name}${c.section ? `-${c.section}` : ''}`}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>)}
            </select>
            <select
              required
              className="px-3 py-2 rounded-xl border border-gray-200"
              value={newAllocation.subject}
              onChange={(e) => setNewAllocation({ ...newAllocation, subject: e.target.value })}
            >
              <option value="">Subject</option>
              {subjects.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
            <button className="md:col-span-3 bg-emerald-600 text-white rounded-xl py-2 font-bold">Allocate</button>
          </form>
          <div className="space-y-2">
            {allocations.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-2 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-700">{a.teacher?.name}{' -> '}{a.className}{' -> '}{a.subject}</span>
                <button onClick={() => removeAllocation(a._id)} className="text-xs text-red-600 font-bold">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add New Class</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddClass} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 12"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. A"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newClass.section}
                  onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Class Teacher</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newClass.classTeacher}
                  onChange={(e) => setNewClass({ ...newClass, classTeacher: e.target.value })}
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subjects</label>
                <select
                  multiple
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 min-h-28"
                  value={newClass.subjects}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      subjects: Array.from(e.target.selectedOptions).map((opt) => opt.value),
                    })
                  }
                >
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                Save Class
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
