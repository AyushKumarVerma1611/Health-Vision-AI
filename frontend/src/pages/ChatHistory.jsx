import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Trash2, MessageCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatMessage from '../components/ChatMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSessions, getSession, deleteSession } from '../services/chatService';
import { formatDateTime, truncateText } from '../utils/helpers';

const ChatHistory = () => {
  const [sessions, setSessions] = useState([]); const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null); const [search, setSearch] = useState(''); const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchSessions(); }, []);
  const fetchSessions = async () => { try { const data = await getSessions(); setSessions(data.sessions || []); } catch { toast.error('Failed to load chat history'); } finally { setLoading(false); } };
  const handleViewSession = async (sessionId) => { try { const data = await getSession(sessionId); setSelectedChat(data.chat); } catch { toast.error('Failed to load conversation'); } };
  const handleDelete = async (sessionId) => { try { await deleteSession(sessionId); setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId)); if (selectedChat?.sessionId === sessionId) setSelectedChat(null); setDeleteId(null); toast.success('Conversation deleted'); } catch { toast.error('Failed to delete conversation'); } };
  const filtered = sessions.filter((s) => s.title?.toLowerCase().includes(search.toLowerCase()) || s.firstMessage?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" text="Loading history..." /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EEF2FF' }}><History className="w-5 h-5" style={{ color: '#6366F1' }} /></div>
        <h1 className="text-2xl font-bold text-slate-800">Past Conversations</h1>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="input-field pl-11" /></div>

      {filtered.length === 0 ? (
        <div className="text-center py-16"><MessageCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-lg text-slate-500">{sessions.length === 0 ? 'No conversations yet' : 'No matching conversations'}</p><p className="text-sm text-slate-400 mt-1">Start a conversation with the Symptom Chatbot</p></div>
      ) : (
        <div className="grid gap-3">{filtered.map((session) => (
          <motion.div key={session.sessionId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-hover p-4 cursor-pointer" onClick={() => handleViewSession(session.sessionId)}>
            <div className="flex items-start justify-between"><div className="flex-1 min-w-0"><h3 className="text-sm font-medium text-slate-700 truncate">{session.title}</h3><p className="text-xs text-slate-400 mt-1">{truncateText(session.firstMessage, 80)}</p><div className="flex items-center gap-3 mt-2"><span className="text-xs text-slate-400">{formatDateTime(session.updatedAt || session.createdAt)}</span><span className="text-xs text-slate-300">•</span><span className="text-xs text-slate-400">{session.messageCount} messages</span></div></div>
            <button onClick={(e) => { e.stopPropagation(); setDeleteId(session.sessionId); }} className="text-slate-300 hover:text-red-400 transition-colors p-1 ml-2"><Trash2 className="w-4 h-4" /></button></div>
          </motion.div>
        ))}</div>
      )}

      <AnimatePresence>{selectedChat && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedChat(null)}><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-soft-xl border border-slate-200" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-slate-100"><h3 className="text-lg font-semibold text-slate-800 truncate">{selectedChat.title}</h3><button onClick={() => setSelectedChat(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{selectedChat.messages?.map((msg, i) => <ChatMessage key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />)}</div></motion.div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{deleteId && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm shadow-soft-xl border border-slate-200" onClick={(e) => e.stopPropagation()}><h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Conversation?</h3><p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p><div className="flex gap-3"><button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button><button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">Delete</button></div></motion.div></motion.div>)}</AnimatePresence>
    </div>
  );
};

export default ChatHistory;
