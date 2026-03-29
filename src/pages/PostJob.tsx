import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobService } from '../features/jobs/services/jobService';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Loader2, ArrowLeft, Sparkles, Plus, Trash2, Info, Lightbulb, Building2 } from 'lucide-react';
import type { JobType, WorkMode, CreateJobInput, ScreeningQuestion } from '../features/jobs/types';
import { CompanyService } from '../features/companies/services/companyService';
import { callAIProxy } from '../lib/ai/proxy';


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
    experience: '',
    company_bio: ''
  });

  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [companyContext, setCompanyContext] = useState<{
    name?: string;
    tagline?: string;
    mission?: string;
    techStack?: string[];
  }>({});

  React.useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;
      try {
        const company = await CompanyService.getCompanyByEmployerId(user.uid);
        if (company) {
          setFormData(prev => ({ ...prev, company_bio: company.bio }));
          setCompanyContext({
            name: company.name,
            tagline: company.tagline,
            mission: company.bio,
            techStack: company.tech_stack
          });
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
      }
    };
    void fetchCompanyData();
  }, [user]);

  const handleAiGenerateJd = async () => {
    if (!formData.title) {
      setError("Please provide a Job Title to generate a description.");
      return;
    }

    try {
      setGeneratingJd(true);
      setError(null);

      const requestBody = {
        role: formData.title,
        skills: formData.skills || '',
        location: formData.location || '',
        type: formData.type,
        workMode: formData.work_mode,
        experience: formData.experience || '',
        companyContext: companyContext
      };

      const data = await callAIProxy<JdResponse>('/api/ai/generate-jd', requestBody);

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
      const data = await callAIProxy<AssistResponse>('/api/ai/generate-job-assist', { jd: formData.description });

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
        company_bio: formData.company_bio,
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

  const inputClasses = "w-full px-4 py-2.5 border border-slate-200 bg-white text-sm text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-400";
  const labelClasses = "text-xs font-medium text-slate-500 mb-1.5 block";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500 hover:text-sky-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="border-b border-slate-200 pb-8 mb-10">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">New Posting</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Post a Position
          </h1>
          <p className="text-base text-slate-500 mt-2">
            Fill in the details below. Our <span className="text-slate-700 font-medium">semantic matching engine</span> will do the rest.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-12">
          {/* Section 1: The Basics */}
          <div className="space-y-6">
            <div className="bg-sky-700 text-white p-8 rounded-2xl">
              <label htmlFor="title" className="text-xs font-medium text-sky-200 mb-3 block">What's the position?</label>
              <input
                id="title"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-transparent border-b-2 border-white/30 focus:border-white text-xl md:text-2xl font-bold focus:outline-none placeholder:text-white/30 py-2 transition-colors"
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
          <div className="flex flex-col items-center gap-3 py-6 border-y border-dashed border-slate-200">
            <button
              type="button"
              onClick={() => void handleAiGenerateJd()}
              disabled={generatingJd || !formData.title}
              className="flex items-center justify-center gap-2 bg-sky-700 hover:bg-sky-800 text-white px-8 py-3 font-semibold rounded-xl disabled:opacity-50 transition-colors w-full md:w-auto text-sm"
            >
              {generatingJd ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Description with AI
            </button>
            <p className="text-xs text-slate-400 text-center flex items-center gap-2">
              {companyContext.name && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium border-r border-slate-200 pr-2">
                  <Building2 className="w-3 h-3" /> {companyContext.name} Branding Applied
                </span>
              )}
              Uses Title, Skills, Location, and Company Profile to create a tailored description.
            </p>
          </div>

          {/* Section 3: Description */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="description" className={labelClasses}>Job Description</label>
                  {formData.description && (
                    <span className="text-xs text-slate-400">AI Generated · Editable</span>
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
                  className="flex items-center gap-2 text-xs font-medium bg-white text-slate-700 px-5 py-2.5 hover:bg-slate-50 disabled:opacity-50 transition-colors border border-slate-200 rounded-lg"
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
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-5">
                <div className="flex items-center gap-2 text-sky-700 font-semibold text-sm mb-3">
                  <Lightbulb className="w-4 h-4" /> AI Optimization Tips
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2 items-start">
                      <span className="text-sky-500 font-bold mt-0.5">›</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 3: Screening & Quality */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Application Screening</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Questions generated by AI based on your description. Add or remove as needed.
                </p>
              </div>

              <div className="space-y-4">
                {screeningQuestions.map((q, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-5 relative">
                    <button
                      type="button"
                      onClick={() => { removeQuestion(index); }}
                      className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-500 p-1.5 rounded-lg transition-colors"
                      aria-label="Remove question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 gap-3 pr-10">
                      <div>
                        <label htmlFor={`q-${index}`} className="text-xs font-medium text-slate-500 mb-1.5 block">Question {index + 1}</label>
                        <input
                          id={`q-${index}`}
                          value={q.question}
                          onChange={(e) => { handleQuestionChange(index, 'question', e.target.value); }}
                          placeholder="e.g. How many years of experience do you have with React?"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label htmlFor={`h-${index}`} className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                          <Info className="w-3 h-3" /> Hint (Optional)
                        </label>
                        <input
                          id={`h-${index}`}
                          value={q.hint}
                          onChange={(e) => { handleQuestionChange(index, 'hint', e.target.value); }}
                          placeholder="e.g. Please mention specific projects or length of time."
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full border border-dashed border-slate-200 rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Question Manually
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Compensation & Contact */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-sm font-semibold text-slate-700">Compensation & Contact</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
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

          <div className="pt-4">
            <div className="border-b border-slate-200 pb-2 mb-6">
              <h2 className="text-sm font-semibold text-slate-700">About the Company</h2>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="company_bio" className={labelClasses}>Company Description</label>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Building2 className="w-3 h-3" /> Pre-filled from profile
                </div>
              </div>
              <textarea
                id="company_bio"
                name="company_bio"
                rows={4}
                value={formData.company_bio}
                onChange={handleChange}
                placeholder="Tell candidates about your company culture and mission..."
                className={inputClasses}
              />
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white py-4 font-semibold text-base rounded-xl disabled:opacity-50 transition-colors flex justify-center items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
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