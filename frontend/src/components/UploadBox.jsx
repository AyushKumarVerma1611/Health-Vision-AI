import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadBox = ({ onFileSelect, acceptedTypes = '.jpg,.jpeg,.png,.pdf', label = 'Upload File', maxSize = 10 }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const allowed = acceptedTypes.split(',').map(t => t.trim().toLowerCase());
    if (!allowed.includes(ext)) { toast.error('File type not supported'); return; }
    if (file.size > maxSize * 1024 * 1024) { toast.error(`File too large. Max: ${maxSize}MB`); return; }
    setFileName(file.name);
    onFileSelect(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else { setPreview(null); }
  }, [onFileSelect, maxSize, acceptedTypes]);

  const handleDrop = (e) => { e.preventDefault(); setIsDragActive(false); const file = e.dataTransfer.files[0]; processFile(file); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = () => setIsDragActive(false);
  const handleChange = (e) => { const file = e.target.files[0]; processFile(file); };
  const handleClick = () => inputRef.current?.click();
  const clearFile = (e) => { e.stopPropagation(); setPreview(null); setFileName(''); onFileSelect(null); if (inputRef.current) inputRef.current.value = ''; };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-indigo-400 bg-indigo-50/50'
          : fileName
          ? 'border-emerald-300 bg-emerald-50/30'
          : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
      }`}
    >
      <input ref={inputRef} type="file" accept={acceptedTypes} onChange={handleChange} className="hidden" />

      {fileName ? (
        <div className="flex items-center justify-center gap-4">
          {preview ? (
            <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center">
              <File className="w-7 h-7 text-indigo-500" />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{fileName}</p>
            <p className="text-xs text-emerald-600 mt-1">✓ Ready for analysis</p>
          </div>
          <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <motion.div
            animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4"
          >
            <Upload className={`w-6 h-6 ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          </motion.div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-xs text-slate-400 mt-1">
            Drag & drop or <span className="text-indigo-500 font-medium">browse</span> — max {maxSize}MB
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
