import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, X, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';
import { agentAPI } from '../services/api';

export default function ChatTutor({ topic = "General Computer Science", hideTrigger = false, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! 👋 I'm your AI Study Tutor. Ask me any question about '${topic}', request simple explanations, or ask for extra examples!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Send research query to Agent 1 / Groq LLM
      const res = await agentAPI.research(`${topic}: ${userMsg}`);
      const botReply = res.data?.definitions?.[0]?.explanation || 
                       res.data?.summary || 
                       `Here is a simple explanation for "${userMsg}": It is a key concept in ${topic} that helps structure data efficiently.`;

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "I'm here to help! Could you ask your question again or specify what concept you'd like to review?" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && !hideTrigger && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white shadow-xl flex items-center gap-2 font-poppins font-bold text-xs shadow-blue-500/30"
        >
          <Bot className="w-5 h-5 animate-bounce" />
          <span>Ask AI Tutor</span>
        </motion.button>
      )}

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden font-inter flex flex-col h-[520px]"
          >
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-poppins font-bold text-xs">AI Study Tutor</div>
                  <div className="text-[10px] text-blue-100 font-medium">Topic: {topic}</div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Suggestion Pills */}
            <div className="p-2.5 bg-[#F8FBFF] border-b border-[#E2E8F0] flex gap-1.5 overflow-x-auto text-[11px] font-medium">
              <button
                onClick={() => setInput(`Explain ${topic} simply`)}
                className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] whitespace-nowrap hover:bg-[#DBEAFE]"
              >
                💡 Explain Simply
              </button>
              <button
                onClick={() => setInput(`Give an example of ${topic}`)}
                className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] whitespace-nowrap hover:bg-[#DBEAFE]"
              >
                📝 Give Example
              </button>
              <button
                onClick={() => setInput(`Interview tip for ${topic}`)}
                className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] whitespace-nowrap hover:bg-[#DBEAFE]"
              >
                💼 Exam Tip
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
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#2563EB] text-white rounded-br-none'
                        : 'bg-[#F8FBFF] text-[#1E293B] border border-[#E2E8F0] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 text-xs text-[#64748B] items-center italic">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB] animate-spin" /> Tutor is thinking...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI tutor a question..."
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
