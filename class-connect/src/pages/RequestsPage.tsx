import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { ResourceRequest, Subject } from '../types';
import { 
  HelpCircle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';

export default function RequestsPage() {
  const { user, userProfile } = useAuth();
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to Firestore real-time updates
  useEffect(() => {
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Subject[]);
    });

    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubRequests = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ResourceRequest[]);
      setLoading(false);
    });

    return () => {
      unsubSubjects();
      unsubRequests();
    };
  }, []);

  // Handle Post New Request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !subjectName) return;

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, 'requests'), {
        title,
        subjectName,
        description,
        requestedByUid: user.uid,
        requestedByName: userProfile?.displayName || 'Anonymous',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setTitle('');
      setSubjectName('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Request Status (Mark as Fulfilled)
  const handleToggleFulfilled = async (req: ResourceRequest) => {
    try {
      const reqRef = doc(db, 'requests', req.id);
      const newStatus = req.status === 'fulfilled' ? 'pending' : 'fulfilled';
      await updateDoc(reqRef, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resource Requests</h1>
          <p className="text-sm text-slate-400">
            Can't find notes or question papers? Ask your section peers to upload them!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No active requests</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Need specific assignment solutions or PYQs? Click "New Request" to ask your classmates.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl border mt-1 ${
                    req.status === 'fulfilled'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}
                >
                  {req.status === 'fulfilled' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950 text-indigo-400 font-semibold border border-slate-800">
                      {req.subjectName}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                        req.status === 'fulfilled'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{req.title}</h3>

                  {req.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{req.description}</p>
                  )}

                  <div className="text-[11px] text-slate-500 pt-1">
                    Requested by <span className="text-slate-300 font-medium">{req.requestedByName}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {user && (user.uid === req.requestedByUid || userProfile?.role === 'CR' || userProfile?.role === 'admin') && (
                <button
                  onClick={() => handleToggleFulfilled(req)}
                  className={`self-end sm:self-center px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    req.status === 'fulfilled'
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-md'
                  }`}
                >
                  {req.status === 'fulfilled' ? 'Mark Pending' : 'Mark Fulfilled'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Request Notes or PYQ
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  What resource do you need?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Need Module 4 handwritten notes for DBMS"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={`${s.code} - ${s.name}`}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                  <option value="General">General / Non-Subject</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Specifically looking for topic on Normalization (1NF to BCNF)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}