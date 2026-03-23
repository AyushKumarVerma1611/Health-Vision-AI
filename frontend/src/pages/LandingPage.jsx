import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Heart, Brain, Activity, Scan, Droplets, MessageCircle, Upload, Cpu, FileText, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  { icon: Activity, title: 'ECG Arrhythmia Detection', desc: 'Analyze ECG signals for irregular heart rhythms with 92% accuracy', color: '#EF4444', bg: '#FEF2F2' },
  { icon: Scan, title: 'Chest X-Ray Analysis', desc: 'Detect pneumonia, TB, and fractures with AI-powered image analysis', color: '#3B82F6', bg: '#EFF6FF' },
  { icon: Brain, title: 'Brain MRI Analysis', desc: 'Identify brain tumors and classify type with deep learning', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: Heart, title: 'Heart Disease Risk', desc: 'Predict cardiovascular risk from your medical parameters', color: '#EC4899', bg: '#FDF2F8' },
  { icon: Droplets, title: 'Diabetes Assessment', desc: 'Assess diabetes risk using clinical indicators', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: MessageCircle, title: 'Symptom Chatbot', desc: 'Describe symptoms in plain English and get AI-powered guidance', color: '#10B981', bg: '#ECFDF5' },
];

const steps = [
  { num: 1, title: 'Upload or Input', desc: 'Upload medical scans or enter health parameters', icon: Upload },
  { num: 2, title: 'AI Analysis', desc: 'Our deep learning models analyze your data instantly', icon: Cpu },
  { num: 3, title: 'Get Report', desc: 'Download a detailed PDF report with recommendations', icon: FileText },
];

const stats = [
  { label: 'Accuracy', value: 92, suffix: '%' },
  { label: 'AI Models', value: 6, suffix: '' },
  { label: 'Instant Results', value: 100, suffix: '%' },
  { label: 'Private', value: 100, suffix: '%' },
];

const AnimatedCounter = ({ end, suffix, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const inc = end / (duration * 60);
    const timer = setInterval(() => { start += inc; if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(Math.floor(start)); } }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="gradient-bg-hero absolute inset-0" />
        <div className="blob-blue" style={{ width: '500px', height: '500px', top: '-10%', right: '-5%' }} />
        <div className="blob-indigo" style={{ width: '400px', height: '400px', bottom: '-10%', left: '-5%' }} />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full text-sm text-indigo-600 font-medium mb-6 shadow-soft-xs">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> AI-Powered Health Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Health insights<br />
                <span className="gradient-text">powered by AI</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                Upload scans, describe symptoms, and get instant AI-driven health analysis with detailed medical reports.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-base !px-8 !py-4">
                  Get Started Free <ChevronRight className="w-5 h-5" />
                </Link>
                <a href="#features" className="btn-secondary text-base !px-8 !py-4">
                  See How It Works
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-4xl md:text-5xl font-bold gradient-text"><AnimatedCounter end={stat.value} suffix={stat.suffix} /></p>
              <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">6 Powerful AI Health Modules</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Comprehensive health analysis powered by state-of-the-art deep learning models</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to="/register" className="glass-card-hover block p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                    <f.icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 text-lg">Three simple steps to AI-powered health insights</p>
          </motion.div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center relative">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-blue relative z-10">
                    <span className="text-2xl font-bold text-white">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card p-12" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">Join thousands of users leveraging AI for better health insights.</p>
          <Link to="/register" className="btn-primary text-base !px-8 !py-4">Create Free Account <ChevronRight className="w-5 h-5" /></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div>
              <span className="text-lg font-bold text-slate-800">HealthVision <span className="gradient-text">AI</span></span>
            </div>
            <p className="text-sm text-slate-400">AI-powered health analysis for everyone.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">How It Works</a></li>
              <li><Link to="/register" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Disclaimer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">HealthVision AI is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} HealthVision AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
