import React, { useState } from 'react';
import { LogIn, Mail, Lock, ShieldCheck, Briefcase, Shield, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

type LoginMode = 'employee' | 'manager' | 'supervisor' | 'admin';

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<LoginMode>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        // Optional: Check if the logged in user's role matches the selected mode
        // For now, we allow any valid login but the UI reflects the intent
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = {
    employee: {
      title: 'Staff Portal',
      subtitle: 'Sign in to track your work',
      color: 'bg-brand-600',
      shadow: 'shadow-brand-200',
      ring: 'focus:ring-brand-500',
      icon: UserIcon,
      accent: 'text-brand-600'
    },
    manager: {
      title: 'Manager Console',
      subtitle: 'Oversee team performance',
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-200',
      ring: 'focus:ring-indigo-500',
      icon: Briefcase,
      accent: 'text-indigo-600'
    },
    supervisor: {
      title: 'Supervisor Panel',
      subtitle: 'Manage daily operations',
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200',
      ring: 'focus:ring-emerald-500',
      icon: Shield,
      accent: 'text-emerald-600'
    },
    admin: {
      title: 'Admin Control',
      subtitle: 'Full system management',
      color: 'bg-slate-900',
      shadow: 'shadow-slate-200',
      ring: 'focus:ring-slate-900',
      icon: ShieldCheck,
      accent: 'text-slate-900'
    }
  };

  const current = modeConfig[mode];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200 mb-6 shadow-sm">
          {(['employee', 'manager', 'supervisor', 'admin'] as LoginMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
                mode === m 
                  ? cn("bg-white text-slate-900 shadow-sm border border-slate-100", modeConfig[m].accent)
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div 
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center text-center mb-10"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 transition-colors duration-500",
                  current.color,
                  current.shadow
                )}>
                  <current.icon size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{current.title}</h1>
                <p className="text-slate-500 mt-2 font-medium">{current.subtitle}</p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={cn(
                      "w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium transition-all",
                      current.ring
                    )}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={cn(
                      "w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium transition-all",
                      current.ring
                    )}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-4 text-white rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98] disabled:opacity-50",
                  current.color,
                  current.shadow
                )}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Demo {mode.charAt(0).toUpperCase() + mode.slice(1)}: <span className="text-slate-600 font-bold">{mode}@worktrack.com</span> / <span className="text-slate-600 font-bold">{mode}123</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
