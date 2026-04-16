import { Trash2, ImageIcon } from 'lucide-react';

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageCard({ image, onDelete }) {
  const imgUrl = `/uploads/${image.filename}`;

  return (
    <div className="group bg-gray-900 border border-gray-800 hover:border-violet-500/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        <img src={imgUrl} alt={image.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="hidden absolute inset-0 items-center justify-center bg-gray-800">
          <ImageIcon className="w-8 h-8 text-gray-600" />
        </div>
        <button onClick={() => onDelete(image._id)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-900/80 backdrop-blur text-gray-400 hover:text-red-400 rounded-lg transition">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-white font-medium text-sm truncate">{image.name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{formatSize(image.size)}</p>
      </div>
    </div>
  );
}