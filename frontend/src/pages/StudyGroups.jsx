import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock, 
  Search, 
  BookOpen, 
  UserPlus, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { studyGroupAPI, subjectsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function StudyGroups() {
  const { addToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [searchSubject, setSearchSubject] = useState('');

  // Create Modal / Form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState(4);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Schedule Session Form
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('4:00 PM - 5:30 PM');
  const [sessionGoal, setSessionGoal] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    loadSubjects();
    loadGroups();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.getSubjects();
      setSubjects(res.data || []);
      if (res.data?.length > 0) {
        setSubjectName(res.data[0].subject_name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadGroups = async (subj = '') => {
    setLoading(true);
    try {
      const res = await studyGroupAPI.searchGroups({ subject: subj || undefined });
      setGroups(res.data || []);
      if (res.data?.length > 0 && !activeGroup) {
        loadGroupDetails(res.data[0].id);
      }
    } catch (e) {
      addToast('Failed to load study groups.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId) => {
    try {
      const res = await studyGroupAPI.getGroup(groupId);
      setActiveGroup(res.data);
    } catch (e) {
      addToast('Failed to load group details.', 'error');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name || !subjectName) {
      addToast('Please provide group name and subject.', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await studyGroupAPI.createGroup({
        name,
        subject_name: subjectName,
        department,
        semester,
        description
      });
      addToast(`Study Group '${res.data.name}' created!`, 'success');
      setShowCreate(false);
      setName('');
      setDescription('');
      loadGroups();
      loadGroupDetails(res.data.id);
    } catch (err) {
      addToast('Failed to create group.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await studyGroupAPI.joinGroup(groupId);
      addToast('Joined study group successfully!', 'success');
      loadGroups();
      loadGroupDetails(groupId);
    } catch (e) {
      addToast('Failed to join group.', 'error');
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!activeGroup || !sessionTopic || !sessionDate) {
      addToast('Please provide session topic and date.', 'error');
      return;
    }
    setScheduling(true);
    try {
      await studyGroupAPI.scheduleSession(activeGroup.id, {
        topic: sessionTopic,
        scheduled_date: sessionDate,
        scheduled_time: sessionTime,
        goal: sessionGoal
      });
      addToast('Study session scheduled!', 'success');
      setSessionTopic('');
      setSessionGoal('');
      loadGroupDetails(activeGroup.id);
    } catch (err) {
      addToast('Failed to schedule session.', 'error');
    } finally {
      setScheduling(false);
    }
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
            <Users className="w-3.5 h-3.5" />
            Peer Study Groups & Collaborative Learning
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight font-poppins text-white">
            Study Together, Conquer Difficult Syllabi
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Form subject squads within your college, organize shared revision sessions, and align on mutual exam goals.
          </p>
        </div>
      </div>

      {/* Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by subject or topic..."
            value={searchSubject}
            onChange={(e) => {
              setSearchSubject(e.target.value);
              loadGroups(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Study Group
        </button>
      </div>

      {/* Create Modal / Form Collapse */}
      {showCreate && (
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
            Create a New Peer Study Group
          </h3>
          <form onSubmit={handleCreateGroup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DBMS Algorithms Study Circle"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.subject_name}>{s.subject_name}</option>
                ))}
                <option value="Database Management Systems">Database Management Systems</option>
                <option value="Operating Systems">Operating Systems</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Semester</label>
              <input
                type="number"
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value))}
                min="1"
                max="8"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description & Goals</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share learning objectives, weekly schedule expectations..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium resize-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                {creating ? 'Creating...' : 'Save & Publish Group'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Groups List vs Group Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Groups List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Available Study Squads</h3>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {groups.map(g => (
                <div
                  key={g.id}
                  onClick={() => loadGroupDetails(g.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    activeGroup?.id === g.id 
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{g.name}</div>
                      <div className="text-xs text-slate-500">{g.subject_name} • Sem {g.semester}</div>
                    </div>
                    {g.is_member ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                        Member ({g.user_role})
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(g.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                      >
                        Join
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-1">{g.description}</div>
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{g.member_count} active members</span>
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No peer groups found. Create the first squad for your college!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Group Workspace & Sessions */}
        <div className="lg:col-span-7 space-y-6">
          {activeGroup ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{activeGroup.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {activeGroup.subject_name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {activeGroup.description || 'Collaborative revision, peer concept checking, and shared exam sprints.'}
                </p>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  Squad Members ({activeGroup.members?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeGroup.members?.map((m, i) => (
                    <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{m.name}</span>
                      <span className="text-[10px] text-slate-400">({m.role})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduled Sessions */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Scheduled Study Sessions
                </h3>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeGroup.sessions?.map(s => (
                    <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-800">{s.topic}</div>
                        <div className="text-[11px] text-slate-500">{s.scheduled_date} • {s.scheduled_time}</div>
                        {s.goal && <div className="text-[10px] text-blue-700">Goal: {s.goal}</div>}
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {s.status}
                      </span>
                    </div>
                  ))}
                  {(!activeGroup.sessions || activeGroup.sessions.length === 0) && (
                    <div className="text-xs text-slate-400 text-center py-4">No upcoming study sessions scheduled.</div>
                  )}
                </div>
              </div>

              {/* Schedule New Session Form */}
              <form onSubmit={handleScheduleSession} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800 uppercase tracking-wider">Schedule Next Squad Session</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Session Topic (e.g. Relational Algebra Problems)"
                      value={sessionTopic}
                      onChange={(e) => setSessionTopic(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Time (e.g. 5:00 PM - 6:30 PM)"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Session Goal (e.g. Review 5 past questions)"
                    value={sessionGoal}
                    onChange={(e) => setSessionGoal(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm Session'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400">
              <Users className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 mb-1">Select a Study Squad</h3>
              <p className="text-xs max-w-sm mx-auto">Choose a study group on the left to see members, upcoming study blocks, or schedule new collaborative goals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
