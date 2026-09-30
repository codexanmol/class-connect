import { Bell, Flame } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-xl text-indigo-400">ClassConnect</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
          CSE-A
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Aura Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>245 Aura</span>
        </div>

        {/* Notifications Button */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <Bell className="w-5 h-5" />
        </button>

        {/* User Avatar Placeholder */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
          R
        </div>
      </div>
    </header>
  );
}