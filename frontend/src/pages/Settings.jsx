import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { llmConfigAPI } from '../services/api';
import {
  Settings as SettingsIcon,
  Key,
  Sun,
  Moon,
  Volume2,
  Save,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Server,
  Cpu,
  Layers,
  Activity,
  Info,
  Building2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Settings() {
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Active settings tab: 'llm' or 'preferences'
  const [activeTab, setActiveTab] = useState('llm');

  // Multi-Provider LLM state
  const [providers, setProviders] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState('personal'); // 'personal' or 'college'

  // Personal form state
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  // College Admin state (if user is College Admin / Platform Admin)
  const isCollegeAdmin = user?.role === 'College Admin' || user?.role === 'Platform Admin';
  const [llmScopeView, setLlmScopeView] = useState('personal'); // 'personal' or 'college'
  const [collegeConfig, setCollegeConfig] = useState(null);
  const [collegeProvider, setCollegeProvider] = useState('openai');
  const [collegeModel, setCollegeModel] = useState('');
  const [collegeApiKey, setCollegeApiKey] = useState('');
  const [showCollegeApiKey, setShowCollegeApiKey] = useState(false);
  const [collegeBaseUrl, setCollegeBaseUrl] = useState('');

  // Usage statistics
  const [usageStats, setUsageStats] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Preference states
  const [speechRate, setSpeechRate] = useState(localStorage.getItem('speech_rate') || '1.0');

  // Load LLM providers and configuration
  useEffect(() => {
    fetchLLMData();
  }, []);

  const fetchLLMData = async () => {
    setLoading(true);
    try {
      const [provRes, configRes] = await Promise.all([
        llmConfigAPI.getProviders(),
        llmConfigAPI.getConfig()
      ]);

      const provList = provRes.data || [];
      setProviders(provList);
      setActiveConfig(configRes.data);

      // Pre-fill personal form
      const personal = configRes.data?.personal_config;
      if (personal) {
        setSelectedProvider(personal.provider);
        setSelectedModel(personal.model_name);
        setApiBaseUrl(personal.api_base_url || '');
      } else {
        const defaultProv = provList.find(p => p.id === 'groq') || provList[0];
        if (defaultProv) {
          setSelectedProvider(defaultProv.id);
          setSelectedModel(defaultProv.default_model);
          setApiBaseUrl(defaultProv.default_base_url || '');
        }
      }

      // Pre-fill college form if admin
      if (isCollegeAdmin) {
        try {
          const colRes = await llmConfigAPI.getCollegeConfig();
          setCollegeConfig(colRes.data);
          if (colRes.data) {
            setCollegeProvider(colRes.data.provider);
            setCollegeModel(colRes.data.model_name);
            setCollegeBaseUrl(colRes.data.api_base_url || '');
          }
        } catch (e) {
          // If not configured, silent
        }
      }

      // Fetch usage stats
      fetchUsage();
    } catch (err) {
      console.error('Failed to load LLM configurations:', err);
      addToast('Could not load AI provider settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    setLoadingUsage(true);
    try {
      const res = await llmConfigAPI.getUsage();
      setUsageStats(res.data);
    } catch (e) {
      console.error('Failed to load usage stats:', e);
    } finally {
      setLoadingUsage(false);
    }
  };

  // Sync default model when provider changes in personal view
  const handleProviderChange = (newProviderId) => {
    setSelectedProvider(newProviderId);
    const provMeta = providers.find(p => p.id === newProviderId);
    if (provMeta) {
      setSelectedModel(provMeta.default_model);
      setApiBaseUrl(provMeta.default_base_url || '');
    }
    setTestResult(null);
  };

  // Sync default model when provider changes in college view
  const handleCollegeProviderChange = (newProviderId) => {
    setCollegeProvider(newProviderId);
    const provMeta = providers.find(p => p.id === newProviderId);
    if (provMeta) {
      setCollegeModel(provMeta.default_model);
      setCollegeBaseUrl(provMeta.default_base_url || '');
    }
    setTestResult(null);
  };

  // Test Connection
  const handleTestConnection = async (isCollege = false) => {
    setTesting(true);
    setTestResult(null);

    const providerId = isCollege ? collegeProvider : selectedProvider;
    const model = isCollege
      ? (collegeModel === 'custom' ? customModel : collegeModel)
      : (selectedModel === 'custom' ? customModel : selectedModel);
    const key = isCollege ? collegeApiKey : apiKey;
    const baseUrl = isCollege ? collegeBaseUrl : apiBaseUrl;

    const payload = {
      provider: providerId,
      model_name: model,
      api_base_url: baseUrl || null,
      api_key: key || null,
      use_stored_key: !key // if input is empty, test with existing stored key
    };

    try {
      const res = await llmConfigAPI.testConnection(payload);
      setTestResult(res.data);
      if (res.data.success) {
        addToast(`Connection Verified! (${res.data.latency_ms}ms)`, 'success');
      } else {
        addToast(res.data.message || 'Connection test failed', 'error');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Connection test failed';
      setTestResult({
        success: false,
        message: errMsg,
        latency_ms: 0,
        provider: providerId,
        model
      });
      addToast(errMsg, 'error');
    } finally {
      setTesting(false);
    }
  };

  // Save Personal Configuration
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    const provMeta = providers.find(p => p.id === selectedProvider);
    const finalModel = selectedModel === 'custom' ? customModel : selectedModel;

    if (provMeta?.requires_api_key && !apiKey && !activeConfig?.personal_config?.has_api_key) {
      addToast(`API Key is required for ${provMeta.name}`, 'error');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        provider: selectedProvider,
        model_name: finalModel,
        api_key: apiKey || null,
        api_base_url: apiBaseUrl || null
      };

      await llmConfigAPI.saveConfig(payload);
      addToast('Personal AI Provider configured successfully!', 'success');
      setApiKey(''); // Clear entered raw key for security
      fetchLLMData();
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Failed to save configuration';
      addToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save College Configuration
  const handleSaveCollege = async (e) => {
    e.preventDefault();
    setSaving(true);
    const provMeta = providers.find(p => p.id === collegeProvider);
    const finalModel = collegeModel === 'custom' ? customModel : collegeModel;

    if (provMeta?.requires_api_key && !collegeApiKey && !collegeConfig?.has_api_key) {
      addToast(`API Key is required for college-level ${provMeta.name}`, 'error');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        provider: collegeProvider,
        model_name: finalModel,
        api_key: collegeApiKey || null,
        api_base_url: collegeBaseUrl || null
      };

      await llmConfigAPI.saveCollegeConfig(payload);
      addToast(`College AI Key saved for ${user?.college_id || 'Campus'}!`, 'success');
      setCollegeApiKey('');
      fetchLLMData();
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Failed to save college configuration';
      addToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Configuration
  const handleConfirmDelete = async () => {
    try {
      if (deleteTarget === 'personal') {
        await llmConfigAPI.deleteConfig();
        addToast('Personal API key deleted. Reverted to College/Platform default.', 'info');
      } else {
        await llmConfigAPI.deleteCollegeConfig();
        addToast('College API key deleted.', 'info');
      }
      setShowDeleteConfirm(false);
      fetchLLMData();
    } catch (err) {
      addToast('Failed to delete configuration', 'error');
    }
  };

  // Save Preferences
  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('speech_rate', speechRate);
    addToast('Preferences saved successfully!', 'success');
  };

  const currentProviderMeta = providers.find(p => p.id === (llmScopeView === 'personal' ? selectedProvider : collegeProvider));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-16 max-w-5xl mx-auto"
    >
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] shadow-soft bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl font-black text-[#1E293B] flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-[#2563EB]" /> Platform Settings & AI Providers
          </h1>
          <p className="text-[#64748B] font-inter text-xs mt-1">
            Configure BYOK (Bring Your Own Key) LLM providers, college keys, and learning preferences.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] p-1.5 rounded-2xl border border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('llm')}
            className={`px-4 py-2 rounded-xl text-xs font-inter font-bold transition-all flex items-center gap-2 ${
              activeTab === 'llm'
                ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> AI Providers & Keys
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-xl text-xs font-inter font-bold transition-all flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'bg-[#FFFFFF] text-[#2563EB] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> Preferences & Voice
          </button>
        </div>
      </div>

      {activeTab === 'llm' && (
        <div className="space-y-6">
          {/* Active Provider Status Banner */}
          <div className="glass-card rounded-3xl p-6 border border-[#E2E8F0] shadow-soft bg-gradient-to-r from-[#F8FBFF] to-[#EFF6FF]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shrink-0 border border-[#2563EB]/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-poppins font-bold text-sm text-[#1E293B]">Active AI Provider:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#2563EB] text-white uppercase shadow-sm">
                      {activeConfig?.effective_provider || 'Loading...'}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#64748B]">
                      ({activeConfig?.effective_model || 'default model'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs font-inter">
                    <span className="text-[#64748B]">Resolution Source:</span>
                    {activeConfig?.effective_scope === 'PERSONAL' && (
                      <span className="inline-flex items-center gap-1 text-[#059669] font-bold bg-[#ECFDF5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Personal Student Key (Highest Priority)
                      </span>
                    )}
                    {activeConfig?.effective_scope === 'COLLEGE' && (
                      <span className="inline-flex items-center gap-1 text-[#2563EB] font-bold bg-[#EFF6FF] px-2.5 py-0.5 rounded-md border border-[#BFDBFE]">
                        <Building2 className="w-3.5 h-3.5" /> College-Wide Shared Provider ({user?.college_id || 'College'})
                      </span>
                    )}
                    {activeConfig?.effective_scope === 'PLATFORM_DEFAULT' && (
                      <span className="inline-flex items-center gap-1 text-[#D97706] font-bold bg-[#FFFBEB] px-2.5 py-0.5 rounded-md border border-[#FDE68A]">
                        <Server className="w-3.5 h-3.5" /> Platform Default Fallback (Groq Cloud)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {activeConfig?.masked_api_key && (
                <div className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-2 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <div className="text-right">
                    <div className="text-[10px] font-inter text-[#64748B] uppercase tracking-wider font-semibold">Active Key (Encrypted)</div>
                    <div className="text-xs font-mono font-bold text-[#1E293B]">{activeConfig.masked_api_key}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scope Toggle for College Admins */}
          {isCollegeAdmin && (
            <div className="glass-card rounded-2xl p-2 border border-[#E2E8F0] bg-[#FFFFFF] flex items-center gap-2 max-w-md">
              <button
                type="button"
                onClick={() => setLlmScopeView('personal')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-inter font-bold transition-all flex items-center justify-center gap-1.5 ${
                  llmScopeView === 'personal'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <Key className="w-3.5 h-3.5" /> My Personal API Key
              </button>
              <button
                type="button"
                onClick={() => setLlmScopeView('college')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-inter font-bold transition-all flex items-center justify-center gap-1.5 ${
                  llmScopeView === 'college'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> College Administrator Key
              </button>
            </div>
          )}

          {/* Main Configuration Form */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] shadow-soft bg-[#FFFFFF] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-poppins font-bold text-lg text-[#1E293B] flex items-center gap-2">
                  {llmScopeView === 'personal' ? (
                    <>
                      <Key className="w-5 h-5 text-[#2563EB]" /> Configure Personal AI Provider
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5 text-[#2563EB]" /> Configure College-Wide AI Provider ({user?.college_id})
                    </>
                  )}
                </h2>
                <p className="text-[#64748B] font-inter text-xs mt-1">
                  {llmScopeView === 'personal'
                    ? "Connect your personal LLM API key. All AI agents, quizzes, and tutors will prioritize this provider."
                    : "Configure a shared LLM provider for all students registered under your institution."}
                </p>
              </div>

              {/* Delete button if already configured */}
              {((llmScopeView === 'personal' && activeConfig?.personal_config?.has_api_key) ||
                (llmScopeView === 'college' && collegeConfig?.has_api_key)) && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(llmScopeView);
                    setShowDeleteConfirm(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-inter font-bold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Key
                </button>
              )}
            </div>

            {/* Provider Cards Selection */}
            <div className="space-y-3">
              <label className="font-poppins font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                1. Select AI Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {providers.map((p) => {
                  const isSelected = (llmScopeView === 'personal' ? selectedProvider : collegeProvider) === p.id;
                  return (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => (llmScopeView === 'personal' ? handleProviderChange(p.id) : handleCollegeProviderChange(p.id))}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm ring-2 ring-[#2563EB]/20'
                          : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-poppins font-bold text-sm text-[#1E293B]">{p.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />}
                        </div>
                        <p className="text-[#64748B] font-inter text-[11px] mt-1.5 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E2E8F0]/60 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                        <span>{p.requires_api_key ? 'Requires Key' : 'No Key Req.'}</span>
                        <span>{p.supported_models.length} Models</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Model Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="font-poppins font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                  2. Select Model
                </label>
                <select
                  value={llmScopeView === 'personal' ? selectedModel : collegeModel}
                  onChange={(e) => (llmScopeView === 'personal' ? setSelectedModel(e.target.value) : setCollegeModel(e.target.value))}
                  className="w-full glass-input py-3 px-4 rounded-2xl text-xs font-mono text-[#1E293B] bg-[#F8FBFF] border border-[#E2E8F0] focus:border-[#2563EB]"
                >
                  {currentProviderMeta?.supported_models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="custom">-- Custom Model Name --</option>
                </select>
              </div>

              {(llmScopeView === 'personal' ? selectedModel : collegeModel) === 'custom' && (
                <div className="space-y-2">
                  <label className="font-poppins font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                    Custom Model Identifier
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. meta-llama/llama-3-8b-instruct"
                    className="w-full glass-input py-3 px-4 rounded-2xl text-xs font-mono text-[#1E293B] bg-[#F8FBFF] border border-[#E2E8F0]"
                  />
                </div>
              )}

              {/* Base URL (if applicable, e.g. Ollama or OpenRouter) */}
              {currentProviderMeta?.has_base_url && (
                <div className="space-y-2">
                  <label className="font-poppins font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                    API Base Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={llmScopeView === 'personal' ? apiBaseUrl : collegeBaseUrl}
                    onChange={(e) => (llmScopeView === 'personal' ? setApiBaseUrl(e.target.value) : setCollegeBaseUrl(e.target.value))}
                    placeholder={currentProviderMeta.default_base_url || 'http://localhost:11434'}
                    className="w-full glass-input py-3 px-4 rounded-2xl text-xs font-mono text-[#1E293B] bg-[#F8FBFF] border border-[#E2E8F0]"
                  />
                </div>
              )}
            </div>

            {/* API Key Input */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-poppins font-bold text-xs text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2563EB]" /> 3. Enter API Key
                </label>
                {/* Masked preview badge if exists */}
                {((llmScopeView === 'personal' && activeConfig?.personal_config?.masked_api_key) ||
                  (llmScopeView === 'college' && collegeConfig?.masked_api_key)) && (
                  <span className="text-xs font-mono text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-lg border border-[#A7F3D0]">
                    Configured: {llmScopeView === 'personal' ? activeConfig?.personal_config?.masked_api_key : collegeConfig?.masked_api_key}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showApiKey || showCollegeApiKey ? 'text' : 'password'}
                  value={llmScopeView === 'personal' ? apiKey : collegeApiKey}
                  onChange={(e) => (llmScopeView === 'personal' ? setApiKey(e.target.value) : setCollegeApiKey(e.target.value))}
                  placeholder={
                    currentProviderMeta?.requires_api_key
                      ? (activeConfig?.personal_config?.has_api_key
                          ? 'Leave blank to keep existing key, or enter new key to update...'
                          : `Enter your ${currentProviderMeta?.name} API key...`)
                      : '(No API Key required for local Ollama)'
                  }
                  className="w-full glass-input py-3.5 px-4 pr-12 rounded-2xl text-xs font-mono text-[#1E293B] bg-[#F8FBFF] border border-[#E2E8F0] focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (llmScopeView === 'personal') setShowApiKey(!showApiKey);
                    else setShowCollegeApiKey(!showCollegeApiKey);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
                >
                  {showApiKey || showCollegeApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[#64748B] font-inter text-[11px] leading-relaxed flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" /> Keys are encrypted at rest with AES-128 Fernet and never returned or exposed in frontend state.
              </p>
            </div>

            {/* Test Connection Banner */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs font-inter flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                    : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{testResult.success ? 'Connection Successful' : 'Connection Failed'}</span>
                    {testResult.latency_ms > 0 && (
                      <span className="font-mono text-[10px] bg-white/70 px-2 py-0.5 rounded">
                        Latency: {testResult.latency_ms}ms
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[11px]">{testResult.message}</div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E2E8F0]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={testing}
                onClick={() => handleTestConnection(llmScopeView === 'college')}
                className="px-5 py-3 rounded-2xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-xs font-inter font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {testing ? 'Testing Reachability...' : 'Test Connection'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={saving}
                onClick={llmScopeView === 'personal' ? handleSavePersonal : handleSaveCollege}
                className="px-6 py-3 rounded-2xl btn-gradient-primary text-white text-xs font-inter font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving & Encrypting...' : (llmScopeView === 'personal' ? 'Save Personal Configuration' : 'Save College Configuration')}
              </motion.button>
            </div>
          </div>

          {/* Usage Telemetry & Provider Breakdown Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] shadow-soft bg-[#FFFFFF] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-base text-[#1E293B] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#2563EB]" /> AI Request Telemetry & Token Logs
                </h3>
                <p className="text-[#64748B] font-inter text-xs mt-0.5">
                  Real-time token usage, success rate, and provider activity recorded in AIUsageLog.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchUsage}
                disabled={loadingUsage}
                className="p-2 rounded-xl bg-[#F8FBFF] hover:bg-[#EFF6FF] text-[#64748B] hover:text-[#1E293B] border border-[#E2E8F0] transition-colors"
                title="Refresh Usage Stats"
              >
                <RefreshCw className={`w-4 h-4 ${loadingUsage ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                <div className="text-[10px] font-inter uppercase font-semibold text-[#64748B]">Total Requests</div>
                <div className="font-poppins font-black text-xl text-[#1E293B] mt-1">
                  {usageStats?.total_requests || 0}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                <div className="text-[10px] font-inter uppercase font-semibold text-[#64748B]">Tokens Consumed</div>
                <div className="font-poppins font-black text-xl text-[#2563EB] mt-1">
                  {(usageStats?.total_tokens || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                <div className="text-[10px] font-inter uppercase font-semibold text-[#64748B]">Success Rate</div>
                <div className="font-poppins font-black text-xl text-[#059669] mt-1">
                  {usageStats?.success_rate || 100}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E2E8F0]">
                <div className="text-[10px] font-inter uppercase font-semibold text-[#64748B]">Cached Responses</div>
                <div className="font-poppins font-black text-xl text-[#8B5CF6] mt-1">
                  {usageStats?.cached_requests || 0}
                </div>
              </div>
            </div>

            {/* Provider Breakdown List */}
            {usageStats?.breakdown_by_provider && Object.keys(usageStats.breakdown_by_provider).length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="font-poppins font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                  Breakdown by Active Provider
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(usageStats.breakdown_by_provider).map(([prov, data]) => (
                    <div key={prov} className="p-3.5 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-[#1E293B] uppercase">{prov}</div>
                        <div className="text-[10px] text-[#64748B] mt-0.5">{data.requests} calls ({data.total_tokens.toLocaleString()} tok)</div>
                      </div>
                      {data.errors > 0 ? (
                        <span className="text-[10px] font-mono font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded">
                          {data.errors} err
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                          Healthy
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="space-y-6">
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
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E2E8F0] shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 text-[#DC2626]">
                <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] flex items-center justify-center border border-[#FECACA]">
                  <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-base text-[#1E293B]">Delete API Key?</h4>
                  <p className="text-[#64748B] font-inter text-xs">
                    {deleteTarget === 'personal'
                      ? "Your personal LLM key will be deleted. You will immediately revert to your college or platform default."
                      : "The college-wide LLM key will be deleted for all affiliated students."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-inter font-bold text-[#64748B] hover:text-[#1E293B] bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-xl text-xs font-inter font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] shadow-sm"
                >
                  Yes, Delete Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
