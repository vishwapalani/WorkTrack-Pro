import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";

// Initialize Database
const db = new Database("worktrack.db");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'employee',
    salary REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    FOREIGN KEY (emp_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER NOT NULL,
    task_name TEXT NOT NULL,
    project_name TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    deadline TEXT,
    FOREIGN KEY (emp_id) REFERENCES employees(id)
  );
`);

// Migration: Add salary column if it doesn't exist
try {
  db.prepare("SELECT salary FROM employees LIMIT 1").get();
} catch (e) {
  console.log("Adding salary column to employees table...");
  db.prepare("ALTER TABLE employees ADD COLUMN salary REAL DEFAULT 0").run();
}

// Migration: Add project_name column if it doesn't exist
try {
  db.prepare("SELECT project_name FROM tasks LIMIT 1").get();
} catch (e) {
  console.log("Adding project_name column to tasks table...");
  db.prepare("ALTER TABLE tasks ADD COLUMN project_name TEXT").run();
}

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM employees WHERE role = 'admin'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO employees (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Admin User",
    "admin@worktrack.com",
    hashedPassword,
    "admin"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM employees WHERE email = ?").get(email) as any;

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post("/api/register", (req, res) => {
    const { name, email, password, role, salary } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare("INSERT INTO employees (name, email, password, role, salary) VALUES (?, ?, ?, ?, ?)").run(
        name,
        email,
        hashedPassword,
        role || "employee",
        salary || 0
      );
      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  // Employees
  app.get("/api/employees", (req, res) => {
    const employees = db.prepare("SELECT id, name, email, role, salary FROM employees").all();
    res.json(employees);
  });

  app.delete("/api/employees/:id", (req, res) => {
    db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Attendance
  app.get("/api/attendance", (req, res) => {
    const { emp_id, date } = req.query;
    let query = "SELECT a.*, e.name as emp_name FROM attendance a JOIN employees e ON a.emp_id = e.id";
    const params = [];

    if (emp_id || date) {
      query += " WHERE";
      if (emp_id) {
        query += " a.emp_id = ?";
        params.push(emp_id);
      }
      if (date) {
        if (emp_id) query += " AND";
        query += " a.date = ?";
        params.push(date);
      }
    }

    const records = db.prepare(query).all(...params);
    res.json(records);
  });

  app.post("/api/attendance/check-in", (req, res) => {
    const { emp_id, date, time } = req.body;
    const existing = db.prepare("SELECT * FROM attendance WHERE emp_id = ? AND date = ?").get(emp_id, date);
    
    if (existing) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    db.prepare("INSERT INTO attendance (emp_id, date, check_in) VALUES (?, ?, ?)").run(emp_id, date, time);
    res.json({ success: true });
  });

  app.post("/api/attendance/check-out", (req, res) => {
    const { emp_id, date, time } = req.body;
    const result = db.prepare("UPDATE attendance SET check_out = ? WHERE emp_id = ? AND date = ? AND check_out IS NULL").run(time, emp_id, date);
    
    if (result.changes === 0) {
      return res.status(400).json({ error: "No active check-in found" });
    }
    res.json({ success: true });
  });

  // Tasks
  app.get("/api/tasks", (req, res) => {
    const { emp_id } = req.query;
    let query = "SELECT t.*, e.name as emp_name FROM tasks t JOIN employees e ON t.emp_id = e.id";
    const params = [];

    if (emp_id) {
      query += " WHERE t.emp_id = ?";
      params.push(emp_id);
    }

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { emp_id, task_name, project_name, description, deadline } = req.body;
    db.prepare("INSERT INTO tasks (emp_id, task_name, project_name, description, deadline) VALUES (?, ?, ?, ?, ?)").run(
      emp_id,
      task_name,
      project_name,
      description,
      deadline
    );
    res.json({ success: true });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
