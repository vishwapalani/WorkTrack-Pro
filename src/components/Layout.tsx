import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CheckSquare, 
  Users, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { User } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Attendance', icon: Clock, path: '/attendance' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ];

  if (user.role === 'admin') {
    menuItems.push({ name: 'Admin Panel', icon: Users, path: '/admin' });
  }

  if (user.role === 'manager') {
    menuItems.push({ name: 'Manager Panel', icon: Briefcase, path: '/manager' });
  }

  if (user.role === 'supervisor') {
    menuItems.push({ name: 'Supervisor Panel', icon: ShieldCheck, path: '/supervisor' });
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">WorkTrack</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-brand-50 text-brand-600" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
                    user.role === 'admin' ? "bg-brand-50 text-brand-600" :
                    user.role === 'manager' ? "bg-indigo-50 text-indigo-600" :
                    user.role === 'supervisor' ? "bg-emerald-50 text-emerald-600" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center px-6 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
          <span className="ml-4 text-lg font-bold">WorkTrack</span>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
