import { motion } from 'framer-motion';
import { Download, Trash2, Activity } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';

const ReportCard = ({ report, onDelete, onViewAnalysis, onDownloadOriginal }) => {
  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('image')) return '🖼️';
    return '📎';
  };

  const hasAnalysis = !!report.aiAnalysis;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-4 flex flex-col relative">
      {hasAnalysis && (
        <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">AI ANALYZED</span>
      )}
      <div className="flex items-start gap-3 flex-1">
        <div className="text-3xl mt-1">{getFileIcon(report.fileType)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 truncate mb-0.5">{report.fileName}</h4>
          {report.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{report.description}</p>}
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium">{formatDateTime(report.uploadedAt)}</p>
          
          {hasAnalysis && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50/50 border border-indigo-100/50 rounded-md">
              <span className={`w-1.5 h-1.5 rounded-full ${report.aiAnalysis.prediction.toLowerCase().includes('normal') ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className="text-[11px] font-medium text-slate-600 truncate max-w-[150px]">{report.aiAnalysis.prediction}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 flex-wrap">
        {hasAnalysis ? (
          <button onClick={() => onViewAnalysis(report)} className="flex-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors py-1.5 rounded-lg hover:bg-indigo-50 bg-indigo-50/30 font-semibold border border-indigo-100 min-w-[100px] shadow-sm flex justify-center items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> View Analysis
          </button>
        ) : (
          <button onClick={() => onViewAnalysis(report)} className="flex-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors py-1.5 rounded-lg hover:bg-slate-50 border border-transparent min-w-16 font-medium">Re-Analyze</button>
        )}
        
        <button onClick={() => onDownloadOriginal(report.fileUrl)}
            className="flex-1 text-xs text-slate-500 hover:text-slate-700 transition-colors py-1.5 rounded-lg hover:bg-slate-50 text-center border border-transparent min-w-16 font-medium flex justify-center items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Original
        </button>
        
        {onDelete && (
          <button onClick={() => onDelete(report._id)}
            className="text-xs text-slate-300 hover:text-red-500 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-red-50 ml-auto flex justify-center items-center">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ReportCard;
