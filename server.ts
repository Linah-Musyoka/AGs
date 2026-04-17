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

  // Mock Data Store (In-memory for preview)
  const users = [
    { id: "1", username: "admin", password: "password123", role: "Admin", name: "System Administrator" },
    { id: "2", username: "teacher1", password: "password123", role: "Teacher", name: "Mr. Kamau", school: "Machakos High" },
    { id: "3", username: "student1", password: "password123", role: "Student", name: "Ann Wambui", class: "Form 4B" },
  ];

  const loginAttempts: Record<string, number> = {};

  // --- Auth Routes ---
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    if (loginAttempts[username] >= 5) {
      return res.status(403).json({ message: "Account locked due to too many failed attempts." });
    }

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      loginAttempts[username] = 0;
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
      return res.json({ token, user: { id: user.id, role: user.role, name: user.name } });
    } else {
      loginAttempts[username] = (loginAttempts[username] || 0) + 1;
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
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
