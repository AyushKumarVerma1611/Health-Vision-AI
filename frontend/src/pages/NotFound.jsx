import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-white">
      <div className="blob-blue" style={{ width: '400px', height: '400px', top: '10%', left: '10%' }} />
      <div className="blob-indigo" style={{ width: '300px', height: '300px', bottom: '10%', right: '10%' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10">
        <h1 className="text-9xl font-extrabold gradient-text mb-4">404</h1>
        <p className="text-2xl font-semibold text-slate-800 mb-2">Page Not Found</p>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard" className="btn-primary"><Home className="w-5 h-5" /> Go to Dashboard</Link>
          <button onClick={() => window.history.back()} className="btn-secondary"><ArrowLeft className="w-5 h-5" /> Go Back</button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
