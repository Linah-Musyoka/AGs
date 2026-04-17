import { ReactNode } from "react";
import { User } from "../types";
import { LogOut } from "lucide-react";
import { motion } from "motion/react";

interface LayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
}

export function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-paper-bg p-10 md:p-20">
      <div className="max-w-7xl mx-auto border-[20px] border-paper-bg">
        {/* Header */}
        <header className="editorial-header">
          <div>
            <p className="editorial-meta text-paper-accent">Delin Academy • Academic Excellence</p>
            <h1 className="editorial-h1">Premium Grading System</h1>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="editorial-meta">Logged in: {user.name} ({user.role})</p>
            <div className="flex items-center gap-4 mt-2">
               <span className="text-xs font-bold text-paper-gray uppercase tracking-widest">{user.school || user.class || "Secondary Level"}</span>
               <button 
                onClick={onLogout}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-paper-accent hover:underline"
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>

        {/* Footer */}
        <footer className="mt-20 border-t border-paper-line pt-4 flex justify-between editorial-meta text-paper-gray lowercase italic opacity-60">
          <div>System Version: v5.2.0-stable | Compliant with Kenyan Data Protection Act</div>
          <div>Grading Engine: <span className="text-paper-accent not-italic font-bold uppercase">Hugging Face Inference Active</span></div>
        </footer>
      </div>
    </div>
  );
}
