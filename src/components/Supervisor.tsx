import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  AlertCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  Search,
  Filter
} from 'lucide-react';
import { User, AttendanceRecord, Task } from '@/src/types';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

export default function Supervisor() {
  const [stats, setStats] = useState({
    presentToday: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, taskRes] = await Promise.all([
        fetch(`/api/attendance?date=${format(new Date(), 'yyyy-MM-dd')}`),
        fetch('/api/tasks')
      ]);

      const attendance = await attRes.json();
      const tasks = await taskRes.json();

      const pending = tasks.filter((t: Task) => t.status !== 'completed');
      const completed = tasks.filter((t: Task) => t.status === 'completed');
      const overdue = pending.filter((t: Task) => new Date(t.deadline) < new Date());

      setStats({
        presentToday: attendance.length,
        pendingTasks: pending.length,
        completedTasks: completed.length,
        overdueTasks: overdue.length
      });

      setRecentTasks(tasks.slice(0, 5));
      setRecentAttendance(attendance.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Supervisor Panel</h1>
        <p className="text-slate-500 mt-1">Manage daily operations and team tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Present Today', value: stats.presentToday, icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
          { name: 'Pending Tasks', value: stats.pendingTasks, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { name: 'Completed Tasks', value: stats.completedTasks, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { name: 'Overdue Tasks', value: stats.overdueTasks, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Today's Attendance</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                <Filter size={18} />
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAttendance.length > 0 ? recentAttendance.map((record) => (
              <div key={record.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{record.emp_name}</p>
                  <p className="text-xs text-slate-500 truncate">Checked in at {record.check_in}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold uppercase">
                    Present
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-500">No attendance records today.</div>
            )}
          </div>
        </div>

        {/* Task Oversight */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Task Oversight</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                <Search size={18} />
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTasks.length > 0 ? recentTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center gap-4">
                <div className={cn(
                  "w-2 h-10 rounded-full",
                  task.status === 'completed' ? "bg-emerald-500" : task.status === 'in-progress' ? "bg-blue-500" : "bg-slate-300"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{task.task_name}</p>
                  <p className="text-xs text-slate-500 truncate">{task.emp_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{format(new Date(task.deadline), 'MMM d')}</p>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    task.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {task.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-500">No tasks found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
