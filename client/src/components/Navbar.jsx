import { Link } from 'react-router-dom';
import { FolderOpen, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Dobby Ads</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <span className="text-gray-200 text-sm font-medium hidden sm:block">{user?.name}</span>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700 rounded-xl px-3 py-2 transition text-sm font-medium">
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}