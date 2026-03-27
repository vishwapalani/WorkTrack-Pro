export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'manager' | 'supervisor';
  salary?: number;
}

export interface AttendanceRecord {
  id: number;
  emp_id: number;
  emp_name?: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
}

export interface Task {
  id: number;
  emp_id: number;
  emp_name?: string;
  task_name: string;
  project_name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: string;
}
