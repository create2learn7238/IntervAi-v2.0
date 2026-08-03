import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Award,
  Save,
  CheckCircle2,
  FileText,
  Bot,
  Code2,
  Phone,
  BookOpen,
  Calendar,
  Plus,
  X,
  ShieldCheck,
  Loader2,
  Globe,
  AlertTriangle,
  XCircle,
  ArrowRight,
  BrainCircuit,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, getMe, verifyTargetRole } from '../services/authService';
import { toast } from 'react-hot-toast';

// Safe inline SVG for LinkedIn
const LinkedInIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

// Safe inline SVG for GitHub
const GitHubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
  </svg>
);

// Helper to reliably convert any skills input (String or Array) to a clean Array
const normalizeSkills = (rawSkills) => {
  if (Array.isArray(rawSkills)) return rawSkills;
  if (typeof rawSkills === 'string' && rawSkills.trim()) {
    return rawSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [verifyingRole, setVerifyingRole] = useState(false);

  const [isUserTypeLocked, setIsUserTypeLocked] = useState(user?.isUserTypeLocked || false);
  const [profileCompleted, setProfileCompleted] = useState(user?.profileCompleted || false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'student',
    college: user?.college || '',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear || '',
    targetRole: user?.targetRole || '',
    skills: normalizeSkills(user?.skills),
    bio: user?.bio || '',
    phone: user?.phone || '',
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
    placementStatus: user?.placementStatus || 'Looking for Jobs',
  });

  // AI Verification Result State
  const [roleVerification, setRoleVerification] = useState(null);

  const [newSkillInput, setNewSkillInput] = useState('');

  // Safe skills array reference
  const skillList = normalizeSkills(profile.skills);

  // Fetch initial profile data on mount
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setFetching(true);
        const res = await getMe();
        if (res?.data && isMounted) {
          const freshData = res.data;
          setIsUserTypeLocked(freshData.isUserTypeLocked || false);
          setProfileCompleted(freshData.profileCompleted || false);
          setProfile({
            name: freshData.name || user?.name || '',
            email: freshData.email || user?.email || '',
            role: freshData.role || user?.role || 'student',
            college: freshData.college || '',
            branch: freshData.branch || '',
            graduationYear: freshData.graduationYear || '',
            targetRole: freshData.targetRole || '',
            skills: normalizeSkills(freshData.skills),
            bio: freshData.bio || '',
            phone: freshData.phone || '',
            linkedIn: freshData.linkedIn || '',
            github: freshData.github || '',
            placementStatus: freshData.placementStatus || 'Looking for Jobs',
          });
          updateUser(freshData);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time Automatic AI Role Verification as user types (500ms Debounce, No Button Needed)
  useEffect(() => {
    const roleText = profile.targetRole ? profile.targetRole.trim() : '';

    if (!roleText) {
      setRoleVerification(null);
      setVerifyingRole(false);
      return;
    }

    setVerifyingRole(true);
    const timer = setTimeout(async () => {
      try {
        const res = await verifyTargetRole({
          targetRole: roleText,
          skills: skillList,
        });
        if (res?.data) {
          setRoleVerification(res.data);
        }
      } catch (err) {
        console.error('Real-time AI role check error:', err);
      } finally {
        setVerifyingRole(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [profile.targetRole]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.college,
      profile.branch,
      profile.graduationYear,
      profile.targetRole,
      skillList.length > 0,
      profile.bio,
      profile.phone,
      profile.linkedIn || profile.github,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleAddSkill = (skillToAdd) => {
    const skillName = typeof skillToAdd === 'string' ? skillToAdd.trim() : newSkillInput.trim();
    if (!skillName) return;

    if (skillList.map((s) => s.toLowerCase()).includes(skillName.toLowerCase())) {
      toast.error(`"${skillName}" is already in your stack`);
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [...normalizeSkills(prev.skills), skillName],
    }));

    if (typeof skillToAdd !== 'string') {
      setNewSkillInput('');
    }
    toast.success(`Added ${skillName} to skill stack`);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: normalizeSkills(prev.skills).filter((s) => s !== skillToRemove),
    }));
  };

  const handleApplySuggestedTitle = (suggestedTitle) => {
    if (!suggestedTitle) return;
    setProfile((prev) => ({ ...prev, targetRole: suggestedTitle }));
    toast.success(`Applied target role: "${suggestedTitle}"`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...profile,
        skills: skillList,
      };
      const res = await updateUserProfile(payload);
      if (res?.data) {
        updateUser(res.data);
        setIsUserTypeLocked(res.data.isUserTypeLocked || true);
        setProfileCompleted(res.data.profileCompleted || true);
      }
      toast.success('Profile updated & User Type saved to MongoDB!');
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
      toast.error(err?.response?.data?.error || 'Failed to update candidate profile');
    } finally {
      setLoading(false);
    }
  };

  const completionPercent = calculateCompletion();

  // Render Status Badge Pill directly
  const renderStatusBadge = () => {
    if (verifyingRole) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold border border-[#6366F1]/30 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
          <span>AI Checking Role...</span>
        </span>
      );
    }

    if (!roleVerification) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] text-xs font-semibold">
          <Bot className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Role Status Check</span>
        </span>
      );
    }

    const { color, badgeTitle } = roleVerification;

    if (color === 'green') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#10B981]/40 text-xs font-extrabold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>🟢 {badgeTitle || 'Verified Industry Role (Green)'}</span>
        </span>
      );
    }

    if (color === 'orange') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/40 text-xs font-extrabold shadow-xs">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          <span>🟠 {badgeTitle || 'Emerging / Niche Role (Orange)'}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#EF4444]/40 text-xs font-extrabold shadow-xs">
        <XCircle className="w-4 h-4 text-[#EF4444]" />
        <span>🔴 {badgeTitle || 'Unclear / Rare Role (Red)'}</span>
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-xs font-bold text-[#4F46E5] mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Placement Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Candidate Profile & Credentials
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Manage your academic standing, target roles, technical skill stack, and placement status.
            </p>
          </div>

          {/* Completion Progress Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm min-w-[220px]">
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A] mb-1.5">
              <span>Profile Strength</span>
              <span className="text-[#4F46E5]">{completionPercent}%</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#4F46E5] to-[#10B981] h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {!profileCompleted && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#EF4444]/40 text-[#B91C1C] flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#991B1B]">Compulsory Candidate Profile & Target Role Setup</h4>
                <p className="text-xs font-semibold text-[#B91C1C] mt-0.5">
                  Welcome! Please enter your academic details and choose your primary Target Role. Once saved, your role becomes permanent and non-changeable.
                </p>
              </div>
            </div>
          </div>
        )}

        {fetching && (
          <div className="flex items-center justify-center p-8 text-xs font-semibold text-[#64748B]">
            <Loader2 className="w-5 h-5 animate-spin text-[#4F46E5] mr-2" />
            Loading candidate details...
          </div>
        )}

        {!fetching && (
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Candidate Summary Card & Badges */}
            <div className="space-y-6">
              {/* Profile Main Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4F46E5] via-[#6366F1] to-[#3B82F6] flex items-center justify-center text-white text-3xl font-extrabold shadow-md ring-4 ring-white">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div
                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white"
                    title="Active Account"
                  />
                </div>

                <h3 className="text-lg font-bold text-[#0F172A]">{profile.name || 'Candidate Name'}</h3>
                <p className="text-xs text-[#64748B] font-medium mt-0.5">{profile.email}</p>

                {/* Target Role & AI Status */}
                <div className="mt-3 flex flex-col items-center gap-2">
                  <p className="text-xs text-[#4F46E5] font-bold">{profile.targetRole}</p>
                  {renderStatusBadge()}
                </div>

                {/* Placement Status Selector */}
                <div className="mt-4 w-full pt-4 border-t border-[#F1F5F9]">
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 text-left">
                    Placement Status
                  </label>
                  <select
                    value={profile.placementStatus}
                    onChange={(e) => setProfile({ ...profile, placementStatus: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Looking for Jobs">🎯 Looking for Jobs</option>
                    <option value="Interviewing">💬 Actively Interviewing</option>
                    <option value="Placed">🎉 Placed / Hired</option>
                    <option value="Not Active">⏸️ Not Currently Active</option>
                  </select>
                </div>

                {/* Direct Social Links Preview */}
                <div className="mt-4 w-full flex items-center justify-center gap-3">
                  {profile.linkedIn ? (
                    <a
                      href={profile.linkedIn.startsWith('http') ? profile.linkedIn : `https://${profile.linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
                      title="LinkedIn Profile"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  ) : null}
                  {profile.github ? (
                    <a
                      href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#F8FAFC] text-[#0F172A] hover:bg-[#E2E8F0] transition-colors border border-[#E2E8F0]"
                      title="GitHub Profile"
                    >
                      <GitHubIcon className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Earned Badges & Achievements */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#4F46E5]" />
                    <span>Candidate Credentials</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981]">
                    Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/60">
                    <div className="p-2 rounded-lg bg-[#EEF2FF] text-[#4F46E5] mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">ATS Verified Resume</h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Resume scanned & candidate profile qualified for campus interviews.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/60">
                    <div className="p-2 rounded-lg bg-[#ECFDF5] text-[#10B981] mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">AI Mock Interview Ready</h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Completed standard practice drills & posture check.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Editable Profile & Academic Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Credentials Form Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
                  <GraduationCap className="w-5 h-5 text-[#4F46E5]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">Academic & Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#64748B]" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                      placeholder="e.g. Alex Johnson"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#64748B]" /> Email Address
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={profile.email}
                      className="w-full h-10 px-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#64748B] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#64748B]" /> User Type
                      </label>
                      {isUserTypeLocked && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/30">
                          🔒 Permanent (Non-Editable)
                        </span>
                      )}
                    </div>
                    {isUserTypeLocked ? (
                      <input
                        type="text"
                        readOnly
                        value={profile.role === 'recruiter' ? '💼 Recruiter / Placement Officer' : '🎓 Student / Candidate'}
                        className="w-full h-10 px-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#64748B] cursor-not-allowed"
                      />
                    ) : (
                      <select
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                      >
                        <option value="student">🎓 Student / Candidate</option>
                        <option value="recruiter">💼 Recruiter / Placement Officer</option>
                      </select>
                    )}
                    <p className="text-[11px] text-[#64748B] font-medium mt-1">
                      {isUserTypeLocked
                        ? '🔒 User Type (Student vs Recruiter) is permanently locked for your account.'
                        : '⚠️ Compulsory: Choose your User Type. Once saved, your User Type becomes permanently locked.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#64748B]" /> University / Institute Name
                    </label>
                    <input
                      type="text"
                      value={profile.college}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                      placeholder="e.g. LJ Institute of Engineering & Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#64748B]" /> Branch / Degree
                    </label>
                    <input
                      type="text"
                      value={profile.branch}
                      onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#64748B]" /> Graduation Year
                    </label>
                    <input
                      type="text"
                      value={profile.graduationYear}
                      onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                      placeholder="e.g. 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#64748B]" /> Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Placement & Technical Credentials Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
                  <Briefcase className="w-5 h-5 text-[#4F46E5]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">Target Job Role & Technical Stack</h3>
                </div>

                {/* Target Role Field with Automatic Real-Time AI Badge */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <span>Primary Target Job Role / Position</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/30">
                        ✏️ Editable Anytime
                      </span>
                    </label>
                    {renderStatusBadge()}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={profile.targetRole}
                      onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                      className={`w-full h-11 px-3.5 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        roleVerification?.color === 'green'
                          ? 'bg-[#F0FDF4]/30 border-[#10B981] focus:border-[#10B981]'
                          : roleVerification?.color === 'orange'
                          ? 'bg-[#FFFBEB]/30 border-[#F59E0B] focus:border-[#F59E0B]'
                          : roleVerification?.color === 'red'
                          ? 'bg-[#FEF2F2]/30 border-[#EF4444] focus:border-[#EF4444]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#4F46E5]'
                      }`}
                      placeholder="Write full job role (e.g. Full Stack MERN Developer / Senior React Engineer)"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] font-medium mt-1.5">
                    🤖 AI evaluates whether this full job role exists in the tech hiring market.
                  </p>
                </div>

                {/* AI Assessment & Missing Skills Insights Card */}
                {roleVerification && (
                  <div
                    className={`p-4 rounded-xl border space-y-3 transition-all ${
                      roleVerification.color === 'green'
                        ? 'bg-[#F0FDF4] border-[#10B981]/30'
                        : roleVerification.color === 'orange'
                        ? 'bg-[#FFFBEB] border-[#F59E0B]/30'
                        : 'bg-[#FEF2F2] border-[#EF4444]/30'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <BrainCircuit
                        className={`w-5 h-5 mt-0.5 ${
                          roleVerification.color === 'green'
                            ? 'text-[#10B981]'
                            : roleVerification.color === 'orange'
                            ? 'text-[#F59E0B]'
                            : 'text-[#EF4444]'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-[#0F172A]">
                            AI Role Assessment ({roleVerification.confidenceScore}% Market Validity)
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              roleVerification.color === 'green'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : roleVerification.color === 'orange'
                                ? 'bg-[#FEF3C7] text-[#B45309]'
                                : 'bg-[#FEE2E2] text-[#B91C1C]'
                            }`}
                          >
                            {roleVerification.color.toUpperCase()} STATUS
                          </span>
                        </div>
                        <p className="text-xs text-[#334155] mt-1 font-medium leading-relaxed">
                          {roleVerification.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Role Title Fix */}
                    {roleVerification.recommendedRoleTitle && (
                      <div className="pt-2 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#0F172A]">
                          Suggested Standard Title: <span className="font-bold text-[#4F46E5]">{roleVerification.recommendedRoleTitle}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleApplySuggestedTitle(roleVerification.recommendedRoleTitle)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#4F46E5] text-white text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <span>Apply Title</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* AI Missing Required Skills Recommendations */}
                    {Array.isArray(roleVerification.missingKeySkills) && roleVerification.missingKeySkills.length > 0 && (
                      <div className="pt-2 border-t border-black/5">
                        <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2">
                          Recommended Skills for "{profile.targetRole}":
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {roleVerification.missingKeySkills.map((missingSkill, idx) => {
                            const alreadyAdded = skillList
                              .map((s) => s.toLowerCase())
                              .includes(missingSkill.toLowerCase());

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAddSkill(missingSkill)}
                                disabled={alreadyAdded}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                  alreadyAdded
                                    ? 'bg-[#E2E8F0] text-[#64748B] border-[#CBD5E1] cursor-default'
                                    : 'bg-white text-[#4F46E5] border-[#6366F1]/30 hover:bg-[#EEF2FF] shadow-xs cursor-pointer'
                                }`}
                              >
                                {alreadyAdded ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                    <span>{missingSkill} (Added)</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3 text-[#4F46E5]" />
                                    <span>+ Add {missingSkill}</span>
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Technical Skills Tag Manager */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#64748B]" /> Technical Skills & Stack
                  </label>
                  
                  {/* Skill Tag Pills Display */}
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl min-h-[52px]">
                    {skillList.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#6366F1]/20 text-xs font-semibold"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:bg-[#E0E7FF] rounded-full p-0.5 transition-colors text-[#4F46E5]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {skillList.length === 0 && (
                      <span className="text-xs text-[#94A3B8] italic self-center">No skill tags added yet.</span>
                    )}
                  </div>

                  {/* Add New Skill Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSkill();
                      }}
                      placeholder="Add a technology or skill (e.g. Next.js, Python, SQL)"
                      className="flex-1 h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="px-4 h-10 rounded-lg bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] text-xs font-semibold transition-colors flex items-center gap-1 border border-[#6366F1]/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* About Candidate / Bio */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#64748B]" /> Short Candidate Bio / Pitch
                  </label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5] focus:bg-white resize-none"
                    placeholder="Briefly describe your career goals, key strengths, or placement objective..."
                  />
                </div>

                {/* Online Profiles / Portfolios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#0A66C2]" /> LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={profile.linkedIn}
                      onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5]"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#0F172A]" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#4F46E5]"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Candidate Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
