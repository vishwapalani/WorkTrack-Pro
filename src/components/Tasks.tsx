import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Trash2,
  Calendar as CalendarIcon,
  Loader2,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Task } from '@/src/types';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface TasksProps {
  user: User;
}

export default function Tasks({ user }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [newTask, setNewTask] = useState({
    task_name: '',
    project_name: '',
    description: '',
    deadline: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(['admin', 'manager', 'supervisor'].includes(user.role) ? '/api/tasks' : `/api/tasks?emp_id=${user.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          emp_id: user.id
        })
      });
      if (res.ok) {
        setIsAdding(false);
        setNewTask({ task_name: '', project_name: '', description: '', deadline: format(new Date(), 'yyyy-MM-dd') });
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage your daily work and track progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold",
                viewMode === 'list' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ListIcon size={16} />
              List
            </button>
            <button 
              onClick={() => setViewMode('board')}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold",
                viewMode === 'board' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid size={16} />
              Board
            </button>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Task Name</label>
                <input 
                  required
                  type="text" 
                  value={newTask.task_name}
                  onChange={e => setNewTask({...newTask, task_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Project</label>
                <input 
                  required
                  type="text" 
                  value={newTask.project_name}
                  onChange={e => setNewTask({...newTask, project_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="Project Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Deadline</label>
                <input 
                  required
                  type="date" 
                  value={newTask.deadline}
                  onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Description</label>
              <textarea 
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none min-h-[100px]"
                placeholder="Add some details..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <motion.div 
              layout
              key={task.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row md:items-center gap-6",
                task.status === 'completed' && "opacity-75"
              )}
            >
              <button 
                onClick={() => updateStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                  task.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
                )}
              >
                {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn(
                    "text-lg font-bold text-slate-900 truncate",
                    task.status === 'completed' && "line-through text-slate-400"
                  )}>
                    {task.task_name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-bold uppercase">
                    {task.project_name}
                  </span>
                  {['admin', 'manager', 'supervisor'].includes(user.role) && (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase">
                      {task.emp_name}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm line-clamp-2">{task.description}</p>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarIcon size={14} />
                  <span className="text-xs font-medium">{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {[
                    { id: 'pending', label: 'Pending', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
                    { id: 'completed', label: 'Completed', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' }
                  ].map((status) => (
                    <motion.button
                      key={status.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateStatus(task.id, status.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5",
                        task.status === status.id 
                          ? cn(status.bg, status.text, "shadow-sm ring-1 ring-slate-200") 
                          : "text-slate-400 hover:text-slate-600 hover:bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        task.status === status.id ? status.color : "bg-slate-300"
                      )} />
                      {status.label}
                    </motion.button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {tasks.length === 0 && (
            <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                <CheckSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No tasks yet</h3>
              <p className="text-slate-500">Get started by creating your first task.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {[
            { id: 'pending', label: 'Pending', color: 'bg-amber-500', bg: 'bg-amber-50/50' },
            { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500', bg: 'bg-blue-50/50' },
            { id: 'completed', label: 'Completed', color: 'bg-emerald-500', bg: 'bg-emerald-50/50' }
          ].map((column) => (
            <div key={column.id} className={cn("rounded-3xl p-4 min-h-[500px]", column.bg)}>
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", column.color)} />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">{column.label}</h3>
                  <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 shadow-sm">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {tasks.filter(t => t.status === column.id).map((task) => (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -2 }}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-bold uppercase">
                          {task.project_name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{task.task_name}</h4>
                      <p className="text-slate-500 text-xs line-clamp-2 mb-3">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <CalendarIcon size={12} />
                          <span className="text-[10px] font-medium">{format(new Date(task.deadline), 'MMM d')}</span>
                        </div>
                        {['admin', 'manager', 'supervisor'].includes(user.role) && (
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {task.emp_name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-slate-50">
                        {['pending', 'in-progress', 'completed'].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(task.id, s)}
                            className={cn(
                              "h-1 rounded-full transition-all",
                              task.status === s 
                                ? (s === 'pending' ? 'bg-amber-400' : s === 'in-progress' ? 'bg-blue-400' : 'bg-emerald-400')
                                : 'bg-slate-100 hover:bg-slate-200'
                            )}
                            title={s.replace('-', ' ')}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
