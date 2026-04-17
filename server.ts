import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "textags-super-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Mock Data Store
  const users = [
    { id: "1", username: "admin", password: "password123", role: "Admin", name: "System Administrator" },
    { id: "2", username: "teacher1", password: "password123", role: "Teacher", name: "Mr. Kamau", school: "Machakos High" },
    { id: "3", username: "student1", password: "password123", role: "Student", name: "Ann Wambui", class: "Form 4B" },
  ];

  // Enhanced Question Bank
  let questions = [
    { id: "q1", text: "What is the capital of Kenya?", type: "ShortAnswer", maxMarks: 5, correctKey: "Nairobi", rubric: "Exact name required. spelling counts.", topic: "Geography", difficulty: "Easy", status: "ready-to-use" },
    { id: "q2", text: "Discuss the impacts of industrialization on Nairobi's environment.", type: "Essay", maxMarks: 20, rubric: "Must mention pollution, urban migration, and waste management.", topic: "Social Studies", difficulty: "Hard", status: "ready-to-use" },
    { id: "q3", text: "What is 2 + 2?", type: "MCQ", maxMarks: 2, correctKey: "4", rubric: "Mathematical precision.", topic: "Mathematics", difficulty: "Easy", status: "ready-to-use" }
  ];

  let submissions: any[] = [];

  const loginAttempts: Record<string, number> = {};

  // --- Auth Routes ---
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    // Objective f1: Account lockout logic
    if (loginAttempts[username] >= 5) {
      console.error(`ALERT: Security Lockout for user ${username}. Notifying Administrator.`);
      return res.status(403).json({ message: "Account locked after 5 failed attempts. Please notify admin." });
    }

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      loginAttempts[username] = 0;
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
      return res.json({ token, user: { id: user.id, role: user.role, name: user.name } });
    } else {
      loginAttempts[username] = (loginAttempts[username] || 0) + 1;
      const remaining = 5 - loginAttempts[username];
      return res.status(401).json({ message: `Invalid credentials. ${remaining} attempts remaining.` });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  // --- Question Bank API (Objective f2) ---
  app.get("/api/questions", (req, res) => {
    res.json(questions);
  });

  app.post("/api/questions", (req, res) => {
    const newQ = { ...req.body, id: `q${questions.length + 1}`, status: "ready-to-use" };
    questions.push(newQ);
    res.json(newQ);
  });

  // --- Submission API (Objective f3) ---
  app.get("/api/submissions", (req, res) => {
    res.json(submissions);
  });

  app.post("/api/submissions", (req, res) => {
    const { studentId, studentName, questionId, answer } = req.body;
    const question = questions.find(q => q.id === questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const newSub = {
      id: `s${submissions.length + 1}`,
      studentId,
      studentName,
      questionId,
      answer,
      type: question.type,
      maxMarks: question.maxMarks,
      topic: question.topic,
      status: "Pending",
      submittedAt: new Date().toISOString()
    };
    submissions.push(newSub);
    res.json(newSub);
  });

  // Update submission (Grading)
  app.put("/api/submissions/:id", (req, res) => {
    const index = submissions.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Submission not found" });
    submissions[index] = { ...submissions[index], ...req.body, status: "Graded", gradedAt: new Date().toISOString() };
    res.json(submissions[index]);
  });

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Vite Middleware ---
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
    console.log(`TextAGS Server running on http://localhost:${PORT}`);
  });
}

startServer();
