import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatMessage from '../components/ChatMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { sendMessage } from '../services/chatService';
import { generateSessionId } from '../utils/helpers';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim(); setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const data = await sendMessage(userMessage, sessionId, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get response');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleNewConversation = () => { setMessages([]); setSessionId(generateSessionId()); toast.success('New conversation started'); };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ECFDF5' }}><MessageCircle className="w-5 h-5" style={{ color: '#10B981' }} /></div>
          <div><h1 className="text-xl font-bold text-slate-800">Symptom Chatbot</h1><p className="text-xs text-slate-400">AI-powered health guidance</p></div>
        </div>
        <button onClick={handleNewConversation} className="btn-secondary !py-2 !px-4 text-sm"><Plus className="w-4 h-4" /> New Chat</button>
      </div>

      <div className="flex-1 overflow-y-auto glass-card p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"><MessageCircle className="w-8 h-8 text-emerald-300" /></div>
            <p className="text-lg text-slate-600 font-medium">Ask me about your symptoms</p>
            <p className="text-sm text-slate-400 mt-2">Describe what you're feeling for AI-powered guidance</p>
          </div>
        ) : messages.map((msg, i) => <ChatMessage key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />)}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-white" /></div>
            <div className="flex gap-1.5">{[0,1,2].map((i) => <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />)}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-card p-3 flex items-center gap-3">
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe your symptoms..." className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none text-sm" disabled={loading} />
        <button onClick={handleSend} disabled={!input.trim() || loading} className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all duration-200 bg-gradient-to-br from-blue-500 to-indigo-500 hover:shadow-glow-blue">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
