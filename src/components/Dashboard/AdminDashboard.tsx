import { Users, Shield, Server, FileText, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const adminStats = [
    { label: "Total Users", value: "1,240", icon: <Users className="text-blue-600" /> },
    { label: "Schools Enrolled", value: "45", icon: <Server className="text-emerald-600" /> },
    { label: "API Health", value: "99.9%", icon: <Shield className="text-indigo-600" /> },
    { label: "Tickets Open", value: "12", icon: <AlertCircle className="text-amber-500" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText className="text-slate-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">User Management System</h2>
          <p className="text-slate-500 mt-2">The administrator portal allows you to manage school accounts, handle subscriptions, and monitor system-wide grading accuracy across Kenyan counties.</p>
          <button className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-lg font-medium">Launch User Manager</button>
        </div>
      </div>
    </div>
  );
}
