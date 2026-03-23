import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { formatTime } from '../utils/helpers';

const ChatMessage = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  const formatContent = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)/gm, '• $1')
      .replace(/^(\d+)\. (.+)/gm, '$1. $2')
      .replace(/\n/g, '<br />');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-br-md'
            : 'bg-white border border-slate-200 text-slate-600 rounded-bl-md shadow-soft-xs'
        }`}>
          <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
        </div>
        {timestamp && (
          <p className={`text-xs text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>{formatTime(timestamp)}</p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
