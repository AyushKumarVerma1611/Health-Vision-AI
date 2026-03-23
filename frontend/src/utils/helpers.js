export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getInitialColor = (name) => {
  const colors = [
    'bg-primary-500', 'bg-secondary-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
    'bg-indigo-500', 'bg-pink-500',
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const getRiskColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'low risk':
    case 'low':
      return 'text-emerald-400';
    case 'moderate risk':
    case 'moderate':
    case 'medium':
      return 'text-amber-400';
    case 'high risk':
    case 'high':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
};

export const getRiskBadgeClass = (level) => {
  switch (level?.toLowerCase()) {
    case 'low risk':
    case 'low':
      return 'badge-green';
    case 'moderate risk':
    case 'moderate':
    case 'medium':
      return 'badge-yellow';
    case 'high risk':
    case 'high':
      return 'badge-red';
    default:
      return 'badge-green';
  }
};

export const getAnalysisIcon = (type) => {
  switch (type) {
    case 'ecg': return '💓';
    case 'xray': return '🫁';
    case 'mri': return '🧠';
    case 'heart': return '❤️';
    case 'diabetes': return '💉';
    default: return '📊';
  }
};

export const getAnalysisLabel = (type) => {
  switch (type) {
    case 'ecg': return 'ECG Analysis';
    case 'xray': return 'X-Ray Analysis';
    case 'mri': return 'MRI Analysis';
    case 'heart': return 'Heart Risk';
    case 'diabetes': return 'Diabetes Risk';
    default: return 'Analysis';
  }
};

export const downloadBase64PDF = (base64String, filename = 'report.pdf') => {
  try {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
};
