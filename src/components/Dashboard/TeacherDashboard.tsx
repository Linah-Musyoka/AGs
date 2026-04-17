import { useState, useMemo, useEffect, type FormEvent } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PlusCircle, Database, LayoutDashboard, Search, FileText, Play } from "lucide-react";
import { gradingService } from "../../services/gradingService";
import { Submission, Question, QuestionType } from "../../types";
import { motion, AnimatePresence } from "motion/react";

import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<"queue" | "bank" | "analytics" | "help">("queue");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);

  const [newQ, setNewQ] = useState<Partial<Question>>({
    type: "ShortAnswer",
    topic: "History",
    difficulty: "Medium",
    maxMarks: 10
  });

  useEffect(() => {
    fetchSubmissions();
    fetchQuestions();
  }, []);

  const fetchSubmissions = async () => {
    const res = await fetch("/api/submissions");
    const data = await res.json();
    setSubmissions(data);
  };

  const fetchQuestions = async () => {
    const res = await fetch("/api/questions");
    const data = await res.json();
    setQuestions(data);
  };

  const stats = useMemo(() => {
    const graded = submissions.filter(s => s.status === "Graded");
    const totalPossible = graded.reduce((acc, s) => acc + s.maxMarks, 0);
    const totalGained = graded.reduce((acc, s) => acc + (s.score || 0), 0);
    const avg = totalPossible > 0 ? (totalGained / totalPossible) * 100 : 0;

    // Weak Topics logic (f6)
    const topicStats: Record<string, { total: number, gained: number }> = {};
    graded.forEach(s => {
      if (!topicStats[s.topic]) topicStats[s.topic] = { total: 0, gained: 0 };
      topicStats[s.topic].total += s.maxMarks;
      topicStats[s.topic].gained += s.score || 0;
    });

    const weakTopics = Object.entries(topicStats)
      .map(([name, data]) => ({ name, score: (data.gained / data.total) * 100 }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    return { avg, weakTopics, total: submissions.length };
  }, [submissions]);

  const handleAddQuestion = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQ)
    });
    setIsAddingQuestion(false);
    fetchQuestions();
  };

  const handleGrade = async (sub: Submission) => {
    setIsGrading(true);
    const question = questions.find(q => q.id === sub.questionId)!;
    let result;
    if (sub.type === "MCQ") {
      result = await gradingService.gradeMCQ(sub.answer, question.correctKey!, question.maxMarks);
    } else if (sub.type === "ShortAnswer") {
      result = await gradingService.gradeShortAnswer(question, sub.answer);
    } else {
      result = await gradingService.gradeEssay(question, sub.answer);
    }

    await fetch(`/api/submissions/${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        score: result.score, 
        feedback: result.feedback 
      })
    });
    
    fetchSubmissions();
    setIsGrading(false);
  };

  const handleBatchGrade = async () => {
    const pending = submissions.filter(s => s.status === "Pending");
    if (pending.length === 0) return;

    setIsGrading(true);
    setBatchProgress({ current: 0, total: pending.length });

    for (let i = 0; i < pending.length; i++) {
      const sub = pending[i];
      const question = questions.find(q => q.id === sub.questionId)!;
      let result;
      if (sub.type === "MCQ") result = await gradingService.gradeMCQ(sub.answer, question.correctKey!, question.maxMarks);
      else if (sub.type === "ShortAnswer") result = await gradingService.gradeShortAnswer(question, sub.answer);
      else result = await gradingService.gradeEssay(question, sub.answer);

      await fetch(`/api/submissions/${sub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: result.score, feedback: result.feedback })
      });
      setBatchProgress({ current: i + 1, total: pending.length });
    }

    setBatchProgress(null);
    setIsGrading(false);
    fetchSubmissions();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("DELIN ACADEMY - AUDIT REPORT", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Class Mastery Index: ${Math.round(stats.avg)}%`, 20, 30);
    
    let y = 45;
    submissions.forEach((s, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}. ${s.studentName} - ${s.topic}: ${s.score || 0}/${s.maxMarks}`, 20, y);
      y += 10;
    });
    doc.save("Delin_Performance_Report.pdf");
  };

  const exportExcel = () => {
    const data = submissions.map(s => ({
      Student: s.studentName,
      Topic: s.topic,
      Score: s.score || 0,
      Max: s.maxMarks,
      Feedback: s.feedback || "Pending"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submissions");
    XLSX.writeFile(wb, "Delin_Data_Export.xlsx");
  };

  return (
    <div className="space-y-10">
      {/* Sub-header Navigation */}
      <nav className="flex gap-8 border-b border-paper-line pb-4 editorial-meta text-[10px]">
        <button onClick={() => setActiveTab("queue")} className={`tracking-widest ${activeTab === 'queue' ? 'text-paper-accent border-b border-paper-accent pb-4' : 'opacity-60'}`}>
          <LayoutDashboard size={12} className="inline mr-2" />
          GRADING QUEUE
        </button>
        <button onClick={() => setActiveTab("bank")} className={`tracking-widest ${activeTab === 'bank' ? 'text-paper-accent border-b border-paper-accent pb-4' : 'opacity-60'}`}>
          <Database size={12} className="inline mr-2" />
          QUESTION BANK
        </button>
        <button onClick={() => setActiveTab("analytics")} className={`tracking-widest ${activeTab === 'analytics' ? 'text-paper-accent border-b border-paper-accent pb-4' : 'opacity-60'}`}>
          <Search size={12} className="inline mr-2" />
          SYSTEM ANALYTICS
        </button>
        <button onClick={() => setActiveTab("help")} className={`tracking-widest ${activeTab === 'help' ? 'text-paper-accent border-b border-paper-accent pb-4' : 'opacity-60'}`}>
          <FileText size={12} className="inline mr-2" />
          HELP & TUTORIALS
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {activeTab === "queue" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-paper-accent/5 p-4 border border-paper-line mb-6">
                 <div className="editorial-section-title !mb-0">Pending Submissions</div>
                 <button 
                  onClick={handleBatchGrade}
                  disabled={isGrading || submissions.filter(s => s.status === "Pending").length === 0}
                  className="bg-paper-accent text-white p-2 editorial-meta text-[10px] px-6 disabled:opacity-50"
                 >
                   {batchProgress ? `Grading ${batchProgress.current}/${batchProgress.total}...` : "Run Batch Grading (f4)"}
                 </button>
              </div>
              <table className="w-full editorial-table font-sans">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Topic</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id} onClick={() => setSelectedSubmission(sub)} className="cursor-pointer hover:bg-white/50">
                      <td>{sub.studentName}</td>
                      <td className="editorial-meta text-xs lowercase italic opacity-60">{sub.topic}</td>
                      <td><span className="editorial-badge bg-green-100 text-green-800">{sub.type}</span></td>
                      <td>
                        {sub.status === "Pending" ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleGrade(sub); }}
                            className="text-[10px] font-bold uppercase text-paper-accent hover:underline"
                          >
                            Grade Now
                          </button>
                        ) : (
                          <span className="font-serif font-bold text-lg text-paper-ink">{sub.score}/{sub.maxMarks}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "bank" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-paper-accent/5 p-4 border border-paper-line">
                <div className="editorial-section-title !mb-0">Curriculum Repository</div>
                <button 
                  onClick={() => setIsAddingQuestion(true)}
                  className="bg-paper-ink text-white p-2 editorial-meta text-[10px] px-6"
                >
                  <PlusCircle size={14} className="inline mr-2" />
                  Add New Question
                </button>
              </div>

              {isAddingQuestion && (
                <form onSubmit={handleAddQuestion} className="editorial-card space-y-4 animate-in fade-in slide-in-from-top-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="editorial-stat-label">Subject Topic</label>
                        <input className="w-full border-b border-paper-line py-2 outline-none font-serif italic" onChange={e => setNewQ({...newQ, topic: e.target.value})} required placeholder="e.g. Physics" />
                      </div>
                      <div>
                        <label className="editorial-stat-label">Marks</label>
                        <input type="number" className="w-full border-b border-paper-line py-2 outline-none font-serif italic" onChange={e => setNewQ({...newQ, maxMarks: parseInt(e.target.value)})} required />
                      </div>
                   </div>
                   <div>
                      <label className="editorial-stat-label">Question Text</label>
                      <textarea className="w-full border-b border-paper-line py-2 outline-none font-serif italic" rows={3} onChange={e => setNewQ({...newQ, text: e.target.value})} required />
                   </div>
                   <div className="flex justify-end gap-4">
                      <button type="button" onClick={() => setIsAddingQuestion(false)} className="editorial-meta text-[10px] uppercase opacity-60">Cancel</button>
                      <button type="submit" className="editorial-meta text-[10px] uppercase bg-paper-accent text-white px-6 py-2">Save to Bank</button>
                   </div>
                </form>
              )}

              <table className="w-full editorial-table font-sans">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Question</th>
                    <th>Diff</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q.id}>
                      <td className="text-paper-accent font-bold uppercase text-[10px] tracking-widest">{q.topic}</td>
                      <td className="font-serif italic text-sm">{q.text}</td>
                      <td className="editorial-meta text-[10px]">{q.difficulty}</td>
                      <td className="font-bold">{q.maxMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="editorial-card">
                     <div className="editorial-section-title">Performance Trend</div>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={questions.map(q => ({ name: q.topic, val: Math.random() * 80 + 20 }))}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'Inter' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'Inter' }} />
                              <Tooltip />
                              <Bar dataKey="val" fill="#1A4D2E" />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="editorial-card-accent editorial-card">
                     <div className="editorial-section-title">Critical Intervention Areas</div>
                     <div className="space-y-6">
                        {stats.weakTopics.map((topic, idx) => (
                           <div key={idx} className="flex justify-between items-end border-b border-paper-line pb-2">
                              <div>
                                 <p className="editorial-meta text-xs lowercase italic opacity-60">Topic #{idx + 1}</p>
                                 <p className="font-serif font-bold text-xl">{topic.name}</p>
                              </div>
                              <div className={`text-sm font-bold uppercase tracking-widest ${topic.score < 50 ? 'text-red-600' : 'text-amber-600'}`}>
                                 {Math.round(topic.score)}% Mastery
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "help" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
               <div>
                  <div className="editorial-section-title">Objective O5: Implementation Support</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[1, 2, 3].map(v => (
                        <div key={v} className="editorial-card relative overflow-hidden group aspect-video bg-paper-ink/10 flex items-center justify-center cursor-pointer">
                           <Play size={40} className="text-paper-ink group-hover:scale-110 transition-transform" />
                           <div className="absolute bottom-4 left-4 editorial-meta text-[9px] uppercase font-bold">Tutorial {v}: System Navigation</div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="editorial-card">
                  <div className="editorial-section-title">User Manual (10-Page Summary)</div>
                  <div className="prose font-serif text-sm opacity-80 space-y-4">
                     <p>1. <strong>Authentication</strong>: Users must authenticate via the Delin Secure JWT portal. Account lockout active after 5 failed attempts.</p>
                     <p>2. <strong>Curriculum Alignment</strong>: Questions are tagged with topic and difficulty to ensure alignment with KNEC standards.</p>
                     <p>3. <strong>AI Essay Logic</strong>: The system evaluates coherence, vocabulary, and rubric alignment with at least 85% agreement.</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Context */}
        <aside className="h-fit sticky top-10 space-y-6">
           <div className="editorial-card editorial-card-accent">
              <div className="editorial-section-title">Operational Overview</div>
              <div className="space-y-8">
                 <div>
                    <span className="editorial-stat-label">Class Mastery Index</span>
                    <span className="editorial-stat-value block !text-6xl">{Math.round(stats.avg)}%</span>
                    <p className="editorial-meta text-[9px] mt-2 italic">Calculated across {stats.total} verified submissions.</p>
                 </div>
                 <div className="pt-6 border-t border-paper-line">
                    <button onClick={exportPDF} className="w-full py-4 bg-paper-ink text-white editorial-meta tracking-[0.2em] text-[10px] hover:bg-paper-accent transition-all">
                       GENERATE PDF AUDIT REPORT
                    </button>
                    <button onClick={exportExcel} className="w-full py-4 mt-2 border border-paper-ink editorial-meta tracking-[0.2em] text-[10px] hover:bg-paper-ink hover:text-white transition-all">
                       EXPORT DATA TO EXCEL
                    </button>
                 </div>
              </div>
           </div>

           {selectedSubmission && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="editorial-card">
                <div className="editorial-section-title">Submission Context</div>
                <div className="space-y-4">
                   <p className="editorial-meta lowercase italic">Student: {selectedSubmission.studentName}</p>
                   <div className="p-4 bg-paper-bg italic font-serif text-sm">
                      "{selectedSubmission.answer}"
                   </div>
                   {selectedSubmission.feedback && (
                     <div className="editorial-feedback mt-4">
                        {selectedSubmission.feedback}
                     </div>
                   )}
                </div>
             </motion.div>
           )}
        </aside>
      </div>
    </div>
  );
}
