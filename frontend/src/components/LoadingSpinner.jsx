import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <motion.div
          className={`${sizeMap[size]} rounded-full border-2 border-indigo-100`}
          style={{ borderTopColor: '#6366F1' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {text && <p className="text-sm text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
