import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  Mail, 
  User as UserIcon,
  Search,
  Filter
} from 'lucide-react';
import { User } from '@/src/types';
import { cn } from '@/src/lib/utils';

export default function Admin() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    salary: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp)
      });
      if (res.ok) {
        setIsAdding(false);
        setNewEmp({ name: '', email: '', password: '', role: 'employee', salary: '' });
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 mt-1">Manage company employees and roles.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Register New Employee</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input 
                required
                type="text" 
                value={newEmp.name}
                onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input 
                required
                type="email" 
                value={newEmp.email}
                onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <input 
                required
                type="password" 
                value={newEmp.password}
                onChange={e => setNewEmp({...newEmp, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Role</label>
              <select 
                value={newEmp.role}
                onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Salary ($)</label>
              <input 
                required
                type="number" 
                value={newEmp.salary}
                onChange={e => setNewEmp({...newEmp, salary: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="50000"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700"
              >
                Register Employee
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-8 py-5">Employee</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Salary</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail size={12} />
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {emp.role === 'admin' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : emp.role === 'manager' ? (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                          Manager
                        </span>
                      ) : emp.role === 'supervisor' ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          Supervisor
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          Employee
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-900">
                      ${emp.salary?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Active
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
