import { motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';

const ReportCard = ({ report, onDelete, onView }) => {
  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-4">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{getFileIcon(report.fileType)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-700 truncate">{report.fileName}</h4>
          {report.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{report.description}</p>}
          <p className="text-xs text-slate-400 mt-2">{formatDateTime(report.uploadedAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        {onView && (
          <button onClick={() => onView(report)} className="flex-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors py-1.5 rounded-lg hover:bg-indigo-50">View</button>
        )}
        {report.fileUrl && (
          <a href={report.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-xs text-slate-500 hover:text-slate-700 transition-colors py-1.5 rounded-lg hover:bg-slate-50 text-center">
            <Download className="w-3.5 h-3.5 inline mr-1" />Download
          </a>
        )}
        {onDelete && (
          <button onClick={() => onDelete(report._id)}
            className="text-xs text-slate-300 hover:text-red-500 transition-colors py-1.5 px-2 rounded-lg hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ReportCard;
