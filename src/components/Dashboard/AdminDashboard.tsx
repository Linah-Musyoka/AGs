import { User } from "../../types";
import { Shield, Users, Activity, Settings } from "lucide-react";

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-10">
      <div className="editorial-header !border-t-0 pt-0">
        <div>
           <p className="editorial-meta text-paper-accent">Central Administration</p>
           <h2 className="editorial-h1">System Controller</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="editorial-card bg-paper-accent/5">
          <Shield className="text-paper-accent mb-4" size={32} />
          <div className="editorial-stat-label">Security Status</div>
          <div className="editorial-stat-value">Robust</div>
          <p className="editorial-meta text-xs mt-4">Audit logs captured • JWT Rotation Active</p>
        </div>

        <div className="editorial-card">
          <Users className="text-paper-ink mb-4" size={32} />
          <div className="editorial-stat-label">Enrolled Users</div>
          <div className="editorial-stat-value">1,240</div>
          <p className="editorial-meta text-xs mt-4 italic opacity-60">across 12 District Schools</p>
        </div>

        <div className="editorial-card shadow-xl shadow-paper-accent/5">
          <Activity className="text-paper-ink mb-4" size={32} />
          <div className="editorial-stat-label">API Health</div>
          <div className="editorial-stat-value">99.9%</div>
          <p className="editorial-meta text-xs mt-4">Response latency: 12ms</p>
        </div>
      </div>

      <div className="editorial-card">
        <div className="editorial-section-title">Global User Registry</div>
        <div className="text-center py-20 opacity-30 italic font-serif">
           Admin-level User Management is currently restricted to Terminal Access.
        </div>
        <div className="flex justify-center gap-4 border-t border-paper-line pt-6">
           <button className="flex items-center gap-2 editorial-meta text-[10px] uppercase font-bold text-paper-accent">
              <Settings size={14} /> System Config
           </button>
           <button className="flex items-center gap-2 editorial-meta text-[10px] uppercase font-bold text-paper-ink opacity-60">
              Audit Logs
           </button>
        </div>
      </div>
    </div>
  );
}
