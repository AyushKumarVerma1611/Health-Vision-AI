import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadBox from '../components/UploadBox';
import ReportCard from '../components/ReportCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadReport, getReports, deleteReport } from '../services/reportService';

const UploadedReports = () => {
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true); const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null); const [description, setDescription] = useState(''); const [previewReport, setPreviewReport] = useState(null); const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchReports(); }, []);
  const fetchReports = async () => { try { const data = await getReports(); setReports(data.reports || []); } catch { toast.error('Failed to load reports'); } finally { setLoading(false); } };
  const handleUpload = async () => { if (!file) { toast.error('Please select a file'); return; } setUploading(true); try { await uploadReport(file, description); toast.success('Report uploaded!'); setFile(null); setDescription(''); fetchReports(); } catch (e) { toast.error(e.response?.data?.message || 'Upload failed'); } finally { setUploading(false); } };
  const handleDelete = async () => { try { await deleteReport(deleteId); setReports((prev) => prev.filter((r) => r._id !== deleteId)); setDeleteId(null); toast.success('Report deleted'); } catch { toast.error('Failed to delete report'); } };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" text="Loading reports..." /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ECFDF5' }}><FileUp className="w-5 h-5" style={{ color: '#10B981' }} /></div>
        <h1 className="text-2xl font-bold text-slate-800">Uploaded Reports</h1>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-700">Upload Medical Document</h3>
        <UploadBox onFileSelect={setFile} acceptedTypes=".jpg,.jpeg,.png,.pdf" label="Upload Prescription, Lab Report, or Document" />
        <div><label className="block text-sm text-slate-500 mb-1">Description (optional)</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Blood test results" className="input-field" /></div>
        <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary">{uploading ? <LoadingSpinner size="sm" /> : <><FileUp className="w-5 h-5" /> Upload Report</>}</button>
      </div>

      {reports.length === 0 ? (<div className="text-center py-16"><FileUp className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-lg text-slate-500">No reports uploaded yet</p><p className="text-sm text-slate-400 mt-1">Upload prescriptions & lab reports for AI analysis</p></div>
      ) : (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{reports.map((report) => <ReportCard key={report._id} report={report} onDelete={(id) => setDeleteId(id)} onView={(r) => setPreviewReport(r)} />)}</div>)}

      <AnimatePresence>{previewReport && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewReport(null)}><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-soft-xl border border-slate-200" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-slate-100"><h3 className="text-lg font-semibold text-slate-800 truncate">{previewReport.fileName}</h3><button onClick={() => setPreviewReport(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-auto p-4">{previewReport.fileType?.includes('image') ? <img src={previewReport.fileUrl} alt={previewReport.fileName} className="max-w-full rounded-xl mx-auto" /> : previewReport.fileType?.includes('pdf') ? <iframe src={previewReport.fileUrl} className="w-full h-[70vh] rounded-xl" title="PDF" /> : <p className="text-slate-400 text-center py-8">Preview not available</p>}</div></motion.div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{deleteId && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm shadow-soft-xl border border-slate-200" onClick={(e) => e.stopPropagation()}><h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Report?</h3><p className="text-sm text-slate-400 mb-6">This will permanently delete the file.</p><div className="flex gap-3"><button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button><button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">Delete</button></div></motion.div></motion.div>)}</AnimatePresence>
    </div>
  );
};

export default UploadedReports;
