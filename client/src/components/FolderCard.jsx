import { Folder, Trash2, ChevronRight } from 'lucide-react';

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FolderCard({ folder, onOpen, onDelete }) {
  return (
    <div className="group bg-gray-900 border border-gray-800 hover:border-violet-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10"
      onClick={() => onOpen(folder._id)}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Folder className="w-6 h-6 text-violet-400" />
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(folder._id); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition">
          <Trash2 size={15} />
        </button>
      </div>
      <p className="text-white font-semibold text-sm truncate mb-1">{folder.name}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{formatSize(folder.totalSize || 0)}</span>
        <ChevronRight size={14} className="text-gray-600 group-hover:text-violet-400 transition" />
      </div>
    </div>
  );
}