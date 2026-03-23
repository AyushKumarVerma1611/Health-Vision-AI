import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Scan, Brain, Heart, Droplets,
  MessageCircle, History, FileUp, FileText, User, LogOut, X
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { getInitials } from '../utils/helpers';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ecg', icon: Activity, label: 'ECG Analysis' },
  { to: '/xray', icon: Scan, label: 'X-Ray Analysis' },
  { to: '/mri', icon: Brain, label: 'Brain MRI' },
  { to: '/heart', icon: Heart, label: 'Heart Risk' },
  { to: '/diabetes', icon: Droplets, label: 'Diabetes Risk' },
  { to: '/chatbot', icon: MessageCircle, label: 'Symptom Chat' },
  { to: '/history', icon: History, label: 'Chat History' },
  { to: '/reports', icon: FileUp, label: 'Reports' },
  { to: '/brief', icon: FileText, label: 'Health Brief' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); onClose(); };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User section */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-soft-sm">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="px-3 mb-2">
        <div className="h-px bg-slate-100" />
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mt-2 mb-3">
        <div className="h-px bg-slate-100" />
      </div>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-soft-xl z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-semibold text-slate-800">Menu</span>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
