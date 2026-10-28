import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  BookOpen, 
  CheckCircle, 
  Layers, 
  Trash2, 
  Sparkles,
  HelpCircle,
  HardDrive
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function OfflineStudy() {
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineNotes, setOfflineNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  // New offline note input
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Database Management Systems');
  const [content, setContent] = useState('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadOfflineContent();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineContent = () => {
    const cached = localStorage.getItem('triton_offline_notes');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setOfflineNotes(parsed);
        if (parsed.length > 0) setSelectedNote(parsed[0]);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default starter offline notes for instant access
      const defaultNotes = [
        {
          id: 'def-1',
          title: 'Database Normalization Core Cheat Sheet',
          subject: 'Database Management Systems',
          saved_at: new Date().toLocaleDateString(),
          content: '1NF: Atomic attributes, no repeating groups.\n2NF: In 1NF and no partial dependencies on composite keys.\n3NF: In 2NF and no transitive functional dependencies.\nBCNF: In 3NF and for every X -> Y, X must strictly be a superkey.'
        },
        {
          id: 'def-2',
          title: 'Process Synchronization & Semaphores',
          subject: 'Operating Systems',
          saved_at: new Date().toLocaleDateString(),
          content: 'Critical Section Requirements:\n1. Mutual Exclusion: Only one process inside at a time.\n2. Progress: Selection cannot be postponed indefinitely.\n3. Bounded Waiting: Bound exists on number of times other processes enter.'
        }
      ];
      localStorage.setItem('triton_offline_notes', JSON.stringify(defaultNotes));
      setOfflineNotes(defaultNotes);
      setSelectedNote(defaultNotes[0]);
    }
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!title || !content) {
      addToast('Please provide a title and note content.', 'error');
      return;
    }

    const newNote = {
      id: `note-${Date.now()}`,
      title,
      subject,
      saved_at: new Date().toLocaleDateString(),
      content
    };

    const updated = [newNote, ...offlineNotes];
    setOfflineNotes(updated);
    localStorage.setItem('triton_offline_notes', JSON.stringify(updated));
    setSelectedNote(newNote);
    setTitle('');
    setContent('');
    addToast('Note cached offline in browser storage!', 'success');
  };

  const handleDelete = (id) => {
    const updated = offlineNotes.filter(n => n.id !== id);
    setOfflineNotes(updated);
    localStorage.setItem('triton_offline_notes', JSON.stringify(updated));
    if (selectedNote?.id === id) {
      setSelectedNote(updated[0] || null);
    }
    addToast('Offline note removed.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div 
        className="rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg border border-blue-400/20"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0EA5E9 100%)' }}
      >
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white">
            <HardDrive className="w-3.5 h-3.5" />
            Offline Study Vault & PWA Mode
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Zero Internet? Keep Studying Uninterrupted
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Cached syllabus summaries, quick review cards, and offline notes are saved locally in your browser storage.
          </p>
        </div>
      </div>

      {/* Online / Offline Status Indicator */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        isOnline 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' 
          : 'bg-amber-50/70 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Wifi className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <WifiOff className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="font-extrabold text-sm">
              {isOnline ? 'Online Mode Active' : 'Offline Study Active'}
            </div>
            <div className="text-xs opacity-80">
              {isOnline 
                ? 'All live AI generation, AutoGen agents, and vector retrieval are active.'
                : 'Offline cached notes, revision flashcards, and stored plans remain accessible.'}
            </div>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isOnline ? 'bg-emerald-200/60 text-emerald-800' : 'bg-amber-200/60 text-amber-800'
        }`}>
          {isOnline ? 'Connected' : 'Offline Vault'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Save Note to Vault & Stored List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              Save Material for Offline Access
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Note Title / Topic"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Subject (e.g. Operating Systems)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <textarea
                  rows="4"
                  placeholder="Paste syllabus key points, equations, or summaries..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Cache in Offline Vault
              </button>
            </form>
          </div>

          {/* Stored Notes List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              Cached Offline Documents ({offlineNotes.length})
            </h3>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {offlineNotes.map(n => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNote(n)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedNote?.id === n.id 
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-800">{n.title}</div>
                    <div className="text-[10px] text-slate-500">{n.subject} • Saved: {n.saved_at}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Note Reader */}
        <div className="lg:col-span-7 space-y-6">
          {selectedNote ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700">
                  {selectedNote.subject}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">{selectedNote.title}</h2>
                <div className="text-xs text-slate-400 mt-1">Stored offline on {selectedNote.saved_at}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-800 text-xs lg:text-sm leading-relaxed whitespace-pre-line font-mono">
                {selectedNote.content}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              Select an offline cached document on the left to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
