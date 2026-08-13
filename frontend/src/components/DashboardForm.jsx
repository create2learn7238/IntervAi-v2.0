import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Bot,
  Briefcase,
  Layers,
  Plus,
} from 'lucide-react';

/**
 * DashboardForm - Form Component with validation styling and short, simple placeholders.
 */
export default function DashboardForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState(() => {
    const savedForm = localStorage.getItem('lastInterviewForm');
    if (savedForm) {
      try {
        return JSON.parse(savedForm);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
    return {
      jobPosition: '',
      jobExperience: '',
      jobDescription: [],
      interviewType: 'Technical',
    };
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [newTechInput, setNewTechInput] = useState('');

  const roleTechMap = {
    'Software Engineer': ['Java', 'Python', 'C++', 'SQL', 'Git', 'Docker'],
    'Frontend Developer': ['React', 'Angular', 'Vue', 'HTML/CSS', 'JavaScript', 'TypeScript', 'Tailwind'],
    'Backend Developer': ['Node.js', 'Python', 'Java', 'Go', 'MongoDB', 'SQL', 'Redis', 'Spring Boot'],
    'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'Express', 'SQL', 'TypeScript'],
    'Mobile App Developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    'Data Scientist': ['Python', 'R', 'SQL', 'Pandas', 'TensorFlow', 'PyTorch'],
    'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux'],
    'Cloud Architect': ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform'],
    'Product Manager': ['Jira', 'Agile', 'Scrum', 'Figma', 'Product Strategy']
  };

  const allTechs = Array.from(new Set(Object.values(roleTechMap).flat().concat([
    '.NET', 'PHP', 'Ruby', 'Django', 'GraphQL', 'REST API'
  ]))).sort();

  const suggestedTechs = formData.jobPosition && roleTechMap[formData.jobPosition] 
    ? roleTechMap[formData.jobPosition] 
    : allTechs.slice(0, 10);

  const displayedTechs = Array.from(new Set([...suggestedTechs, ...formData.jobDescription]));

  const handleAddCustomTech = () => {
    const tech = newTechInput.trim();
    if (!tech) return;
    
    setFormData(prev => {
      if (prev.jobDescription.includes(tech)) return prev;
      const newDesc = [...prev.jobDescription, tech];
      if (touched.jobDescription) {
        setErrors(e => ({ ...e, jobDescription: validateField('jobDescription', newDesc) }));
      }
      return { ...prev, jobDescription: newDesc };
    });
    setNewTechInput('');
  };

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'jobPosition' && !value.trim()) {
      errorMsg = 'Job position title is required.';
    } else if (name === 'jobExperience') {
      if (!value) {
        errorMsg = 'Years of experience is required.';
      } else if (Number(value) < 0 || Number(value) > 40) {
        errorMsg = 'Experience must be between 0 and 40 years.';
      }
    } else if (name === 'jobDescription' && (!value || value.length === 0)) {
      errorMsg = 'Please select at least one tech stack.';
    }
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      jobPosition: validateField('jobPosition', formData.jobPosition),
      jobExperience: validateField('jobExperience', formData.jobExperience),
      jobDescription: validateField('jobDescription', formData.jobDescription),
    };

    setTouched({
      jobPosition: true,
      jobExperience: true,
      jobDescription: true,
    });

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => Boolean(msg));

    if (!hasError && onSubmit) {
      localStorage.setItem('lastInterviewForm', JSON.stringify(formData));
      onSubmit({
        ...formData,
        jobDescription: formData.jobDescription.join(', '),
      });
    }
  };

  const getInputStyle = (fieldName) => {
    const isTouched = touched[fieldName];
    const hasError = Boolean(errors[fieldName]);

    if (!isTouched) {
      return 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600';
    }
    if (hasError) {
      return 'border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500';
    }
    return 'border-emerald-500 bg-emerald-50/20 text-emerald-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Quick AI Mock Setup
          </h3>
          <p className="text-xs font-normal leading-relaxed text-slate-500">
            Customize target role parameters for instant AI practice interview generation.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Bot className="w-3.5 h-3.5" />
          <span>AI Engine</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Job Position Field */}
        <div className="space-y-1">
          <label htmlFor="jobPosition" className="block text-xs font-semibold text-slate-700">
            Target Job Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="jobPosition"
              name="jobPosition"
              value={formData.jobPosition}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full h-10 pl-9 pr-9 text-sm rounded-lg border transition-all appearance-none ${getInputStyle(
                'jobPosition'
              )}`}
            >
              <option value="" disabled>Select Target Job Title</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Mobile App Developer">Mobile App Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Cloud Architect">Cloud Architect</option>
              <option value="Product Manager">Product Manager</option>
            </select>
            <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            {touched.jobPosition && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.jobPosition ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </span>
            )}
          </div>
          {touched.jobPosition && errors.jobPosition ? (
            <p className="text-xs font-normal text-rose-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.jobPosition}</span>
            </p>
          ) : (
            <p className="text-xs font-normal leading-relaxed text-slate-500">
              Specify the target role title for tailored questions.
            </p>
          )}
        </div>

        {/* Experience & Interview Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Experience Field */}
          <div className="space-y-1">
            <label htmlFor="jobExperience" className="block text-xs font-semibold text-slate-700">
              Years of Experience <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="jobExperience"
                name="jobExperience"
                type="number"
                min="0"
                max="40"
                value={formData.jobExperience}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="2"
                className={`w-full h-10 pl-9 pr-9 text-sm rounded-lg border transition-all ${getInputStyle(
                  'jobExperience'
                )}`}
              />
              <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              {touched.jobExperience && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.jobExperience ? (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </span>
              )}
            </div>
            {touched.jobExperience && errors.jobExperience && (
              <p className="text-xs font-normal text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.jobExperience}</span>
              </p>
            )}
          </div>

          {/* Interview Type Selector */}
          <div className="space-y-1">
            <label htmlFor="interviewType" className="block text-xs font-semibold text-slate-700">
              Session Focus
            </label>
            <select
              id="interviewType"
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            >
              <option value="Technical">Technical Coding & System Design</option>
              <option value="Behavioral">Behavioral & HR Leadership</option>
              <option value="System Design">System Architecture</option>
              <option value="Mixed">Comprehensive Mock</option>
            </select>
          </div>
        </div>

        {/* Job Description Field */}
        <div className="space-y-1">
          <label htmlFor="jobDescription" className="block text-xs font-semibold text-slate-700">
            Job Tech Stack / Requirements <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {displayedTechs.map(tech => (
              <button
                type="button"
                key={tech}
                onClick={() => {
                  setFormData(prev => {
                    const newTech = prev.jobDescription.includes(tech)
                      ? prev.jobDescription.filter(t => t !== tech)
                      : [...prev.jobDescription, tech];
                    
                    if (touched.jobDescription) {
                      setErrors(e => ({ ...e, jobDescription: validateField('jobDescription', newTech) }));
                    }
                    return { ...prev, jobDescription: newTech };
                  });
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, jobDescription: true }));
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  formData.jobDescription.includes(tech)
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* Add Custom Tech Input */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newTechInput}
              onChange={(e) => setNewTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTech();
                }
              }}
              placeholder="Add custom skill (e.g. GraphQL)"
              className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
            <button
              type="button"
              onClick={handleAddCustomTech}
              className="px-4 h-9 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1 border border-indigo-200"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {touched.jobDescription && errors.jobDescription && (
            <p className="text-xs font-normal text-rose-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.jobDescription}</span>
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData({
                jobPosition: '',
                jobExperience: '',
                jobDescription: [],
                interviewType: 'Technical',
              });
              setErrors({});
              setTouched({});
              setNewTechInput('');
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Generating Session...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Start Mock Session</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
