import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, MessageCircle, BarChart3, FileUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateBrief, getBriefs, getDataSummary, downloadPDF } from '../services/reportService';
import { formatDateTime, downloadBase64PDF } from '../utils/helpers';

const MedicalBrief = () => {
  const [briefs, setBriefs] = useState([]); const [currentBrief, setCurrentBrief] = useState(null);
  const [dataSummary, setDataSummary] = useState({ chatCount: 0, analysisCount: 0, reportCount: 0 });
  const [loading, setLoading] = useState(true); const [generating, setGenerating] = useState(false); const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => { const f = async () => { try { const [b, s] = await Promise.all([getBriefs(), getDataSummary()]); setBriefs(b.briefs || []); setDataSummary(s); } catch { toast.error('Failed to load data'); } finally { setLoading(false); } }; f(); }, []);

  const handleGenerate = async () => { setGenerating(true); try { const data = await generateBrief(); setCurrentBrief(data.brief); setBriefs((prev) => [data.brief, ...prev]); toast.success('Health brief generated!'); } catch (e) { toast.error(e.response?.data?.message || 'Failed to generate brief'); } finally { setGenerating(false); } };
  const handleDownloadPDF = async () => { setPdfLoading(true); try { const data = await downloadPDF({ analysis_type: 'Medical History Brief', description: currentBrief?.summaryText || '' }); downloadBase64PDF(data.pdf_base64, `Health_Brief_${Date.now()}.pdf`); toast.success('Brief downloaded!'); } catch { toast.error('PDF download failed'); } finally { setPdfLoading(false); } };

  const formatBriefText = (text) => { if (!text) return ''; return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^## (.*)/gm, '<h3 class="text-lg font-semibold text-slate-800 mt-4 mb-2">$1</h3>').replace(/^# (.*)/gm, '<h2 class="text-xl font-bold text-slate-800 mt-4 mb-2">$1</h2>').replace(/^- (.*)/gm, '<li class="text-sm text-slate-500 ml-4">$1</li>').replace(/^(\d+)\. (.*)/gm, '<li class="text-sm text-slate-500 ml-4">$1. $2</li>').replace(/\n/g, '<br />'); };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" text="Loading..." /></div>;

  const statItems = [
    { icon: MessageCircle, color: '#10B981', bg: '#ECFDF5', value: dataSummary.chatCount, label: 'Conversations' },
    { icon: BarChart3, color: '#3B82F6', bg: '#EFF6FF', value: dataSummary.analysisCount, label: 'Analyses' },
    { icon: FileUp, color: '#F59E0B', bg: '#FFFBEB', value: dataSummary.reportCount, label: 'Reports' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F5F3FF' }}><FileText className="w-5 h-5" style={{ color: '#8B5CF6' }} /></div>
          <h1 className="text-2xl font-bold text-slate-800">AI Medical History Brief</h1>
        </div>
      </motion.div>

      <div className="glass-card p-6">
        <div className="flex items-start gap-3 mb-4"><Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 text-violet-500" /><p className="text-sm text-slate-500">Our AI analyzes your conversations, analyses, and reports to generate a comprehensive health summary.</p></div>
        <div className="grid grid-cols-3 gap-4 mb-6">{statItems.map((item, i) => (<div key={i} className="text-center p-3 rounded-xl" style={{ background: item.bg }}><item.icon className="w-6 h-6 mx-auto mb-1" style={{ color: item.color }} /><p className="text-lg font-bold text-slate-800">{item.value}</p><p className="text-xs text-slate-400">{item.label}</p></div>))}</div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full !py-4 text-base">{generating ? <LoadingSpinner size="sm" /> : <><Sparkles className="w-5 h-5" /> Generate My Health Brief</>}</button>
        {generating && <p className="text-center text-sm text-slate-400 mt-3 animate-pulse">AI is analyzing your health history...</p>}
      </div>

      {currentBrief && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"><ResultCard title="Your Health Brief"><div className="prose max-w-none text-sm text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBriefText(currentBrief.summaryText) }} /></ResultCard><button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-secondary">{pdfLoading ? <LoadingSpinner size="sm" /> : <><Download className="w-4 h-4" /> Download as PDF</>}</button></motion.div>)}

      {briefs.length > 0 && (<div><h2 className="text-lg font-semibold text-slate-800 mb-4">Previous Briefs</h2><div className="space-y-3">{briefs.map((brief, i) => (<motion.div key={brief._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-hover p-4 cursor-pointer" onClick={() => setCurrentBrief(brief)}><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-700">Health Brief</p><p className="text-xs text-slate-400">{formatDateTime(brief.generatedAt)}</p></div><div className="flex gap-2 text-xs text-slate-400"><span>{brief.dataUsed?.chatCount || 0} chats</span><span>•</span><span>{brief.dataUsed?.analysisCount || 0} analyses</span></div></div></motion.div>))}</div></div>)}
    </div>
  );
};

export default MedicalBrief;
