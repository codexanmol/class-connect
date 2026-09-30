import { useAuth } from '../context/AuthContext';
import { Flame, ShieldCheck, Mail, BookOpen, Award } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white">Student Profile</h1>

      {/* Main Profile Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={userProfile?.displayName}
            className="w-24 h-24 rounded-full border-2 border-indigo-500/40 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-3xl">
            {userProfile?.displayName ? userProfile.displayName[0] : 'S'}
          </div>
        )}

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h2 className="text-xl font-bold text-white">{userProfile?.displayName}</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold uppercase">
              {userProfile?.role || 'Student'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{userProfile?.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Section: {userProfile?.section}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Total Aura Points</span>
          </div>
          <p className="text-2xl font-bold text-white">{userProfile?.auraPoints ?? 0}</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
            <Award className="w-4 h-4" />
            <span>Contributions</span>
          </div>
          <p className="text-2xl font-bold text-white">0 Uploads</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Status</span>
          </div>
          <p className="text-sm font-semibold text-emerald-400">Section Verified</p>
        </div>
      </div>
    </div>
  );
}