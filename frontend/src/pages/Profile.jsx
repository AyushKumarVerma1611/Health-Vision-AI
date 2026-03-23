import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Lock, Trash2, BarChart3, MessageCircle, FileUp, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { updateProfile, changePassword, deleteAccount } from '../services/authService';
import { getAnalyses } from '../services/analysisService';
import { getSessions } from '../services/chatService';
import { getReports, getBriefs } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getInitials } from '../utils/helpers';

const statConfig = [
  { key: 'analyses', icon: BarChart3, color: '#3B82F6', bg: '#EFF6FF', label: 'Analyses' },
  { key: 'chats', icon: MessageCircle, color: '#10B981', bg: '#ECFDF5', label: 'Chats' },
  { key: 'reports', icon: FileUp, color: '#F59E0B', bg: '#FFFBEB', label: 'Reports' },
  { key: 'briefs', icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', label: 'Briefs' },
];

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState(''); const [newPw, setNewPw] = useState(''); const [changingPw, setChangingPw] = useState(false);
  const [showDelete, setShowDelete] = useState(false); const [deletePw, setDeletePw] = useState(''); const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ analyses: 0, chats: 0, reports: 0, briefs: 0 });

  useEffect(() => { const f = async () => { try { const [a, c, r, b] = await Promise.all([getAnalyses().catch(() => ({ total: 0 })), getSessions().catch(() => ({ sessions: [] })), getReports().catch(() => ({ reports: [] })), getBriefs().catch(() => ({ briefs: [] }))]); setStats({ analyses: a.total || a.analyses?.length || 0, chats: c.sessions?.length || 0, reports: r.reports?.length || 0, briefs: b.briefs?.length || 0 }); } catch {} }; f(); }, []);

  const handleUpdateName = async () => { if (!name.trim()) { toast.error('Name cannot be empty'); return; } setSaving(true); try { const data = await updateProfile({ name: name.trim() }); updateUser(data.user); toast.success('Profile updated!'); } catch { toast.error('Failed to update profile'); } finally { setSaving(false); } };
  const handleChangePassword = async () => { if (!currentPw || !newPw) { toast.error('Fill in both password fields'); return; } if (newPw.length < 6) { toast.error('New password must be 6+ characters'); return; } setChangingPw(true); try { await changePassword({ currentPassword: currentPw, newPassword: newPw }); toast.success('Password changed!'); setCurrentPw(''); setNewPw(''); } catch (e) { toast.error(e.response?.data?.message || 'Failed to change password'); } finally { setChangingPw(false); } };
  const handleDeleteAccount = async () => { if (!deletePw) { toast.error('Enter your password'); return; } setDeleting(true); try { await deleteAccount(deletePw); toast.success('Account deleted'); logout(); } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete account'); } finally { setDeleting(false); } };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}><User className="w-5 h-5" style={{ color: '#3B82F6' }} /></div>
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-soft-md">{getInitials(user?.name)}</div>
          <div><p className="text-lg font-semibold text-slate-800">{user?.name}</p><p className="text-sm text-slate-400">{user?.email}</p><p className="text-xs text-slate-400 mt-1">Member since {formatDate(user?.createdAt)}</p></div>
        </div>
        <div className="space-y-4"><div><label className="block text-sm text-slate-500 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" /></div><button onClick={handleUpdateName} disabled={saving} className="btn-primary">{saving ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /> Save Changes</>}</button></div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{statConfig.map((item) => (<div key={item.key} className="text-center p-3 rounded-xl" style={{ background: item.bg }}><item.icon className="w-6 h-6 mx-auto mb-1" style={{ color: item.color }} /><p className="text-lg font-bold text-slate-800">{stats[item.key]}</p><p className="text-xs text-slate-400">{item.label}</p></div>))}</div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</h3>
        <div className="space-y-4"><div><label className="block text-sm text-slate-500 mb-1">Current Password</label><input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="input-field" /></div><div><label className="block text-sm text-slate-500 mb-1">New Password</label><input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input-field" /></div><button onClick={handleChangePassword} disabled={changingPw} className="btn-secondary">{changingPw ? <LoadingSpinner size="sm" /> : 'Change Password'}</button></div>
      </div>

      <div className="glass-card p-6 border-red-100">
        <h3 className="text-base font-semibold text-red-500 mb-2 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Delete Account</h3>
        <p className="text-sm text-slate-400 mb-4">This action is permanent and cannot be undone.</p>
        {!showDelete ? <button onClick={() => setShowDelete(true)} className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm">Delete My Account</button> : (
          <div className="space-y-3"><input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} placeholder="Enter password to confirm" className="input-field" /><div className="flex gap-3"><button onClick={() => { setShowDelete(false); setDeletePw(''); }} className="btn-secondary">Cancel</button><button onClick={handleDeleteAccount} disabled={deleting} className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">{deleting ? <LoadingSpinner size="sm" /> : 'Confirm Delete'}</button></div></div>
        )}
      </div>
    </div>
  );
};

export default Profile;
