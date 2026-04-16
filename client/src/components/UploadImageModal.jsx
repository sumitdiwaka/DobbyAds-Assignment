import { useState, useRef } from 'react';
import { X, Upload, ImageIcon } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function UploadImageModal({ folderId, onClose, onUploaded }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(f.type)) {
      toast.error('Only image files are allowed (JPEG, PNG, GIF, WebP).');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB.');
      return;
    }

    setFile(f);
    setErrors((p) => ({ ...p, file: '' }));
    // Auto-fill name from filename if name is empty
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Image name is required.';
    if (!file) errs.file = 'Please select an image to upload.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('folder', folderId);
      formData.append('image', file);

      const { data } = await api.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`"${data.data.name}" uploaded successfully!`);
      onUploaded(data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-semibold text-lg">Upload Image</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>

          {/* Drop zone */}
          <div>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition group ${
                errors.file
                  ? 'border-red-500'
                  : 'border-gray-700 hover:border-violet-500'
              }`}>
              {preview ? (
                <img src={preview} alt="preview"
                  className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-10 h-10 text-gray-600 group-hover:text-violet-400 transition" />
                  <p className="text-gray-400 text-sm">Click or drag & drop an image</p>
                  <p className="text-gray-600 text-xs">PNG, JPG, GIF, WebP — max 10MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              placeholder="e.g. Campaign Banner"
              className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition ${
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:border-violet-500 focus:ring-violet-500'
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}