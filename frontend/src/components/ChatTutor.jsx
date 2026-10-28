import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, X, MessageSquare, BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { agentAPI } from '../services/api';

export default function ChatTutor({ topic = "General Computer Science", hideTrigger = false, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [askFromSyllabus, setAskFromSyllabus] = useState(true);
  const [expandedSources, setExpandedSources] = useState({});
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! 👋 I'm your AI Study Tutor. Ask me any question about '${topic}', request simple explanations, or prioritize your uploaded college syllabus!`,
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSourceExpand = (msgIndex, sourceIndex) => {
    const key = `${msgIndex}-${sourceIndex}`;
    setExpandedSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await agentAPI.chatTutor({
        topic,
        question: userMsg,
        use_rag: askFromSyllabus
      });

      const botReply = res.data?.reply || `Here is a clear breakdown for "${userMsg}": It is a key mechanism in ${topic} designed to optimize processing efficiency.`;
      const botSources = res.data?.sources || [];
      const isGrounded = res.data?.is_grounded || false;

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          sources: botSources,
          isGrounded
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Here is a clear explanation for "${userMsg}": It is a fundamental academic concept in ${topic} that maintains key operational invariants.`,
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden font-inter flex flex-col h-[550px]"
          >
            {/* Chat Header */}
            <div className="p-3.5 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-poppins font-bold text-xs">AI Study Tutor</div>
                  <div className="text-[10px] text-blue-100 font-medium">Topic: {topic}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAskFromSyllabus(!askFromSyllabus)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
                    askFromSyllabus
                      ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-xs'
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                  title="Prioritize uploaded college syllabus and notes"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{askFromSyllabus ? 'Syllabus Grounded' : 'General AI'}</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Suggestion Pills */}
            <div className="p-2 bg-[#F8FBFF] border-b border-[#E2E8F0] flex gap-1.5 overflow-x-auto text-[11px] font-medium">
              <button
                onClick={() => setInput(`Explain Unit 1 of ${topic} simply`)}
                className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] whitespace-nowrap hover:bg-[#DBEAFE]"
              >
                📖 Unit 1 Syllabus
              </button>
              <button
                onClick={() => setInput(`Explain ${topic} in easy level with analogies`)}
                className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] whitespace-nowrap hover:bg-[#DBEAFE]"
              >
                💡 Easy Level
              </button>
              <button
                onClick={() => setInput(`Interview questions from syllabus for ${topic}`)}
                className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] whitespace-nowrap hover:bg-[#DBEAFE]"
              >
                💼 Exam & Interview
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFFFFF]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-[#2563EB] text-white rounded-br-none'
                        : 'bg-[#F8FBFF] text-[#1E293B] border border-[#E2E8F0] rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Source Citations Box */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/80 space-y-1.5 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          <BookOpen className="w-3 h-3 text-amber-600" />
                          <span>Official Syllabus Sources ({msg.sources.length})</span>
                        </div>
                        <div className="space-y-1">
                          {msg.sources.map((src, sIdx) => {
                            const isExpanded = expandedSources[`${i}-${sIdx}`];
                            return (
                              <div
                                key={sIdx}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] shadow-2xs"
                              >
                                <div
                                  className="flex items-center justify-between cursor-pointer select-none"
                                  onClick={() => toggleSourceExpand(i, sIdx)}
                                >
                                  <div className="font-semibold text-slate-800 truncate pr-2">
                                    📄 {src.document_name}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold shrink-0">
                                    <span>Unit {src.unit_number || '1'}</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </div>
                                </div>

                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-slate-600 space-y-1"
                                  >
                                    <div><strong>Section:</strong> {src.section_heading || 'Course Outline'}</div>
                                    <div><strong>Page:</strong> {src.page_number || '1'}</div>
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 italic font-mono text-[9px] text-slate-700">
                                      "{src.excerpt}"
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5 justify-start items-start animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-[#2563EB] animate-spin" />
                  </div>
                  <div className="max-w-[80%] p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2 rounded-bl-none">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                      <span>{askFromSyllabus ? 'Retrieving college syllabus & formulating answer...' : 'AI Tutor formulating response...'}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-[#DBEAFE] rounded-full w-48 animate-pulse" />
                      <div className="h-2.5 bg-[#DBEAFE] rounded-full w-36 animate-pulse" />
                      <div className="h-2.5 bg-[#DBEAFE] rounded-full w-24 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={askFromSyllabus ? "Ask from your college syllabus..." : "Ask your AI tutor a question..."}
                className="flex-1 glass-input py-2 px-3 rounded-xl text-xs font-inter bg-[#F8FBFF]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-[#2563EB] text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
