import { useEffect } from 'react';
import { X, Download, ImageIcon } from 'lucide-react';

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageLightbox({ image, imgUrl, onClose }) {

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleDownload = async () => {
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName || image.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{image.name}</p>
            <p className="text-gray-500 text-xs">
              {image.originalName} &middot; {formatSize(image.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-xl text-sm font-medium transition"
          >
            <Download size={15} />
            <span className="hidden sm:block">Download</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image area — centred, click outside image closes */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <img
          src={imgUrl}
          alt={image.name}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom hint */}
      <div className="text-center py-3 flex-shrink-0">
        <p className="text-gray-600 text-xs">Press Esc or click outside to close</p>
      </div>
    </div>
  );
}