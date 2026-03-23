import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RiskMeter = ({ value = 0, label = 'Risk Level' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const clampedValue = Math.min(100, Math.max(0, animatedValue));
  const rotation = -90 + (clampedValue / 100) * 180;

  const getColor = (val) => {
    if (val < 33) return '#10B981';
    if (val < 67) return '#F59E0B';
    return '#EF4444';
  };

  const getLabel = (val) => {
    if (val < 33) return 'Low Risk';
    if (val < 67) return 'Moderate Risk';
    return 'High Risk';
  };

  const color = getColor(clampedValue);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-36">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F1F5F9" strokeWidth="16" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 66.7 30" fill="none" stroke="#10B981" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
          <path d="M 66.7 30 A 80 80 0 0 1 133.3 30" fill="none" stroke="#F59E0B" strokeWidth="16" opacity="0.3" />
          <path d="M 133.3 30 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
          <motion.line x1="100" y1="100" x2="100" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round"
            style={{ transformOrigin: '100px 100px' }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1.5, ease: 'easeOut' }} />
          <circle cx="100" cy="100" r="6" fill={color} opacity="0.15" />
          <circle cx="100" cy="100" r="4" fill={color} />
          <circle cx="100" cy="100" r="2" fill="#FFFFFF" />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.span className="text-3xl font-bold" style={{ color }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {Math.round(clampedValue)}%
          </motion.span>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-2">
        <span className="px-4 py-1.5 rounded-full text-sm font-medium"
          style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}>
          {getLabel(clampedValue)}
        </span>
      </motion.div>
      <p className="text-xs text-slate-400 mt-2">{label}</p>
    </div>
  );
};

export default RiskMeter;
