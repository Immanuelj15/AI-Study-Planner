import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      addToast('Account created! Welcome to AI Multi-Agent Study Planner.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-6 selection:bg-[#2563EB] font-inter">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 border border-[#E2E8F0] max-w-md w-full space-y-6 shadow-soft bg-[#FFFFFF]"
      >
        <div className="text-center space-y-3">
          <img 
            src="/logo.png" 
            alt="StudyAgent Logo" 
            className="w-16 h-16 rounded-2xl mx-auto object-cover shadow-md border border-[#DBEAFE]" 
          />
          <div>
            <h2 className="font-poppins text-2xl font-black text-[#1E293B]">Create Account</h2>
            <p className="text-[#64748B] font-inter text-xs mt-1">Join thousands of students using Multi-Agent AI Study Planning.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-inter font-bold text-[#1E293B]">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input py-2.5 pl-10 pr-4 rounded-2xl text-xs font-inter bg-[#F8FBFF]"
                placeholder="Alex Mercer"
              />
            </div>
          </div>

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
                placeholder="alex@example.com"
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
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="text-center text-xs font-inter text-[#64748B]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2563EB] font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
