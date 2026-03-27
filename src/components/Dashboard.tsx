import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  LogIn,
  LogOut
} from 'lucide-react';
import { User, AttendanceRecord, Task } from '@/src/types';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState({
    employees: 0,
    attendanceToday: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalPayroll: 0
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [attLoading, setAttLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (user.role === 'employee') {
      fetchTodayAttendance();
    }
  }, [user]);

  const fetchTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await fetch(`/api/attendance?emp_id=${user.id}&date=${today}`);
      const data = await res.json();
      if (data.length > 0) {
        setTodayRecord(data[0]);
      } else {
        setTodayRecord(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    setAttLoading(true);
    try {
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emp_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm:ss')
        })
      });
      if (res.ok) {
        fetchTodayAttendance();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttLoading(true);
    try {
      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emp_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm:ss')
        })
      });
      if (res.ok) {
        fetchTodayAttendance();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [empRes, attRes, taskRes] = await Promise.all([
        fetch('/api/employees'),
        fetch(`/api/attendance?date=${format(new Date(), 'yyyy-MM-dd')}`),
        fetch(['admin', 'manager', 'supervisor'].includes(user.role) ? '/api/tasks' : `/api/tasks?emp_id=${user.id}`)
      ]);

      const employees = await empRes.json();
      const attendance = await attRes.json();
      const tasks = await taskRes.json();

      setStats({
        employees: employees.length,
        attendanceToday: attendance.length,
        pendingTasks: tasks.filter((t: Task) => t.status !== 'completed').length,
        completedTasks: tasks.filter((t: Task) => t.status === 'completed').length,
        totalPayroll: employees.reduce((acc: number, emp: User) => acc + (emp.salary || 0), 0)
      });

      setRecentTasks(tasks.slice(0, 5));
      setRecentAttendance(attendance.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    { name: 'Total Employees', value: stats.employees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', show: ['admin', 'manager'].includes(user.role) },
    { name: 'Total Payroll', value: `$${stats.totalPayroll.toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', show: user.role === 'admin' },
    { name: 'Present Today', value: stats.attendanceToday, icon: Clock, color: 'text-green-600', bg: 'bg-green-50', show: ['admin', 'manager', 'supervisor'].includes(user.role) },
    { name: 'Pending Tasks', value: stats.pendingTasks, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', show: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your work today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'employee' && (
          <div className="md:col-span-2 lg:col-span-2 bg-brand-600 p-6 rounded-2xl text-white shadow-lg shadow-brand-200 flex items-center justify-between">
            <div>
              <p className="text-brand-100 text-sm font-medium">Quick Attendance</p>
              <h2 className="text-2xl font-bold mt-1">
                {!todayRecord ? "Ready to start?" : !todayRecord.check_out ? "Working hard..." : "Done for today!"}
              </h2>
              <p className="text-brand-200 text-xs mt-1">
                {todayRecord ? `Started at ${todayRecord.check_in}` : "Mark your presence now"}
              </p>
            </div>
            <div className="flex gap-3">
              {!todayRecord ? (
                <button 
                  onClick={handleCheckIn}
                  disabled={attLoading}
                  className="px-6 py-3 bg-white text-brand-600 rounded-xl font-bold hover:bg-brand-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <LogIn size={18} />
                  Check In
                </button>
              ) : !todayRecord.check_out ? (
                <button 
                  onClick={handleCheckOut}
                  disabled={attLoading}
                  className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <LogOut size={18} />
                  Check Out
                </button>
              ) : (
                <div className="px-6 py-3 bg-brand-500/30 text-white rounded-xl font-bold border border-white/20">
                  Completed
                </div>
              )}
            </div>
          </div>
        )}
        {statCards.filter(s => s.show).map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <TrendingUp className="text-slate-300" size={20} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Tasks</h2>
            <button className="text-brand-600 text-sm font-semibold hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTasks.length > 0 ? recentTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center gap-4">
                <div className={cn(
                  "w-2 h-10 rounded-full",
                  task.status === 'completed' ? "bg-emerald-500" : task.status === 'in-progress' ? "bg-blue-500" : "bg-slate-300"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{task.task_name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded-md font-bold uppercase">
                      {task.project_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{task.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-900">{format(new Date(task.deadline), 'MMM d')}</p>
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

        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Today's Attendance</h2>
            <button className="text-brand-600 text-sm font-semibold hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAttendance.length > 0 ? recentAttendance.map((record) => (
              <div key={record.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{record.emp_name}</p>
                  <p className="text-xs text-slate-500 truncate">{record.date}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-600 font-medium">In: {record.check_in}</span>
                    {record.check_out && <span className="text-red-600 font-medium">Out: {record.check_out}</span>}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-500">No attendance records today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
