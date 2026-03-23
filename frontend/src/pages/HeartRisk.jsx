import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import RiskMeter from '../components/RiskMeter';
import LoadingSpinner from '../components/LoadingSpinner';
import { predictHeart } from '../services/analysisService';
import { downloadPDF } from '../services/reportService';
import { downloadBase64PDF } from '../utils/helpers';

const cpLabels = ['Typical Angina', 'Atypical Angina', 'Non-anginal Pain', 'Asymptomatic'];
const restecgLabels = ['Normal', 'ST-T Wave Abnormality', 'Left Ventricular Hypertrophy'];
const slopeLabels = ['Upsloping', 'Flat', 'Downsloping'];
const thalLabels = ['Normal', 'Fixed Defect', 'Reversible Defect'];

const HeartRisk = () => {
  const [form, setForm] = useState({ age: '', sex: '', cp: '', trestbps: '', chol: '', fbs: '', restecg: '', thalach: '', exang: '', oldpeak: '', slope: '', ca: '', thal: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key of Object.keys(form)) { if (form[key] === '') { toast.error('Please fill in all fields'); return; } }
    setLoading(true); setResult(null);
    try { const numericData = {}; Object.keys(form).forEach((k) => { numericData[k] = parseFloat(form[k]); }); const data = await predictHeart(numericData); setResult(data); toast.success('Risk assessment complete!'); }
    catch (error) { toast.error(error.response?.data?.message || 'Prediction failed'); } finally { setLoading(false); }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try { const data = await downloadPDF({ analysis_type: 'Heart Disease Risk', risk_percentage: result.risk_percentage, risk_level: result.risk_level, confidence: result.confidence, recommendations: result.recommendations }); downloadBase64PDF(data.pdf_base64, `Heart_Risk_Report_${Date.now()}.pdf`); toast.success('Report downloaded!'); }
    catch { toast.error('PDF generation failed'); } finally { setPdfLoading(false); }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FDF2F8' }}><HeartPulse className="w-5 h-5" style={{ color: '#EC4899' }} /></div>
          <h1 className="text-2xl font-bold text-slate-800">Heart Disease Risk Assessment</h1>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="glass-card p-6">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Enter Clinical Parameters</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-slate-500 mb-1">Age (1-120)</label><input type="number" name="age" value={form.age} onChange={handleChange} min="1" max="120" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Sex</label><select name="sex" value={form.sex} onChange={handleChange} className="input-field" required><option value="">Select</option><option value="1">Male</option><option value="0">Female</option></select></div>
          <div><label className="block text-sm text-slate-500 mb-1">Chest Pain Type</label><select name="cp" value={form.cp} onChange={handleChange} className="input-field" required><option value="">Select</option>{cpLabels.map((l, i) => <option key={i} value={i}>{l}</option>)}</select></div>
          <div><label className="block text-sm text-slate-500 mb-1">Resting Blood Pressure (mmHg)</label><input type="number" name="trestbps" value={form.trestbps} onChange={handleChange} className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Serum Cholesterol (mg/dl)</label><input type="number" name="chol" value={form.chol} onChange={handleChange} className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Fasting Blood Sugar &gt; 120mg/dl</label><select name="fbs" value={form.fbs} onChange={handleChange} className="input-field" required><option value="">Select</option><option value="1">Yes</option><option value="0">No</option></select></div>
          <div><label className="block text-sm text-slate-500 mb-1">Resting ECG Results</label><select name="restecg" value={form.restecg} onChange={handleChange} className="input-field" required><option value="">Select</option>{restecgLabels.map((l, i) => <option key={i} value={i}>{l}</option>)}</select></div>
          <div><label className="block text-sm text-slate-500 mb-1">Max Heart Rate Achieved</label><input type="number" name="thalach" value={form.thalach} onChange={handleChange} className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Exercise Induced Angina</label><select name="exang" value={form.exang} onChange={handleChange} className="input-field" required><option value="">Select</option><option value="1">Yes</option><option value="0">No</option></select></div>
          <div><label className="block text-sm text-slate-500 mb-1">ST Depression (oldpeak)</label><input type="number" step="0.1" name="oldpeak" value={form.oldpeak} onChange={handleChange} className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Slope of Peak Exercise ST</label><select name="slope" value={form.slope} onChange={handleChange} className="input-field" required><option value="">Select</option>{slopeLabels.map((l, i) => <option key={i} value={i}>{l}</option>)}</select></div>
          <div><label className="block text-sm text-slate-500 mb-1">Number of Major Vessels (0-3)</label><select name="ca" value={form.ca} onChange={handleChange} className="input-field" required><option value="">Select</option>{[0,1,2,3].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
          <div><label className="block text-sm text-slate-500 mb-1">Thalassemia</label><select name="thal" value={form.thal} onChange={handleChange} className="input-field" required><option value="">Select</option>{thalLabels.map((l, i) => <option key={i} value={i + 1}>{l}</option>)}</select></div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-6">{loading ? <LoadingSpinner size="sm" /> : <><HeartPulse className="w-5 h-5" /> Assess Heart Risk</>}</button>
      </form>

      {loading && <div className="text-center py-8"><LoadingSpinner size="lg" text="Analyzing risk factors..." /></div>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ResultCard title="Heart Disease Risk Assessment"><div className="flex flex-col items-center py-4"><RiskMeter value={result.risk_percentage} label="Heart Disease Risk" /></div></ResultCard>
          {result.recommendations?.length > 0 && <ResultCard title="Recommendations"><ul className="space-y-2">{result.recommendations.map((rec, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-500"><span className="text-pink-500 mt-0.5">•</span>{rec}</li>)}</ul></ResultCard>}
          {result.note && <p className="text-xs text-amber-600">ℹ️ {result.note}</p>}
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-secondary">{pdfLoading ? <LoadingSpinner size="sm" /> : <><Download className="w-4 h-4" /> Download PDF Report</>}</button>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200"><p className="text-xs text-amber-700">⚠️ AI-generated. Not a medical diagnosis. Consult a cardiologist.</p></div>
        </motion.div>
      )}
    </div>
  );
};

export default HeartRisk;
