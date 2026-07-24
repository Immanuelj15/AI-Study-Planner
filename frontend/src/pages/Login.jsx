import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, ArrowRight, Brain } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('demo@studyplanner.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back! Multi-Agent System ready.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center p-6 selection:bg-[#2563EB] font-inter">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 border border-[#E2E8F0] max-w-md w-full space-y-6 shadow-soft bg-[#FFFFFF]"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-poppins text-2xl font-black text-[#1E293B]">Welcome Back</h2>
          <p className="text-[#64748B] font-inter text-xs">Sign in to access your AI Multi-Agent Study Command Center.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-inter font-bold text-[#1E293B]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input py-2.5 pl-10 pr-4 rounded-2xl text-xs font-inter bg-[#F8FBFF]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-inter font-bold text-[#1E293B]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input py-2.5 pl-10 pr-4 rounded-2xl text-xs font-inter bg-[#F8FBFF]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl btn-gradient-primary text-xs font-inter font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="text-center text-xs font-inter text-[#64748B]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2563EB] font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
