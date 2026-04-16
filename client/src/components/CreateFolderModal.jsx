import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateFolderModal({ parentId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Folder name is required.'); return; }
    if (name.trim().length > 100) { setError('Folder name cannot exceed 100 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/folders', {
        name: name.trim(),
        parent: parentId || null,
      });
      toast.success(`Folder "${data.data.name}" created!`);
      onCreated(data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create folder.';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-white font-semibold text-lg">New Folder</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Folder Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Campaigns, Projects..."
              className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:border-violet-500 focus:ring-violet-500'
              }`}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}