"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function OnboardingPage() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    company: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    chronotype: "morning_person",
    focusPreference: "deep_work",
    shortTermGoals: "",
    longTermGoals: "",
    priorityAreas: [],
    howDidYouFindUs: "",
    dailyProductivityHours: "6-8"
  });

  const totalSteps = 4;

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        // Pre-fill name and email if available
        setFormData(prev => ({
          ...prev,
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || ""
        }));
      }
    };
    checkUser();
  }, [router]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Save user profile to Supabase
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          profession: formData.profession,
          company: formData.company,
          time_zone: formData.timeZone,
          working_hours_start: formData.workingHours.start,
          working_hours_end: formData.workingHours.end,
          chronotype: formData.chronotype,
          focus_preference: formData.focusPreference,
          short_term_goals: formData.shortTermGoals,
          long_term_goals: formData.longTermGoals,
          priority_areas: formData.priorityAreas,
          how_found_us: formData.howDidYouFindUs,
          daily_productivity_hours: formData.dailyProductivityHours,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          onboarding_completed: true,
          full_name: formData.fullName 
        }
      });

      if (updateError) throw updateError;

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions = [
    "Career Growth", "Health & Fitness", "Learning & Education", 
    "Relationships", "Financial Goals", "Creative Projects", 
    "Side Business", "Hobbies", "Travel", "Personal Development"
  ];

  const referralOptions = [
    "Google Search", "Social Media (LinkedIn)", "Social Media (Twitter)", 
    "Social Media (Instagram)", "Friend Referral", "Blog/Article", 
    "YouTube", "Podcast", "App Store", "Other"
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
              <p className="text-gray-300">Let's get to know you better</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profession</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  placeholder="e.g., Software Engineer, Designer, Student"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company/Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  placeholder="Where do you work or study?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time Zone</label>
                <input
                  type="text"
                  value={formData.timeZone}
                  onChange={(e) => handleInputChange('timeZone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Work Preferences</h2>
              <p className="text-gray-300">Help us understand your work style</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Work Start Time</label>
                  <input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => handleInputChange('workingHours.start', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Work End Time</label>
                  <input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => handleInputChange('workingHours.end', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Are you a morning person or night owl?</label>
                <select
                  value={formData.chronotype}
                  onChange={(e) => handleInputChange('chronotype', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="morning_person">Morning Person 🌅</option>
                  <option value="night_owl">Night Owl 🦉</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Focus Preference</label>
                <select
                  value={formData.focusPreference}
                  onChange={(e) => handleInputChange('focusPreference', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="deep_work">Deep Work Blocks (2+ hours)</option>
                  <option value="pomodoro">Pomodoro Sprints (25-minute intervals)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Daily Productive Hours</label>
                <select
                  value={formData.dailyProductivityHours}
                  onChange={(e) => handleInputChange('dailyProductivityHours', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="4-6">4-6 hours</option>
                  <option value="6-8">6-8 hours</option>
                  <option value="8-10">8-10 hours</option>
                  <option value="10+">10+ hours</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Goals & Priorities</h2>
              <p className="text-gray-300">What matters most to you?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short-term Goals (Next 3 months)</label>
                <textarea
                  value={formData.shortTermGoals}
                  onChange={(e) => handleInputChange('shortTermGoals', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent h-24 resize-none"
                  placeholder="What do you want to achieve in the next 3 months?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Long-term Goals (Next 1-2 years)</label>
                <textarea
                  value={formData.longTermGoals}
                  onChange={(e) => handleInputChange('longTermGoals', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent h-24 resize-none"
                  placeholder="Where do you see yourself in 1-2 years?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Priority Areas (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleArrayToggle('priorityAreas', option)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        formData.priorityAreas.includes(option)
                          ? 'bg-purple-500 text-white border border-purple-400'
                          : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Almost Done!</h2>
              <p className="text-gray-300">Just one more thing...</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">How did you find us?</label>
                <select
                  value={formData.howDidYouFindUs}
                  onChange={(e) => handleInputChange('howDidYouFindUs', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="">Please select...</option>
                  {referralOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="text-white font-medium">Name:</span> {formData.fullName}</p>
                  <p><span className="text-white font-medium">Profession:</span> {formData.profession}</p>
                  <p><span className="text-white font-medium">Work Hours:</span> {formData.workingHours.start} - {formData.workingHours.end}</p>
                  <p><span className="text-white font-medium">Chronotype:</span> {formData.chronotype === 'morning_person' ? 'Morning Person' : 'Night Owl'}</p>
                  <p><span className="text-white font-medium">Focus Style:</span> {formData.focusPreference === 'deep_work' ? 'Deep Work' : 'Pomodoro'}</p>
                  {formData.priorityAreas.length > 0 && (
                    <p><span className="text-white font-medium">Priorities:</span> {formData.priorityAreas.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-10 animate-ping"></div>
      </div>

      {/* Main container */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            zchedule.ai
          </div>
          <p className="text-gray-300 text-sm">Complete your profile to get started</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-300">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form container */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {renderStep()}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip option */}
        {currentStep < totalSteps && (
          <div className="text-center mt-4">
            <button
              onClick={() => setCurrentStep(totalSteps)}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              Skip to end
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
