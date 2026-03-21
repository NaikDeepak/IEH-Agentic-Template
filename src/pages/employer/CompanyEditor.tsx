import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyService } from '../../features/companies/services/companyService';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, ArrowLeft, Save, Globe, MapPin, Video, FileText } from 'lucide-react';
import type { Company } from '../../features/companies/types';

export const CompanyEditor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
    video_url: '',
    tagline: '', // Added tagline as it was mentioned in the task action
  });

  useEffect(() => {
    const loadCompany = async () => {
      if (!user) return;
      try {
        const existingCompany = await CompanyService.getCompanyByEmployerId(user.uid);
        if (existingCompany) {
          setCompany(existingCompany);
          setFormData({
            name: existingCompany.name || '',
            bio: existingCompany.bio || '',
            website: existingCompany.website || '',
            location: existingCompany.location || '',
            video_url: existingCompany.video_url ?? '',
            tagline: existingCompany.tagline ?? '',
          });
        }
      } catch (err) {
        console.error("Error loading company:", err);
        setError("Failed to load company details.");
      } finally {
        setLoading(false);
      }
    };

    void loadCompany();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      if (company?.id) {
        await CompanyService.updateCompany(company.id, formData);
      } else {
        const newId = await CompanyService.createCompany({
          ...formData,
          employer_ids: [user.uid],
        });
        setCompany({ id: newId, ...formData, employer_ids: [user.uid] });
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); }, 3000);
    } catch (err: unknown) {
      console.error("Error saving company:", err);
      setError("Failed to save company details.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 border border-slate-200 bg-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-400";
  const labelClasses = "text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-4" />
        <p className="text-sm text-slate-400">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500 hover:text-sky-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="border-b border-slate-200 pb-8 mb-10">
        <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">Employer Profile</span>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Company Branding
        </h1>
        <p className="text-base text-slate-500 mt-2">
          Help candidates understand <span className="text-slate-700 font-medium">who you are</span> and <span className="text-slate-700 font-medium">why they should join</span>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-sm text-emerald-700">
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className={labelClasses}>Company Name</label>
            <input
              id="name"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="tagline" className={labelClasses}>Tagline</label>
            <input
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Building the future of stuff"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="bio" className={labelClasses}>
              <FileText className="w-3 h-3" /> Company Bio
            </label>
            <textarea
              id="bio"
              required
              name="bio"
              rows={6}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell your story..."
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="website" className={labelClasses}>
              <Globe className="w-3 h-3" /> Website URL
            </label>
            <input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://acme.com"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="location" className={labelClasses}>
              <MapPin className="w-3 h-3" /> Headquarters
            </label>
            <input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. San Francisco, CA"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="video_url" className={labelClasses}>
            <Video className="w-3 h-3" /> Video Introduction (YouTube/Vimeo)
          </label>
          <input
            id="video_url"
            name="video_url"
            type="url"
            value={formData.video_url}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=..."
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-sky-700 hover:bg-sky-800 text-white py-3.5 font-semibold text-sm rounded-xl disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save Company Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
};
