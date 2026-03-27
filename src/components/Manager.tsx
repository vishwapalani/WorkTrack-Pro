import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckSquare,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { User, AttendanceRecord, Task } from '@/src/types';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

export default function Manager() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    attendanceRate: 0,
    taskCompletion: 0
  });
  const [employees, setEmployees] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, taskRes, attRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/tasks'),
        fetch(`/api/attendance?date=${format(new Date(), 'yyyy-MM-dd')}`)
      ]);

      const emps = await empRes.json();
      const allTasks = await taskRes.json();
      const attendance = await attRes.json();

      const projects = new Set(allTasks.map((t: Task) => t.project_name)).size;
      const completed = allTasks.filter((t: Task) => t.status === 'completed').length;
      
      setEmployees(emps);
      setTasks(allTasks);
      setStats({
        totalEmployees: emps.length,
        activeProjects: projects,
        attendanceRate: emps.length > 0 ? Math.round((attendance.length / emps.length) * 100) : 0,
        taskCompletion: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manager Dashboard</h1>
        <p className="text-slate-500 mt-1">High-level overview of team performance and projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Workforce', value: stats.totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+2.5%', trendUp: true },
          { name: 'Active Projects', value: stats.activeProjects, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+1', trendUp: true },
          { name: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '-1.2%', trendUp: false },
          { name: 'Task Completion', value: `${stats.taskCompletion}%`, icon: CheckSquare, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+5.4%', trendUp: true },
        ].map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                stat.trendUp ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
              )}>
                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Project Progress</h2>
            <BarChart3 className="text-slate-400" size={20} />
          </div>
          <div className="p-6 space-y-6">
            {Array.from(new Set(tasks.map(t => t.project_name))).slice(0, 4).map(project => {
              const projectTasks = tasks.filter(t => t.project_name === project);
              const completed = projectTasks.filter(t => t.status === 'completed').length;
              const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
              
              return (
                <div key={project} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-700">{project || 'Unassigned'}</span>
                    <span className="text-slate-500">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-600 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Top Performers</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {employees.slice(0, 5).map((emp, i) => (
              <div key={emp.id} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{emp.name}</p>
                  <p className="text-xs text-slate-500 truncate">{emp.role}</p>
                </div>
                <div className="text-emerald-600">
                  <TrendingUp size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
