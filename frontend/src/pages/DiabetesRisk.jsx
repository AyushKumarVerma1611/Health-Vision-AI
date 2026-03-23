import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import RiskMeter from '../components/RiskMeter';
import LoadingSpinner from '../components/LoadingSpinner';
import { predictDiabetes } from '../services/analysisService';
import { downloadPDF } from '../services/reportService';
import { downloadBase64PDF } from '../utils/helpers';

const DiabetesRisk = () => {
  const [form, setForm] = useState({ Pregnancies: '', Glucose: '', BloodPressure: '', SkinThickness: '', Insulin: '', BMI: '', DiabetesPedigreeFunction: '', Age: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key of Object.keys(form)) { if (form[key] === '') { toast.error('Please fill in all fields'); return; } }
    setLoading(true); setResult(null);
    try { const numericData = {}; Object.keys(form).forEach((k) => { numericData[k] = parseFloat(form[k]); }); const data = await predictDiabetes(numericData); setResult(data); toast.success('Risk assessment complete!'); }
    catch (error) { toast.error(error.response?.data?.message || 'Prediction failed'); } finally { setLoading(false); }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try { const data = await downloadPDF({ analysis_type: 'Diabetes Risk', risk_percentage: result.risk_percentage, risk_level: result.risk_level, recommendations: result.recommendations }); downloadBase64PDF(data.pdf_base64, `Diabetes_Risk_Report_${Date.now()}.pdf`); toast.success('Report downloaded!'); }
    catch { toast.error('PDF generation failed'); } finally { setPdfLoading(false); }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFFBEB' }}><Droplets className="w-5 h-5" style={{ color: '#F59E0B' }} /></div>
          <h1 className="text-2xl font-bold text-slate-800">Diabetes Risk Assessment</h1>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="glass-card p-6">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Enter Clinical Parameters</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-slate-500 mb-1">Number of Pregnancies</label><input type="number" name="Pregnancies" value={form.Pregnancies} onChange={handleChange} min="0" max="20" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Glucose Level (mg/dL)</label><input type="number" name="Glucose" value={form.Glucose} onChange={handleChange} min="0" max="300" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Blood Pressure (mm Hg)</label><input type="number" name="BloodPressure" value={form.BloodPressure} onChange={handleChange} min="0" max="200" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Skin Thickness (mm)</label><input type="number" name="SkinThickness" value={form.SkinThickness} onChange={handleChange} min="0" max="100" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Insulin Level (μU/mL)</label><input type="number" name="Insulin" value={form.Insulin} onChange={handleChange} min="0" max="900" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">BMI (kg/m²)</label><input type="number" step="0.1" name="BMI" value={form.BMI} onChange={handleChange} min="0" max="70" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Diabetes Pedigree Function</label><input type="number" step="0.001" name="DiabetesPedigreeFunction" value={form.DiabetesPedigreeFunction} onChange={handleChange} min="0" max="3" className="input-field" required /></div>
          <div><label className="block text-sm text-slate-500 mb-1">Age</label><input type="number" name="Age" value={form.Age} onChange={handleChange} min="1" max="120" className="input-field" required /></div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-6">{loading ? <LoadingSpinner size="sm" /> : <><Droplets className="w-5 h-5" /> Assess Diabetes Risk</>}</button>
      </form>

      {loading && <div className="text-center py-8"><LoadingSpinner size="lg" text="Analyzing risk factors..." /></div>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ResultCard title="Diabetes Risk Assessment"><div className="flex flex-col items-center py-4"><RiskMeter value={result.risk_percentage} label="Diabetes Risk" /></div></ResultCard>
          {result.recommendations?.length > 0 && <ResultCard title="Recommendations"><ul className="space-y-2">{result.recommendations.map((rec, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-500"><span className="text-amber-500 mt-0.5">•</span>{rec}</li>)}</ul></ResultCard>}
          {result.note && <p className="text-xs text-amber-600">ℹ️ {result.note}</p>}
          <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-secondary">{pdfLoading ? <LoadingSpinner size="sm" /> : <><Download className="w-4 h-4" /> Download PDF Report</>}</button>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200"><p className="text-xs text-amber-700">⚠️ AI-generated. Not a medical diagnosis. Consult an endocrinologist.</p></div>
        </motion.div>
      )}
    </div>
  );
};

export default DiabetesRisk;
