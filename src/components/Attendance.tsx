import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, History, Calendar as CalendarIcon } from 'lucide-react';
import { User, AttendanceRecord } from '@/src/types';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface AttendanceProps {
  user: User;
}

export default function Attendance({ user }: AttendanceProps) {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchToday();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/attendance?emp_id=${user.id}`);
      const data = await res.json();
      setHistory(data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchToday = async () => {
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
    setLoading(true);
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
        fetchToday();
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
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
        fetchToday();
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
        <p className="text-slate-500 mt-1">Mark your daily attendance and view your history.</p>
      </div>

      {/* Action Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 lg:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-50 rounded-full text-brand-600 mb-2">
            <Clock size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{format(new Date(), 'EEEE, MMMM do')}</h2>
            <p className="text-slate-500 text-lg">{format(new Date(), 'hh:mm a')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!todayRecord ? (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all disabled:opacity-50"
              >
                <LogIn size={24} />
                Check In
              </button>
            ) : !todayRecord.check_out ? (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all disabled:opacity-50"
              >
                <LogOut size={24} />
                Check Out
              </button>
            ) : (
              <div className="px-8 py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-lg border border-emerald-100">
                Attendance Completed for Today
              </div>
            )}
          </div>

          {todayRecord && (
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Check In</p>
                <p className="text-xl font-bold text-slate-900">{todayRecord.check_in}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Check Out</p>
                <p className="text-xl font-bold text-slate-900">{todayRecord.check_out || '--:--'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <History size={20} className="text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{record.check_in}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{record.check_out || '--:--'}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      record.check_out ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {record.check_out ? 'Completed' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
