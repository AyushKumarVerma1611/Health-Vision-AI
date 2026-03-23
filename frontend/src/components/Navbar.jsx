import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === '/';

  const handleLogout = () => { logout(); navigate('/'); };

  if (!isLanding && isAuthenticated) {
    return (
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Link to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block font-medium">{user?.name?.split(' ')[0]}</span>
            </Link>
            <button onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-soft-sm transition-shadow group-hover:shadow-glow-blue">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">HealthVision <span className="gradient-text">AI</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">How It Works</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-lg transition-colors">Log in</Link>
          <Link to="/register" className="btn-primary !text-sm !py-2.5 !px-5">Get Started</Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-50">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100"
          >
            <div className="p-4 space-y-2">
              <a href="#features" className="block px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50">Features</a>
              <a href="#how-it-works" className="block px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50">How It Works</a>
              <hr className="border-slate-100" />
              <Link to="/login" className="block px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50">Log in</Link>
              <Link to="/register" className="btn-primary w-full text-center !text-sm">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
