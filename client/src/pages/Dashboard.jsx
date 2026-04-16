import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FolderPlus, Upload, Home, ChevronRight, Loader2, Folder, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FolderCard from '../components/FolderCard';
import ImageCard from '../components/ImageCard';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadImageModal from '../components/UploadImageModal';

export default function Dashboard() {
  const { id: folderId } = useParams();
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const [foldersRes, imagesRes] = await Promise.all([
        api.get(`/folders?parent=${folderId || 'null'}`),
        folderId ? api.get(`/images?folder=${folderId}`) : Promise.resolve({ data: { data: [] } }),
      ]);

      setFolders(foldersRes.data.data);
      setImages(imagesRes.data.data);

      if (folderId) {
        const { data } = await api.get(`/folders/${folderId}`);
        setCurrentFolder(data.data);
        setBreadcrumb(data.data.breadcrumb || []);
      } else {
        setCurrentFolder(null);
        setBreadcrumb([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load content.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => { loadContent(); }, [loadContent]);

  const handleDeleteFolder = async (id) => {
    if (!window.confirm('Delete this folder and all its contents? This cannot be undone.')) return;
    try {
      await api.delete(`/folders/${id}`);
      setFolders((prev) => prev.filter((f) => f._id !== id));
      toast.success('Folder deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete folder.');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
    try {
      await api.delete(`/images/${id}`);
      setImages((prev) => prev.filter((img) => img._id !== id));
      toast.success('Image deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image.');
    }
  };

  const isEmpty = !loading && folders.length === 0 && images.length === 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6 flex-wrap">
          <Link to="/" className="flex items-center gap-1 text-gray-400 hover:text-violet-400 transition text-sm font-medium">
            <Home size={14} />
            <span>My Drive</span>
          </Link>
          {breadcrumb.map((crumb, i) => (
            <div key={crumb._id} className="flex items-center gap-1.5">
              <ChevronRight size={14} className="text-gray-600" />
              {i < breadcrumb.length - 1 ? (
                <Link to={`/folder/${crumb._id}`}
                  className="text-gray-400 hover:text-violet-400 transition text-sm font-medium">
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-white text-sm font-semibold">{crumb.name}</span>
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {currentFolder ? currentFolder.name : 'My Drive'}
            </h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-0.5">
                {folders.length} folder{folders.length !== 1 ? 's' : ''}
                {folderId ? ` · ${images.length} image${images.length !== 1 ? 's' : ''}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition">
              <FolderPlus size={16} className="text-violet-400" />
              New Folder
            </button>
            {folderId && (
              <button onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-violet-500/25">
                <Upload size={16} />
                Upload Image
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
              {folderId
                ? <ImageIcon className="w-9 h-9 text-gray-600" />
                : <Folder className="w-9 h-9 text-gray-600" />}
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">Nothing here yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              {folderId
                ? 'Create a subfolder or upload images to get started.'
                : 'Create your first folder to organise your images.'}
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => setShowCreateFolder(true)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition">
                <FolderPlus size={16} className="text-violet-400" /> New Folder
              </button>
              {folderId && (
                <button onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                  <Upload size={16} /> Upload Image
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <section className="mb-8">
                <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Folder size={13} /> Folders
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      onOpen={(id) => navigate(`/folder/${id}`)}
                      onDelete={handleDeleteFolder}
                    />
                  ))}
                </div>
              </section>
            )}

            {images.length > 0 && (
              <section>
                <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ImageIcon size={13} /> Images
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((img) => (
                    <ImageCard key={img._id} image={img} onDelete={handleDeleteImage} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {showCreateFolder && (
        <CreateFolderModal
          parentId={folderId}
          onClose={() => setShowCreateFolder(false)}
          onCreated={(newFolder) => {
            setFolders((prev) => [...prev, newFolder]);
            setShowCreateFolder(false);
          }}
        />
      )}

      {showUpload && (
        <UploadImageModal
          folderId={folderId}
          onClose={() => setShowUpload(false)}
          onUploaded={(newImg) => {
            setImages((prev) => [newImg, ...prev]);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}