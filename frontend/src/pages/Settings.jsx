import React, { useState } from 'react';
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
    <div className="space-y-6 pb-12 max-w-3xl">
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-2">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-purple" /> Application Settings
        </h1>
        <p className="text-slate-400 text-xs">
          Manage API keys, themes, and voice text-to-speech preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Key Config */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Key className="w-4 h-4 text-brand-cyan" /> Groq API Configuration
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Enter your custom Groq API key (`gsk_...`) to power the 4 AutoGen multi-agent system models (`llama-3.3-70b-versatile`). Leave blank to use the built-in smart mock engine.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full glass-input py-2.5 px-4 rounded-xl text-xs font-mono"
            placeholder="gsk_..."
          />
        </div>

        {/* Theme Settings */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-100 text-sm">Dark Glassmorphism Theme</div>
              <p className="text-slate-400 text-xs">Toggle between Dark mode and Light mode UI.</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Voice Speech Settings */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Volume2 className="w-4 h-4 text-brand-cyan" /> Voice & Text-to-Speech Speed
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(e.target.value)}
              className="flex-1 accent-brand-500"
            />
            <span className="text-xs font-bold text-slate-200">{speechRate}x Rate</span>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </form>
    </div>
  );
}
