import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, Key, Sun, Moon, Volume2, Save } from 'lucide-react';

export default function Settings() {
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
  const [speechRate, setSpeechRate] = useState('1.0');

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('groq_api_key', apiKey);
    addToast('Settings saved successfully!', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 max-w-3xl"
    >
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#334155] space-y-2 shadow-2xl">
        <h1 className="font-poppins text-2xl font-black text-[#F8FAFC] flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#8B5CF6]" /> Platform Settings
        </h1>
        <p className="text-[#94A3B8] font-inter text-xs">
          Configure Groq LLM API keys, dark/light themes, and voice speech rate settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Key Config */}
        <div className="glass-card rounded-3xl p-6 border border-[#334155] space-y-4">
          <div className="flex items-center gap-2 font-poppins font-bold text-[#F8FAFC] text-sm">
            <Key className="w-4 h-4 text-[#06B6D4]" /> Groq API Key Configuration
          </div>
          <p className="text-[#94A3B8] font-inter text-xs leading-relaxed">
            Enter your custom Groq API key (`gsk_...`) to power Microsoft AutoGen multi-agent system models (`llama-3.3-70b-versatile`).
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full glass-input py-3 px-4 rounded-2xl text-xs font-mono text-[#F8FAFC]"
            placeholder="gsk_..."
          />
        </div>

        {/* Theme Settings */}
        <div className="glass-card rounded-3xl p-6 border border-[#334155] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-poppins font-bold text-[#F8FAFC] text-sm">Dark Glassmorphism Theme</div>
              <p className="text-[#94A3B8] font-inter text-xs mt-0.5">Toggle between Dark mode (#0F172A) and Light mode UI.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-[#F59E0B]" /> : <Moon className="w-5 h-5 text-[#94A3B8]" />}
            </motion.button>
          </div>
        </div>

        {/* Voice Speech Settings */}
        <div className="glass-card rounded-3xl p-6 border border-[#334155] space-y-4">
          <div className="flex items-center gap-2 font-poppins font-bold text-[#F8FAFC] text-sm">
            <Volume2 className="w-4 h-4 text-[#06B6D4]" /> Voice & Text-to-Speech Speed
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(e.target.value)}
              className="flex-1 accent-[#3B82F6]"
            />
            <span className="text-xs font-inter font-bold text-[#F8FAFC]">{speechRate}x Speed</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="px-6 py-3.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </motion.button>
      </form>
    </motion.div>
  );
}
