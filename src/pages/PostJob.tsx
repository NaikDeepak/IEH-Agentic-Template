import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobService } from '../features/jobs/services/jobService';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { JobType, WorkMode, CreateJobInput } from '../features/jobs/types';

export const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
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
    currency: 'USD'
  });

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
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        employer_id: user.uid,
        contactEmail: formData.contactEmail,
        salary_range: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
          currency: formData.currency
        }
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

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className={labelClasses}>Job Title</label>
              <input
                id="title"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClasses}>Description</label>
              <textarea
                id="description"
                required
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and requirements..."
                className={inputClasses}
              />
            </div>
          </div>

          {/* Type & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className={labelClasses}>Employment Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                <option value="FULL_TIME">FULL TIME</option>
                <option value="PART_TIME">PART TIME</option>
                <option value="CONTRACT">CONTRACT</option>
                <option value="INTERNSHIP">INTERNSHIP</option>
              </select>
            </div>
            <div>
              <label htmlFor="work_mode" className={labelClasses}>Work Mode</label>
              <select id="work_mode" name="work_mode" value={formData.work_mode} onChange={handleChange} className={inputClasses}>
                <option value="REMOTE">REMOTE</option>
                <option value="HYBRID">HYBRID</option>
                <option value="ONSITE">ON-SITE</option>
              </select>
            </div>
          </div>

          {/* Location & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className={labelClasses}>Location</label>
              <input
                id="location"
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Berlin, Germany or Remote"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="skills" className={labelClasses}>Skills (Comma separated)</label>
              <input
                id="skills"
                required
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, TypeScript, Node.js"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Salary Range */}
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
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="contactEmail" className={labelClasses}>Contact Email</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.2em] text-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors flex justify-center items-center gap-4"
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
        </form>
      </main>
    </div>
  );
};