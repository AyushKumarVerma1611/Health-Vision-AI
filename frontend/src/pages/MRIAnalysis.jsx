import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadBox from '../components/UploadBox';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeMRI } from '../services/analysisService';
import { downloadPDF } from '../services/reportService';
import { downloadBase64PDF } from '../utils/helpers';

const MRIAnalysis = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a brain MRI scan'); return; }
    setLoading(true); setResult(null);
    try { const data = await analyzeMRI(file); setResult(data); toast.success('MRI analysis complete!'); }
    catch (error) { toast.error(error.response?.data?.message || 'MRI analysis failed'); }
    finally { setLoading(false); }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try { const data = await downloadPDF({ analysis_type: 'Brain MRI Analysis', ...result }); downloadBase64PDF(data.pdf_base64, `MRI_Report_${Date.now()}.pdf`); toast.success('Report downloaded!'); }
    catch { toast.error('PDF generation failed'); } finally { setPdfLoading(false); }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F5F3FF' }}><Brain className="w-5 h-5" style={{ color: '#8B5CF6' }} /></div>
          <h1 className="text-2xl font-bold text-slate-800">Brain MRI Analysis</h1>
        </div>
        <p className="text-slate-400 text-sm ml-[52px]">Upload brain MRI for tumor classification</p>
      </motion.div>

      <div className="glass-card p-6 space-y-4">
        <UploadBox onFileSelect={setFile} acceptedTypes=".jpg,.jpeg,.png" label="Upload Brain MRI Scan" />
        <button onClick={handleAnalyze} disabled={!file || loading} className="btn-primary w-full">{loading ? <LoadingSpinner size="sm" /> : <><Brain className="w-5 h-5" /> Analyze MRI</>}</button>
      </div>

      {loading && <div className="text-center py-8"><LoadingSpinner size="lg" text="Analyzing MRI scan..." /></div>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ResultCard title="Analysis Result">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: result.prediction === 'No Tumor' ? '#ECFDF5' : '#FEF2F2' }}>
                <span className="text-3xl">{result.prediction === 'No Tumor' ? '✅' : '⚠️'}</span>
                <div><p className="text-lg font-semibold" style={{ color: result.prediction === 'No Tumor' ? '#059669' : '#DC2626' }}>{result.prediction}</p>{result.description && <p className="text-sm text-slate-500">{result.description}</p>}</div>
              </div>
              {result.confidence && <div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-slate-500">Confidence</span><span className="font-medium text-slate-700">{(result.confidence * 100).toFixed(1)}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence * 100}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500" /></div></div>}
            </div>
          </ResultCard>
          {result.recommendations?.length > 0 && <ResultCard title="Recommendations"><ul className="space-y-2">{result.recommendations.map((rec, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-500"><span className="text-violet-500 mt-0.5">•</span>{rec}</li>)}</ul></ResultCard>}
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-secondary">{pdfLoading ? <LoadingSpinner size="sm" /> : <><Download className="w-4 h-4" /> Download PDF Report</>}</button>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200"><p className="text-xs text-amber-700">⚠️ AI-generated analysis. Not a medical diagnosis. Consult a neurologist.</p></div>
        </motion.div>
      )}
    </div>
  );
};

export default MRIAnalysis;
