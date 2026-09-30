import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Subject } from '../types';
import { BookOpen, Plus, User, Layers, Sparkles } from 'lucide-react';

export default function SubjectsPage() {
  const { userProfile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Color options for subjects
  const colors = [
    'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400',
    'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
  ];

  // Real-time listener for subjects
  useEffect(() => {
    const q = query(collection(db, 'subjects'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subjectList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subject[];
      setSubjects(subjectList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !instructor) return;

    try {
      setIsSubmitting(true);
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      await addDoc(collection(db, 'subjects'), {
        name,
        code: code.toUpperCase(),
        instructor,
        section: userProfile?.section || 'CSE-A',
        color: randomColor,
        createdAt: new Date().toISOString(),
      });

      setName('');
      setCode('');
      setInstructor('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add subject:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Subjects</h1>
          <p className="text-sm text-slate-400">
            Select a subject to view notes, syllabus, and previous year questions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No subjects added yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click the "Add Subject" button above to list your first section course module.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`p-6 rounded-2xl bg-gradient-to-br border ${subject.color || colors[0]} transition hover:scale-[1.01] flex flex-col justify-between space-y-4 shadow-xl`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/40 border border-current">
                    {subject.code}
                  </span>
                  <Layers className="w-5 h-5 opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-white line-clamp-1">{subject.name}</h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 border-t border-white/10 pt-3">
                <User className="w-3.5 h-3.5" />
                <span>Instructor: {subject.instructor}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Add New Subject
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS301"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Database Management Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instructor / Professor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Doe"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  required
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
                  {isSubmitting ? 'Creating...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}