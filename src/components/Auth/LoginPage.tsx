import React, { useState } from "react";
import { User } from "../../types";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-bg flex items-center justify-center p-8 border-[20px] border-white/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white border border-paper-line relative p-12">
          {/* Accent border top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-paper-accent" />
          
          <div className="text-center mb-10">
            <p className="editorial-meta text-paper-gray tracking-[0.2em] mb-4">Machakos District Portal</p>
            <h1 className="editorial-h1 text-5xl">TextAGS</h1>
            <p className="font-serif italic text-paper-gray mt-2 lowercase">Automated Grading System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-paper-accent/5 text-paper-accent p-3 border-l-2 border-paper-accent text-xs font-bold uppercase tracking-wider">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="editorial-meta block mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-paper-bg/50 border-b border-paper-ink py-2 focus:border-paper-accent outline-none transition-colors font-serif italic text-lg"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="editorial-meta block mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-paper-bg/50 border-b border-paper-ink py-2 focus:border-paper-accent outline-none transition-colors font-serif italic text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-paper-ink text-white py-4 editorial-meta tracking-[0.3em] hover:bg-paper-accent transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Auth & Login"}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-paper-line">
            <p className="editorial-meta text-paper-gray text-center mb-4 italic lowercase opacity-60">System Credentials</p>
            <div className="grid grid-cols-3 gap-4 text-[9px] uppercase font-bold tracking-tight text-paper-gray">
              <div className="text-center">
                <p className="text-paper-ink">Admin</p>
                <p>admin / pass123</p>
              </div>
              <div className="text-center">
                <p className="text-paper-ink">Teacher</p>
                <p>teacher1 / pass123</p>
              </div>
              <div className="text-center">
                <p className="text-paper-ink">Student</p>
                <p>student1 / pass123</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center editorial-meta text-paper-gray lowercase italic opacity-40 mt-8">
          Compliant with Kenyan Data Protection Act • Machakos District Education Office
        </p>
      </motion.div>
    </div>
  );
}
