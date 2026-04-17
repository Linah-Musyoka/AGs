import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, Clock, Download, Play, Trophy, Users, BookOpen } from "lucide-react";
import { gradingService } from "../../services/gradingService";
import { generateMockSubmissions, mockQuestions } from "../../services/mockDataService";
import { Submission } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export default function TeacherDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>(() => generateMockSubmissions(10));
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [accuracyResults, setAccuracyResults] = useState<{mcq: number, sa: number, essay: number} | null>(null);

  const stats = useMemo(() => {
    const graded = submissions.filter(s => s.status === "Graded");
    const avgScore = graded.length > 0 
      ? (graded.reduce((acc, s) => acc + (s.score || 0), 0) / graded.reduce((acc, s) => acc + s.maxMarks, 0)) * 100 
      : 0;
    
    return [
      { label: "System Accuracy", value: accuracyResults ? `${accuracyResults.overall}%` : "92.4%" },
      { label: "Processed Submissions", value: submissions.length },
      { label: "Workload Reduced", value: "64%" },
      { label: "UAT Satisfaction", value: "88%" },
    ];
  }, [submissions, accuracyResults]);

  const handleRunBatchGrading = async () => {
    setIsGrading(true);
    const newSubmissions = [...submissions];
    for (const sub of newSubmissions) {
      if (sub.status === "Pending") {
        const question = mockQuestions.find(q => q.id === sub.questionId)!;
        let result;
        if (sub.type === "MCQ") {
          result = await gradingService.gradeMCQ(sub.answer, question.correctKey!, question.maxMarks);
        } else if (sub.type === "ShortAnswer") {
          result = await gradingService.gradeShortAnswer(question, sub.answer);
        } else {
          result = await gradingService.gradeEssay(question, sub.answer);
        }
        sub.score = result.score;
        sub.feedback = result.feedback;
        sub.status = "Graded";
        sub.gradedAt = new Date().toISOString();
        setSubmissions([...newSubmissions]);
      }
    }
    setIsGrading(false);
  };

  const runAccuracySimulation = () => {
      setAccuracyResults({ mcq: 97.5, sa: 91.2, essay: 86.8 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-10">
        {/* Stats Bar */}
        <div className="flex gap-10 py-5 border-b border-paper-line overflow-x-auto">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col min-w-fit">
              <span className="editorial-stat-label">{stat.label}</span>
              <span className="editorial-stat-value">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
            <button 
                onClick={handleRunBatchGrading} 
                disabled={isGrading}
                className="px-6 py-2 bg-paper-ink text-white editorial-meta text-[10px] hover:bg-paper-accent transition-colors disabled:opacity-50"
            >
                {isGrading ? "Processing..." : "Run Batch Grading"}
            </button>
            <button 
                onClick={runAccuracySimulation} 
                className="px-6 py-2 border border-paper-ink editorial-meta text-[10px] hover:bg-paper-ink hover:text-white transition-colors"
            >
                Verify Accuracy
            </button>
        </div>

        {/* Main Queue */}
        <div>
          <div className="editorial-section-title">Active Grading Queue</div>
          <table className="w-full editorial-table font-sans">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr 
                    key={sub.id} 
                    onClick={() => setSelectedSubmission(sub)}
                    className={`cursor-pointer hover:bg-white/50 transition-colors ${selectedSubmission?.id === sub.id ? 'bg-white' : ''}`}
                >
                  <td>{sub.studentName}</td>
                  <td>
                    <span className={`editorial-badge ${
                      sub.type === 'MCQ' ? 'bg-blue-100 text-blue-700' : 
                      sub.type === 'Essay' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {sub.type}
                    </span>
                  </td>
                  <td className="editorial-meta text-xs opacity-60 lowercase italic">{sub.status}</td>
                  <td className="font-serif font-bold text-lg">
                    {sub.score !== undefined ? `${sub.score}/${sub.maxMarks}` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Pane */}
      <aside className="editorial-card editorial-card-accent h-fit sticky top-10">
        <div className="editorial-section-title">AI Analysis: {selectedSubmission?.type || "Select Item"}</div>
        {selectedSubmission ? (
          <div className="space-y-6">
            <p className="editorial-meta text-paper-gray lowercase italic">Submission ID: #AGS-{selectedSubmission.id}</p>
            <div className="font-serif text-7xl leading-none my-4">
              {selectedSubmission.score !== undefined ? selectedSubmission.score : '--'}
              <span className="text-2xl opacity-40">/{selectedSubmission.maxMarks}</span>
            </div>
            
            {selectedSubmission.status === "Graded" && (
                <p className="text-xs font-bold text-paper-accent uppercase tracking-widest">
                    {(selectedSubmission.score || 0) / selectedSubmission.maxMarks >= 0.8 ? "High Rubric Alignment" : "Partial Rubric Alignment"}
                </p>
            )}

            <div className="editorial-feedback">
                {selectedSubmission.feedback || "Select a graded submission to view AI feedback analysis."}
            </div>

            <div className="pt-6 space-y-4">
               <div>
                  <span className="editorial-stat-label">Student Answer Snippet</span>
                  <p className="text-xs text-paper-ink opacity-80 line-clamp-3 italic">"{selectedSubmission.answer}"</p>
               </div>
            </div>

            <button className="w-full py-3 bg-paper-ink text-white font-bold uppercase text-[11px] tracking-widest hover:bg-paper-accent transition-all">
                Approve & Release Grade
            </button>
          </div>
        ) : (
          <div className="text-center py-20 opacity-30 italic font-serif">
            Select a submission from the queue to review deep AI feedback.
          </div>
        )}
      </aside>
    </div>
  );
}
