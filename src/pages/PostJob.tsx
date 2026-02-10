import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobService } from '../features/jobs/services/jobService';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Loader2, ArrowLeft, Sparkles, Plus, Trash2, Info, Lightbulb } from 'lucide-react';
import type { JobType, WorkMode, CreateJobInput, ScreeningQuestion } from '../features/jobs/types';

interface JdResponse {
  jd: string;
  suggestedSkills?: string[];
  screeningQuestions?: ScreeningQuestion[];
}

interface AssistResponse {
  suggestions?: string[];
}

export const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [generatingJd, setGeneratingJd] = useState(false);
  const [generatingAssist, setGeneratingAssist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'FULL_TIME' as JobType,
    work_mode: 'REMOTE' as WorkMode,
    skills: '',
    contactEmail: user?.email ?? '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    experience: ''
  });

  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleAiGenerateJd = async () => {
    if (!formData.title) {
      setError("Please provide a Job Title to generate a description.");
      return;
    }

    try {
      setGeneratingJd(true);
      setError(null);
      const token = await user?.getIdToken();

      const requestBody = {
        role: formData.title,
        skills: formData.skills || '',
        location: formData.location || '',
        type: formData.type,
        workMode: formData.work_mode,
        experience: formData.experience
      };

      console.log('[PostJob] AI Generate Request:', requestBody);

      const res = await fetch('/api/ai/generate-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as { error?: string };
        console.error('[PostJob] AI Generate Error Response:', errorData);
        throw new Error(errorData.error ?? "Failed to generate JD");
      }
      const data = (await res.json()) as JdResponse;
      console.log('[PostJob] Generator Response Data:', data); // Debug log
      setFormData(prev => ({
        ...prev,
        description: data.jd,
        skills: data.suggestedSkills ? data.suggestedSkills.join(', ') : prev.skills
      }));

      if (data.screeningQuestions) {
        setScreeningQuestions(data.screeningQuestions);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "AI Generation failed. Please try again.");
    } finally {
      setGeneratingJd(false);
    }
  };

  const handleAiReviewDraft = async () => {
    if (!formData.description) {
      setError("Please provide a Job Description first to review.");
      return;
    }

    try {
      setGeneratingAssist(true);
      setError(null);
      const token = await user?.getIdToken();
      const res = await fetch('/api/ai/generate-job-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jd: formData.description })
      });

      if (!res.ok) throw new Error("Failed to review draft");
      const data = (await res.json()) as AssistResponse;
      // Questions are now handled by generateJD, this only returns tips
      setSuggestions(data.suggestions ?? []);
    } catch (err) {
      console.error(err);
      setError("AI Review failed. Please try again.");
    } finally {
      setGeneratingAssist(false);
    }
  };

  const addQuestion = () => {
    setScreeningQuestions(prev => [...prev, { question: '', hint: '' }]);
  };

  const removeQuestion = (index: number) => {
    setScreeningQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof ScreeningQuestion, value: string) => {
    setScreeningQuestions(prev => {
      const newQuestions = [...prev];
      const current = newQuestions[index];
      if (!current) return prev;

      if (field === 'question') {
        newQuestions[index] = { ...current, question: value };
      } else {
        newQuestions[index] = { ...current, hint: value };
      }
      return newQuestions;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const jobData: CreateJobInput = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        work_mode: formData.work_mode,
        experience: formData.experience,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        employer_id: user.uid,
        contactEmail: formData.contactEmail,
        salary_range: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
          currency: formData.currency
        },
        screening_questions: screeningQuestions.filter(q => q.question.trim())
      };

      await JobService.createJob(jobData);
      void navigate('/jobs');
    } catch (err: unknown) {
      console.error("Error posting job:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to post job. Please check your inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const prefillForm = () => {
    setFormData(prev => ({
      ...prev,
      title: "Senior Full Stack Engineer",
      skills: "React, Node.js, TypeScript, PostgreSQL, AWS",
      location: "Remote",
      type: "FULL_TIME",
      work_mode: "REMOTE",
      experience: "5+ Years",
      salaryMin: "120000",
      salaryMax: "180000",
      contactEmail: user?.email ?? "test@example.com"
    }));
  };

  const inputClasses = "w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors placeholder:text-gray-400";
  const labelClasses = "text-xs font-black uppercase tracking-widest mb-2 block";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black selection:bg-black selection:text-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 mb-8 font-mono text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="border-t-4 border-black pt-8 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            Post a Position
          </h1>
          <p className="text-xl font-light text-gray-500 mt-4">
            Fill in the details below. Our <span className="text-black font-medium">semantic matching engine</span> will do the rest.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-600 p-4 mb-8 font-mono text-sm text-red-600">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-12">
          {/* Section 1: The Basics */}
          <div className="space-y-6">
            <div className="bg-black text-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
              <label htmlFor="title" className="text-xs font-black uppercase tracking-[0.3em] mb-4 block text-gray-400">What's the position?</label>
              <input
                id="title"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-transparent border-b-4 border-white text-3xl font-black focus:outline-none placeholder:text-gray-700 py-2"
              />
            </div>
          </div>

          {/* Section 2: Role Context */}
          <div className="space-y-8">
            <div>
              <label htmlFor="skills" className={labelClasses}>Core Skills (Comma separated)</label>
              <input
                id="skills"
                required
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, TypeScript, Node.js"
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className={labelClasses}>Location</label>
                <input
                  id="location"
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Remote or City"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="type" className={labelClasses}>Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                  <option value="FULL_TIME">FULL TIME</option>
                  <option value="PART_TIME">PART TIME</option>
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="INTERNSHIP">INTERNSHIP</option>
                </select>
              </div>
              <div>
                <label htmlFor="work_mode" className={labelClasses}>Mode</label>
                <select id="work_mode" name="work_mode" value={formData.work_mode} onChange={handleChange} className={inputClasses}>
                  <option value="REMOTE">REMOTE</option>
                  <option value="HYBRID">HYBRID</option>
                  <option value="ONSITE">ON-SITE</option>
                </select>
              </div>
              <div>
                <label htmlFor="experience" className={labelClasses}>Experience</label>
                <input
                  id="experience"
                  required
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 3-5 Years"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* AI Generation Action */}
          <div className="flex flex-col items-center gap-4 py-4 border-y-2 border-dashed border-gray-200">
            <button
              type="button"
              onClick={() => void handleAiGenerateJd()}
              disabled={generatingJd || !formData.title}
              className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none w-full md:w-auto"
            >
              {generatingJd ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-yellow-400" />
              )}
              Generate Description with AI
            </button>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center">
              Uses Title, Skills, and Location to create a tailored description.
            </p>
          </div>

          {/* Section 3: Description */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="description" className={labelClasses}>Job Description</label>
                  {formData.description && (
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">AI Generated • Editable</span>
                  )}
                </div>
                <textarea
                  id="description"
                  required
                  name="description"
                  rows={10}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className={inputClasses}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleAiReviewDraft()}
                  disabled={generatingAssist || !formData.description}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] bg-white text-black px-6 py-3 hover:bg-gray-50 disabled:bg-gray-100 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  {generatingAssist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  )}
                  Review Draft & Get Tips
                </button>
              </div>
            </div>

            {/* Suggestions (Visible if generated) */}
            {suggestions.length > 0 && (
              <div className="border-2 border-black p-6 bg-yellow-50 relative">
                <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> AI Optimization Tips
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-xs font-mono flex gap-2 items-start">
                      <span className="text-black font-bold">›</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 3: Screening & Quality */}
          <div className="space-y-8">
            <div className="border-4 border-black p-8 bg-gray-50 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Application Screening</h2>
                  <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                    Questions generated by AI based on your description. Add or remove as needed.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {screeningQuestions.map((q, index) => (
                  <div key={index} className="bg-white border-2 border-black p-6 relative group">
                    <button
                      type="button"
                      onClick={() => { removeQuestion(index); }}
                      className="absolute -top-3 -right-3 bg-red-600 text-white p-2 border-2 border-black hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor={`q-${index}`} className="text-[10px] font-black uppercase tracking-widest mb-1 block">Question {index + 1}</label>
                        <input
                          id={`q-${index}`}
                          value={q.question}
                          onChange={(e) => { handleQuestionChange(index, 'question', e.target.value); }}
                          placeholder="e.g. How many years of experience do you have with React?"
                          className={`${inputClasses} py-2`}
                        />
                      </div>
                      <div>
                        <label htmlFor={`h-${index}`} className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Info className="w-3 h-3" /> Hint (Optional guidance for candidate)
                        </label>
                        <input
                          id={`h-${index}`}
                          value={q.hint}
                          onChange={(e) => { handleQuestionChange(index, 'hint', e.target.value); }}
                          placeholder="e.g. Please mention specific projects or length of time."
                          className={`${inputClasses} py-2 text-xs opacity-70`}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full border-2 border-dashed border-black py-4 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Question Manually
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Compensation & Contact */}
          <div className="space-y-8">
            <div className="border-b-2 border-black pb-2">
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">3. Compensation & Contact</h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="border-2 border-black p-6">
                <h3 className={labelClasses}>Salary Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="Min"
                    className={inputClasses}
                    aria-label="Minimum Salary"
                  />
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="Max"
                    className={inputClasses}
                    aria-label="Maximum Salary"
                  />
                  <select name="currency" value={formData.currency} onChange={handleChange} className={inputClasses} aria-label="Currency">
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contactEmail" className={labelClasses}>Contact Email (Where applications will be sent)</label>
                <input
                  id="contactEmail"
                  required
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-8 font-black uppercase tracking-[0.3em] text-xl hover:bg-gray-900 disabled:bg-gray-400 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-none active:translate-x-0 active:translate-y-0 flex justify-center items-center gap-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Job Posting'
              )}
            </button>
          </div>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={prefillForm}
              className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded shadow-lg z-50 text-xs font-mono uppercase tracking-widest hover:bg-purple-700 transition-colors"
            >
              [DEV] Prefill Data
            </button>
          )}
        </form>
      </main>
    </div>
  );
};