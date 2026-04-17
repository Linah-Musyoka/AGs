import { useState, useEffect, type FormEvent } from "react";
import { User, Question, Submission } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, CheckCircle, Clock, Send } from "lucide-react";

interface StudentDashboardProps {
  user: User;
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [qRes, sRes] = await Promise.all([
      fetch("/api/questions"),
      fetch("/api/submissions")
    ]);
    const qs = await qRes.json();
    const ss = await sRes.json();
    setQuestions(qs);
    setMySubmissions(ss.filter((s: Submission) => s.studentId === user.id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    
    setIsSubmitting(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.id,
        studentName: user.name,
        questionId: selectedQuestion.id,
        answer
      })
    });

    if (res.ok) {
      setMessage("Submitted successfully! Redirecting to dashboard...");
      setTimeout(() => {
        setSelectedQuestion(null);
        setAnswer("");
        setMessage("");
        fetchData();
      }, 2000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-10">
        <AnimatePresence mode="wait">
          {!selectedQuestion ? (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-6"
            >
              <div className="editorial-section-title">Available Assessments</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map(q => {
                   const alreadySubmitted = mySubmissions.some(s => s.questionId === q.id);
                   return (
                     <div key={q.id} className={`editorial-card group relative transition-all ${alreadySubmitted ? 'opacity-50 grayscale pointer-events-none' : 'hover:border-paper-accent'}`}>
                        <div className="flex justify-between items-start mb-4">
                           <span className="editorial-badge bg-blue-50 text-blue-600">{q.topic}</span>
                           <span className="editorial-meta text-[10px] uppercase font-bold tracking-tighter">{q.difficulty}</span>
                        </div>
                        <h3 className="font-serif text-xl mb-4">{q.text}</h3>
                        <div className="flex justify-between items-center pt-4 border-t border-paper-line">
                           <span className="editorial-meta text-xs">{q.maxMarks} Marks • {q.type}</span>
                           {!alreadySubmitted && (
                             <button 
                               onClick={() => setSelectedQuestion(q)}
                               className="editorial-meta text-[10px] font-bold text-paper-accent border-b border-paper-accent"
                             >
                               START WORK →
                             </button>
                           )}
                        </div>
                        {alreadySubmitted && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                             <CheckCircle className="text-paper-accent" size={40} />
                          </div>
                        )}
                     </div>
                   );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="editorial-card relative"
            >
               <div className="absolute top-8 right-8">
                  <button onClick={() => setSelectedQuestion(null)} className="editorial-meta text-[10px] uppercase opacity-40 hover:opacity-100">Cancel & Go Back</button>
               </div>
               <div className="mb-10">
                  <span className="editorial-meta text-xs text-paper-accent font-bold uppercase tracking-widest">{selectedQuestion.topic} / {selectedQuestion.type}</span>
                  <h2 className="editorial-h1 !text-4xl mt-2">{selectedQuestion.text}</h2>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="editorial-stat-label mb-4 opacity-100">Your Response</label>
                    <textarea 
                       className="w-full bg-paper-bg p-8 font-serif text-xl italic min-h-[300px] outline-none border border-paper-line focus:border-paper-accent transition-colors"
                       placeholder="Begin typing your answer here..."
                       value={answer}
                       onChange={e => setAnswer(e.target.value)}
                       required
                       disabled={isSubmitting}
                    />
                  </div>
                  
                  {message && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px] tracking-widest border border-emerald-100">
                      {message}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmitting || !answer.trim()}
                    className="w-full bg-paper-ink text-white py-6 editorial-meta tracking-[0.4em] font-bold text-xs hover:bg-paper-accent transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "TRANSMITTING DATA..." : "FINALIZE & SUBMIT"}
                  </button>
               </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="space-y-10">
         <div className="editorial-card">
            <div className="editorial-section-title">Academic Record</div>
            <div className="space-y-6">
               {mySubmissions.length === 0 ? (
                 <p className="editorial-meta text-sm italic opacity-40">No verified submissions found.</p>
               ) : (
                 mySubmissions.map(sub => (
                   <div key={sub.id} className="border-b border-paper-line pb-4 group">
                      <div className="flex justify-between items-start mb-1">
                         <span className="editorial-meta text-[9px] uppercase font-bold opacity-60 italic">{sub.topic}</span>
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${sub.status === 'Graded' ? 'text-emerald-600' : 'text-amber-500'}`}>
                           {sub.status}
                         </span>
                      </div>
                      <p className="font-serif font-bold text-lg group-hover:text-paper-accent transition-colors">#{sub.id.split('-')[0]} Submission</p>
                      <div className="flex justify-between items-center mt-2">
                         <div className="flex gap-2 text-xs editorial-meta opacity-40 lowercase italic">
                            <Clock size={12} />
                            {new Date(sub.submittedAt).toLocaleDateString()}
                         </div>
                         {sub.status === 'Graded' && (
                           <div className="font-serif font-bold text-xl">{sub.score}<span className="text-xs opacity-40">/{sub.maxMarks}</span></div>
                         )}
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         <div className="editorial-card-accent editorial-card">
            <div className="editorial-section-title italic">Learning Path</div>
            <p className="editorial-meta text-[11px] leading-relaxed opacity-80">
               Your progress is monitored using AI-curated mastery loops. Complete available assessments to unlock deep feedback analysis.
            </p>
         </div>
      </aside>
    </div>
  );
}
