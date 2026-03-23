import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Heart, Droplets, BarChart3, Brain, Scan, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { getDashboardSummary } from '../services/analysisService';
import HealthChart from '../components/HealthChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { getGreeting, formatDateTime, getAnalysisIcon, getAnalysisLabel, getRiskBadgeClass, getRiskColor } from '../utils/helpers';

const quickActions = [
  { label: 'ECG Analysis', to: '/ecg', icon: Activity, color: '#EF4444', bg: '#FEF2F2' },
  { label: 'X-Ray Analysis', to: '/xray', icon: Scan, color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Brain MRI', to: '/mri', icon: Brain, color: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'Heart Risk', to: '/heart', icon: Heart, color: '#EC4899', bg: '#FDF2F8' },
  { label: 'Diabetes Risk', to: '/diabetes', icon: Droplets, color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Symptom Chat', to: '/chatbot', icon: MessageCircle, color: '#10B981', bg: '#ECFDF5' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { const summary = await getDashboardSummary(); setData(summary); }
      catch { toast.error('Failed to load dashboard data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>;

  const chartData = [];
  if (data?.heartTrend?.length || data?.diabetesTrend?.length) {
    const maxLen = Math.max(data.heartTrend?.length || 0, data.diabetesTrend?.length || 0);
    for (let i = 0; i < maxLen; i++) {
      const h = data.heartTrend?.[i]; const d = data.diabetesTrend?.[i];
      chartData.push({ date: h?.createdAt || d?.createdAt || new Date().toISOString(), heartRisk: h?.result?.riskPercentage ?? null, diabetesRisk: d?.result?.riskPercentage ?? null });
    }
  }

  const summaryCards = [
    { label: 'Last ECG Result', icon: Activity, color: '#EF4444', bg: '#FEF2F2', value: data?.latestECG ? data.latestECG.prediction : null },
    { label: 'Heart Risk Score', icon: Heart, color: '#EC4899', bg: '#FDF2F8', value: data?.latestHeart ? `${data.latestHeart.riskPercentage}%` : null, valueColor: data?.latestHeart ? getRiskColor(data.latestHeart.riskLevel) : null },
    { label: 'Diabetes Risk', icon: Droplets, color: '#F59E0B', bg: '#FFFBEB', value: data?.latestDiabetes ? data.latestDiabetes.riskLevel : null, isBadge: !!data?.latestDiabetes },
    { label: 'Total Analyses', icon: BarChart3, color: '#3B82F6', bg: '#EFF6FF', value: data?.totalAnalyses || 0 },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400 mt-1">Here's your health overview</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <span className="text-sm text-slate-500">{card.label}</span>
            </div>
            {card.value !== null && card.value !== undefined ? (
              card.isBadge ? <span className={getRiskBadgeClass(card.value)}>{card.value}</span> : <p className={`text-lg font-semibold ${card.valueColor || 'text-slate-800'}`}>{card.value}</p>
            ) : <p className="text-sm text-slate-400">No data yet</p>}
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Health Trends</h2>
        <HealthChart data={chartData} />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          {data?.recentAnalyses?.length > 0 ? (
            <div className="space-y-3">
              {data.recentAnalyses.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                  <span className="text-2xl">{getAnalysisIcon(a.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{getAnalysisLabel(a.type)}</p>
                    <p className="text-xs text-slate-400">{a.result?.prediction || a.result?.riskLevel || 'Completed'}</p>
                  </div>
                  <p className="text-xs text-slate-400">{formatDateTime(a.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-8"><p className="text-slate-400">No analyses yet</p><p className="text-sm text-slate-400 mt-1">Run your first analysis to see activity</p></div>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a, i) => (
              <Link key={i} to={a.to} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: a.bg }}>
                  <a.icon className="w-5 h-5" style={{ color: a.color }} />
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-800 font-medium transition-colors">{a.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
