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

  const inputClasses = "w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors placeholder:text-gray-400";
  const labelClasses = "text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-12 h-12 animate-spin text-black mb-6" />
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">Loading Company Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 mb-8 font-mono text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="border-t-4 border-black pt-8 mb-12">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
          Company Branding
        </h1>
        <p className="text-xl font-light text-gray-500 mt-4">
          Establish your identity. Help candidates understand <span className="text-black font-medium">who you are</span> and <span className="text-black font-medium">why they should join</span>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-600 p-4 mb-8 font-mono text-sm text-red-600">
          [ERROR]: {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-600 p-4 mb-8 font-mono text-sm text-green-600">
          [SUCCESS]: Profile updated successfully.
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
          className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.2em] text-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors flex justify-center items-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
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
