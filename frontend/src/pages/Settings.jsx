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
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] space-y-2 shadow-soft bg-[#FFFFFF]">
        <h1 className="font-poppins text-2xl font-black text-[#1E293B] flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#2563EB]" /> Platform Settings
        </h1>
        <p className="text-[#64748B] font-inter text-xs">
          Configure Groq LLM API keys, dark/light themes, and voice speech rate settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Key Config */}
        <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] space-y-4 bg-[#FFFFFF]">
          <div className="flex items-center gap-2 font-poppins font-bold text-[#1E293B] text-sm">
            <Key className="w-4 h-4 text-[#2563EB]" /> Groq API Key Configuration
          </div>
          <p className="text-[#64748B] font-inter text-xs leading-relaxed">
            Enter your custom Groq API key (`gsk_...`) to power Microsoft AutoGen multi-agent system models (`llama-3.3-70b-versatile`).
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full glass-input py-3 px-4 rounded-2xl text-xs font-mono text-[#1E293B] bg-[#F8FBFF]"
            placeholder="gsk_..."
          />
        </div>

        {/* Theme Settings */}
        <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] space-y-4 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-poppins font-bold text-[#1E293B] text-sm">Theme Appearance</div>
              <p className="text-[#64748B] font-inter text-xs mt-0.5">Toggle between Light Theme (White & Light Blue) and Dark Mode.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#1E293B] border border-[#E2E8F0] transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-[#F59E0B]" /> : <Moon className="w-5 h-5 text-[#64748B]" />}
            </motion.button>
          </div>
        </div>

        {/* Voice Speech Settings */}
        <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] space-y-4 bg-[#FFFFFF]">
          <div className="flex items-center gap-2 font-poppins font-bold text-[#1E293B] text-sm">
            <Volume2 className="w-4 h-4 text-[#2563EB]" /> Voice & Text-to-Speech Speed
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(e.target.value)}
              className="flex-1 accent-[#2563EB]"
            />
            <span className="text-xs font-inter font-bold text-[#1E293B]">{speechRate}x Speed</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="px-6 py-3.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </motion.button>
      </form>
    </motion.div>
  );
}
