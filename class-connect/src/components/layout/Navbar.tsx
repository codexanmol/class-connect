import { Bell, Flame, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-xl text-indigo-400">ClassConnect</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
          {userProfile?.section || 'CSE-A'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Dynamic Aura Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>{userProfile?.auraPoints ?? 0} Aura</span>
        </div>

        {/* Notifications Button */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <Bell className="w-5 h-5" />
        </button>

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              {user?.displayName ? user.displayName[0] : 'U'}
            </div>
          )}

          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}