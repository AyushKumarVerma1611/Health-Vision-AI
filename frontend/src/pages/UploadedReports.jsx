import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, X, Activity, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadBox from '../components/UploadBox';
import ReportCard from '../components/ReportCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadReport, getReports, deleteReport, analyzeDocument, downloadPDF } from '../services/reportService';
import { AuthContext } from '../context/AuthContext';

const UploadedReports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true); const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null); const [description, setDescription] = useState(''); const [deleteId, setDeleteId] = useState(null);
  
  const [analyzeReportModal, setAnalyzeReportModal] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => { fetchReports(); }, []);
  const fetchReports = async () => { try { const data = await getReports(); setReports(data.reports || []); } catch { toast.error('Failed to load reports'); } finally { setLoading(false); } };
  const handleUpload = async () => { if (!file) { toast.error('Please select a file'); return; } setUploading(true); try { await uploadReport(file, description); toast.success('Report uploaded!'); setFile(null); setDescription(''); fetchReports(); } catch (e) { toast.error(e.response?.data?.message || 'Upload failed'); } finally { setUploading(false); } };
  const handleDelete = async () => { try { await deleteReport(deleteId); setReports((prev) => prev.filter((r) => r._id !== deleteId)); setDeleteId(null); toast.success('Report deleted'); } catch { toast.error('Failed to delete report'); } };

  const handleViewAnalysis = (report) => {
    setAnalyzeReportModal(report);
    if (report.aiAnalysis) {
      setAnalysisResult(report.aiAnalysis);
    } else {
      setAnalysisResult(null);
    }
  };

  const handleDownloadOriginal = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const executeAnalysis = async () => {
    if (!analyzeReportModal) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeDocument({ reportId: analyzeReportModal._id });
      setAnalysisResult(data);
      toast.success('Document analyzed successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to analyze document.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysisResult) return;
    setDownloadingPdf(true);
    try {
      const payload = {
        analysis_type: "Document Analysis",
        patient_name: user?.name || "Patient",
        prediction: analysisResult.prediction,
        confidence: Math.round(analysisResult.confidence * 100),
        description: analysisResult.description,
        recommendations: analysisResult.recommendations || []
      };
      
      const response = await downloadPDF(payload);
      // Backend returns base64
      let b64 = response;
      if (typeof response === "object" && response.pdf_base64) {
        b64 = response.pdf_base64;
      }
      const byteCharacters = atob(b64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analyzeReportModal?.fileName || 'Document'}-Analysis.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };


  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" text="Loading reports..." /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EEF2FF' }}><Activity className="w-5 h-5" style={{ color: '#6366F1' }} /></div>
        <h1 className="text-2xl font-bold text-slate-800">AI Document Analysis</h1>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-700">Scan New Medical Document</h3>
        <UploadBox onFileSelect={setFile} acceptedTypes=".jpg,.jpeg,.png,.pdf" label="Upload Prescription, Lab Report, or medical generic Document" />
        <div><label className="block text-sm text-slate-500 mb-1">Description (optional)</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Blood test results" className="input-field" /></div>
        <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary">{uploading ? <LoadingSpinner size="sm" /> : <><Activity className="w-5 h-5" /> Upload & Analyze</>}</button>
      </div>

      {reports.length === 0 ? (<div className="text-center py-16"><FileUp className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-lg text-slate-500">No documents scanned yet</p><p className="text-sm text-slate-400 mt-1">Upload files to extract instant clinical summaries</p></div>
      ) : (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{reports.map((report) => <ReportCard key={report._id} report={report} onDelete={(id) => setDeleteId(id)} onViewAnalysis={handleViewAnalysis} onDownloadOriginal={handleDownloadOriginal} />)}</div>)}

      <AnimatePresence>{deleteId && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm shadow-soft-xl border border-slate-200" onClick={(e) => e.stopPropagation()}><h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Report?</h3><p className="text-sm text-slate-400 mb-6">This will permanently delete the file.</p><div className="flex gap-3"><button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button><button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">Delete</button></div></motion.div></motion.div>)}</AnimatePresence>

      <AnimatePresence>
        {analyzeReportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !isAnalyzing && setAnalyzeReportModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-soft-xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><Activity className="w-5 h-5 text-indigo-600" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">AI Document Analysis</h3>
                    <p className="text-sm text-slate-500">Analyzing: {analyzeReportModal.fileName}</p>
                  </div>
                </div>
                {!isAnalyzing && (
                  <button onClick={() => setAnalyzeReportModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                )}
              </div>

              <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/30">
                {!analysisResult && !isAnalyzing ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-700 mb-2">Ready to Analyze</h4>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">Our AI will scan this document for clinical findings, out-of-range values, and actionable summaries.</p>
                    <button onClick={executeAnalysis} className="btn-primary px-8"><Activity className="w-5 h-5" /> Start Analysis</button>
                  </div>
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <LoadingSpinner size="lg" text="Processing medical document..." />
                    <p className="text-sm text-slate-400 text-center max-w-sm">This may take a few moments depending on the document size.</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                          {analysisResult.prediction.toLowerCase().includes('normal') ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-indigo-500" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Assessment</h4>
                          <p className="text-xl font-bold text-slate-800">{analysisResult.prediction}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence</div>
                          <div className="text-xl font-bold text-indigo-600">{Math.round(analysisResult.confidence * 100)}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" /> Executive Summary</h4>
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{analysisResult.description}</p>
                    </div>

                    {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-emerald-500" /> Important Findings</h4>
                        <ul className="space-y-3">
                          {analysisResult.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-600 text-sm md:text-base"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {analysisResult && (
                <div className="p-4 md:p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                  <button onClick={() => setAnalyzeReportModal(null)} className="btn-secondary px-6">Close</button>
                  <button onClick={handleDownloadPDF} disabled={downloadingPdf} className="btn-primary px-6">
                    {downloadingPdf ? <LoadingSpinner size="sm" /> : <><Download className="w-4 h-4" /> Download PDF</>}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadedReports;
