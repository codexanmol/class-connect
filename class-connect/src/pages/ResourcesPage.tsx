import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Resource, ResourceType, Subject } from '../types';
import { 
  FolderDown, 
  Plus, 
  ThumbsUp, 
  ExternalLink, 
  FileText, 
  Filter, 
  Flame,
  Sparkles 
} from 'lucide-react';

const RESOURCE_TYPES: ResourceType[] = ['Notes', 'PYQ', 'Assignment', 'Syllabus', 'Other'];

export default function ResourcesPage() {
  const { user, userProfile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('Notes');
  const [subjectId, setSubjectId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync subjects & resources
  useEffect(() => {
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Subject[]);
    });

    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsubResources = onSnapshot(q, (snap) => {
      setResources(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Resource[]);
      setLoading(false);
    });

    return () => {
      unsubSubjects();
      unsubResources();
    };
  }, []);

  // Filtered resources list
  const filteredResources = resources.filter((res) => {
    const matchesType = selectedType === 'ALL' || res.type === selectedType;
    const matchesSubject = selectedSubject === 'ALL' || res.subjectId === selectedSubject;
    return matchesType && matchesSubject;
  });

  // Handle Upload Resource (+15 Aura Points reward)
  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !subjectId || !fileUrl) return;

    try {
      setIsSubmitting(true);
      const chosenSubject = subjects.find((s) => s.id === subjectId);

      // 1. Add Resource record
      await addDoc(collection(db, 'resources'), {
        title,
        description,
        subjectId,
        subjectName: chosenSubject?.name || 'General',
        type,
        fileUrl,
        fileName: title,
        uploadedByUid: user.uid,
        uploadedByName: userProfile?.displayName || 'Anonymous',
        uploadedByPhoto: user.photoURL || '',
        upvotes: 0,
        upvotedBy: [],
        createdAt: new Date().toISOString(),
      });

      // 2. Award +15 Aura points to uploader
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        auraPoints: increment(15),
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFileUrl('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to upload resource:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upvote Handler (+5 Aura to original contributor)
  const handleToggleUpvote = async (resource: Resource) => {
    if (!user) return;

    const resourceRef = doc(db, 'resources', resource.id);
    const uploaderRef = doc(db, 'users', resource.uploadedByUid);
    const hasUpvoted = resource.upvotedBy?.includes(user.uid);

    try {
      if (hasUpvoted) {
        // Remove upvote
        await updateDoc(resourceRef, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(user.uid),
        });
        await updateDoc(uploaderRef, {
          auraPoints: increment(-5),
        });
      } else {
        // Add upvote (+5 Aura to creator)
        await updateDoc(resourceRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(user.uid),
        });
        await updateDoc(uploaderRef, {
          auraPoints: increment(5),
        });
      }
    } catch (err) {
      console.error('Upvote action failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Study Resources & PYQs</h1>
          <p className="text-sm text-slate-400">
            Access, share, and upvote section notes. Earn +15 Aura per upload!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resource</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mr-2">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Types</option>
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
          ))}
        </select>
      </div>

      {/* Resource Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
          <FolderDown className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No resources found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Be the first to upload lecture notes or past year questions for your section!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResources.map((res) => {
            const isUpvoted = user ? res.upvotedBy?.includes(user.uid) : false;
            return (
              <div
                key={res.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-1">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                        {res.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {res.subjectName}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{res.title}</h3>

                    {res.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{res.description}</p>
                    )}

                    <div className="text-[11px] text-slate-500 pt-1">
                      Uploaded by <span className="text-slate-300 font-medium">{res.uploadedByName}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Upvote */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleUpvote(res)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                      isUpvoted
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{res.upvotes || 0}</span>
                  </button>

                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                  >
                    <span>View / Download</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Upload Resource
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 2 Mid-Sem Question Paper 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ResourceType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Direct Google Drive / File URL
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Includes handwritten notes for Module 3..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-400 font-medium">
                <Flame className="w-4 h-4 fill-amber-400 shrink-0" />
                <span>You will earn <strong>+15 Aura points</strong> for uploading this resource!</span>
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
                  {isSubmitting ? 'Uploading...' : 'Upload & Earn Aura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}