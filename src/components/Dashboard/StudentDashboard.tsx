import { BookOpen, CheckCircle, Clock } from "lucide-react";

export default function StudentDashboard() {
  const tasks = [
    { title: "Geography Assignment 1", deadline: "24 Apr 2026", status: "Pending", subject: "Geography" },
    { title: "Biology Short Quiz", deadline: "Completed", status: "Graded", score: "8/10", subject: "Biology" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Your Assignments</h3>
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.status === 'Graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                    {task.status === 'Graded' ? <CheckCircle /> : <Clock />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                    <p className="text-sm text-slate-500">{task.subject} • {task.deadline}</p>
                  </div>
                </div>
                {task.score && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-600">{task.score}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Score</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Learning Insights</h3>
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
             <BookOpen className="mb-4 text-indigo-200" size={32} />
             <h4 className="text-lg font-bold">Weak Areas identified</h4>
             <ul className="mt-4 space-y-2 text-indigo-100 text-sm">
                <li>• Photosynthesis concepts (3 incorrect answers)</li>
                <li>• Machakos drainage patterns</li>
                <li>• Essay structure coherence</li>
             </ul>
             <button className="w-full mt-6 bg-white text-indigo-600 py-2 rounded-lg font-bold">Personalized Study Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
