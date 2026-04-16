import { useState } from 'react';
import { Trash2, ImageIcon, ZoomIn } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageCard({ image, onDelete }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fix: use full backend URL so Vite proxy serves it correctly
  const imgUrl = `http://localhost:5000/uploads/${image.filename}`;

  return (
    <>
      <div className="group bg-gray-900 border border-gray-800 hover:border-violet-500/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">

        {/* Image area — click opens lightbox */}
        <div
          className="relative aspect-video bg-gray-800 overflow-hidden cursor-pointer"
          onClick={() => !imgError && setLightboxOpen(true)}
        >
          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <ImageIcon className="w-8 h-8 text-gray-600" />
              <span className="text-gray-600 text-xs">Cannot load</span>
            </div>
          ) : (
            <>
              <img
                src={imgUrl}
                alt={image.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImgError(true)}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </>
          )}

          {/* Delete button */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(image._id); }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-900/80 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-white font-medium text-sm truncate" title={image.name}>
            {image.name}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{formatSize(image.size)}</p>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          image={image}
          imgUrl={imgUrl}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}