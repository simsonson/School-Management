import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  CreditCard, 
  Bell, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import api from '../lib/apiClient';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  React.useEffect(() => {
    api.get('/api/notifications')
      .then((res) => setNotifications(res.data.data || []))
      .catch(() => setNotifications([]));
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    Admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { name: 'Students', icon: GraduationCap, path: '/admin/students' },
      { name: 'Teachers', icon: Users, path: '/admin/teachers' },
      { name: 'Classes', icon: BookOpen, path: '/admin/classes' },
      { name: 'Fees', icon: CreditCard, path: '/admin/fees' },
      { name: 'Reports', icon: ClipboardList, path: '/admin/reports' },
    ],
    Teacher: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
      { name: 'Timetable', icon: Calendar, path: '/teacher/timetable' },
      { name: 'Attendance', icon: ClipboardList, path: '/teacher/attendance' },
      { name: 'Marks', icon: BookOpen, path: '/teacher/marks' },
      { name: 'Homework', icon: BookOpen, path: '/teacher/homework' },
    ],
    Student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
      { name: 'Timetable', icon: Calendar, path: '/student/timetable' },
      { name: 'Marks', icon: BookOpen, path: '/student/marks' },
      { name: 'Attendance', icon: ClipboardList, path: '/student/attendance' },
    ],
    Parent: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/parent' },
      { name: 'Children', icon: Users, path: '/parent/children' },
      { name: 'Fees', icon: CreditCard, path: '/parent/fees' },
    ],
    Principal: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/principal' },
      { name: 'Analytics', icon: LayoutDashboard, path: '/principal/analytics' },
      { name: 'Reports', icon: ClipboardList, path: '/principal/reports' },
    ]
  };

  const items = navItems[user?.role] || [];

  const markNotificationRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      // ignore transient errors in UI
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-indigo-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2 font-bold text-xl">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <span>EduManage</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-indigo-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              {isSidebarOpen && location.pathname === item.path && (
                <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {items.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            {showNotifications && (
              <div className="absolute right-36 top-16 w-80 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-20">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Notifications</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <button
                        key={n._id}
                        onClick={() => markNotificationRead(n._id)}
                        className={`w-full text-left rounded-lg p-2 border ${n.isRead ? 'bg-white border-gray-100' : 'bg-indigo-50 border-indigo-100'}`}
                      >
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
