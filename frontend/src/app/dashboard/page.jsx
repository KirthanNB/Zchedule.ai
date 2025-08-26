"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
          router.push("/login");
          return;
        }

        setUser(userData.user);

        // Check if user has completed onboarding
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userData.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', {
            message: profileError?.message,
            code: profileError?.code,
            details: profileError?.details,
            hint: profileError?.hint,
          });

        }

        if (!profileData || !profileData.onboarding_completed) {
          router.push("/onboarding");
          return;
        }

        setUserProfile(profileData);
      } catch (error) {
        console.error('Error:', error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to conquer today?",
      "Your future self will thank you!",
      "Every minute counts towards your goals",
      "Let's make today productive!",
      "Time to turn dreams into plans"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getProductivityTip = () => {
    const tips = [
      "Try the 2-minute rule: If it takes less than 2 minutes, do it now!",
      "Block similar tasks together for better focus.",
      "Take a 5-minute break every hour to stay fresh.",
      "Review your goals every morning to stay aligned.",
      "Celebrate small wins to maintain momentum!"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const mockScheduleData = [
    { time: "09:00", task: "Team Standup", type: "meeting", duration: "30min" },
    { time: "10:00", task: "Deep Work Block", type: "focus", duration: "2h" },
    { time: "14:00", task: "Project Review", type: "meeting", duration: "1h" },
    { time: "16:00", task: "Learning Time", type: "development", duration: "1h" }
  ];

  const getTaskIcon = (type) => {
    switch (type) {
      case 'meeting': return '🤝';
      case 'focus': return '🎯';
      case 'development': return '📚';
      case 'work': return '💼';
      case 'break': return '☕';
      case 'learning': return '📚';
      case 'exercise': return '🏃';
      case 'personal': return '⭐';
      default: return '📋';
    }
  };

  const generateSchedule = async () => {
    setIsGenerating(true);
    setScheduleError(null);

    try {
      const response = await fetch("http://localhost:8000/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    wakeUpTime: userProfile.wake_up_time || "07:00",
    bedTime: userProfile.bed_time || "23:00",
    sleepPreference: userProfile.chronotype || "morning_person",
    focusPreference: userProfile.focus_preference || "deep_work",
    shortTermGoals: userProfile.short_term_goals || "",
    longTermGoals: userProfile.long_term_goals || "",
    workingHoursStart: userProfile.working_hours_start || "09:00",
    workingHoursEnd: userProfile.working_hours_end || "17:00",
    dailyProductivityHours: userProfile.daily_productivity_hours || "8",
    priorityAreas: userProfile.priority_areas || [],
    fixedCommitments: userProfile.fixed_commitments || []
  }),
});


      if (!response.ok) {
        throw new Error("Failed to generate schedule");
      }

      const schedule = await response.json();
      setGeneratedSchedule(schedule);
    } catch (err) {
      setScheduleError(err.message);
      console.error("Error generating schedule:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const ScheduleGenerator = () => (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">AI Schedule Generator</h2>
      <p className="text-gray-300 mb-6">
        Generate an optimized schedule based on your preferences, goals, and chronotype.
      </p>

      {scheduleError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg">
          Error: {scheduleError}
        </div>
      )}

      <button
        onClick={generateSchedule}
        disabled={isGenerating}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            Generating your schedule...
          </div>
        ) : (
          "Generate New Schedule with AI"
        )}
      </button>
    </div>
  );

  const ScheduleViewer = ({ schedule }) => {
    if (!schedule) return null;

    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Your AI-Generated Schedule</h2>
        <div className="space-y-6">
          {Object.entries(schedule).map(([day, scheduleItems]) => (
            <div key={day} className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4 capitalize border-b border-white/10 pb-2">{day}</h3>
              <div className="space-y-3">
                {scheduleItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="text-2xl mr-4">
                      {getTaskIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-white">{item.activity}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${item.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                          }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-gray-300">
                        {item.startTime} - {item.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-10 animate-ping"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            zchedule.ai
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">Welcome back,</p>
              <p className="text-white font-medium">{userProfile?.full_name || user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {getGreeting()}, {userProfile?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-300 text-lg mb-4">{getMotivationalMessage()}</p>
              <p className="text-purple-300 font-medium">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-6xl">
              {userProfile?.chronotype === 'morning_person' ? '🌅' : '🌙'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'schedule', label: 'Today\'s Schedule', icon: '📅' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Today's Focus</p>
                    <p className="text-2xl font-bold text-white">
                      {userProfile?.focus_preference === 'deep_work' ? 'Deep Work' : 'Pomodoro'}
                    </p>
                  </div>
                  <div className="text-3xl">{userProfile?.focus_preference === 'deep_work' ? '🧠' : '🍅'}</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Productive Hours</p>
                    <p className="text-2xl font-bold text-white">{userProfile?.daily_productivity_hours || '6-8'}</p>
                  </div>
                  <div className="text-3xl">⏰</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Work Hours</p>
                    <p className="text-2xl font-bold text-white">
                      {userProfile?.working_hours_start?.slice(0, 5)} - {userProfile?.working_hours_end?.slice(0, 5)}
                    </p>
                  </div>
                  <div className="text-3xl">🕒</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Time Zone</p>
                    <p className="text-lg font-bold text-white">{userProfile?.time_zone?.split('/')[1] || 'UTC'}</p>
                  </div>
                  <div className="text-3xl">🌍</div>
                </div>
              </div>
            </div>

            {/* Productivity Tip */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                <span className="mr-3">💡</span>
                Daily Productivity Tip
              </h3>
              <p className="text-gray-200">{getProductivityTip()}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab('schedule')}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200 transform hover:scale-105 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
                <h3 className="text-lg font-bold text-white mb-2">Quick Schedule</h3>
                <p className="text-gray-300 text-sm">Generate today's schedule with AI</p>
              </button>

              <button className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200 transform hover:scale-105 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
                <h3 className="text-lg font-bold text-white mb-2">Analytics</h3>
                <p className="text-gray-300 text-sm">View your productivity insights</p>
              </button>

              <button
                onClick={() => setActiveTab('goals')}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200 transform hover:scale-105 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                <h3 className="text-lg font-bold text-white mb-2">Set Goals</h3>
                <p className="text-gray-300 text-sm">Update your objectives</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <ScheduleGenerator />

            {generatedSchedule ? (
              <ScheduleViewer schedule={generatedSchedule} />
            ) : (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">📅</span>
                  Today's Schedule
                </h2>

                <div className="space-y-4">
                  {mockScheduleData.map((item, index) => (
                    <div key={index} className="flex items-center p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200">
                      <div className="text-3xl mr-4">{getTaskIcon(item.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">{item.task}</h3>
                          <span className="text-purple-300 font-medium">{item.duration}</span>
                        </div>
                        <p className="text-gray-300">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">🎯</span>
                Your Goals
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">⚡</span>
                    Short-term Goals (3 months)
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {userProfile?.short_term_goals || "No short-term goals set yet."}
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🚀</span>
                    Long-term Goals (1-2 years)
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {userProfile?.long_term_goals || "No long-term goals set yet."}
                  </p>
                </div>
              </div>

              {userProfile?.priority_areas && userProfile.priority_areas.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Priority Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.priority_areas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]">
                Update Goals
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">⚙️</span>
                Profile Settings
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <p className="text-white font-medium">{userProfile?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Profession</label>
                    <p className="text-white font-medium">{userProfile?.profession || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                    <p className="text-white font-medium">{userProfile?.company || 'Not set'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Chronotype</label>
                    <p className="text-white font-medium">
                      {userProfile?.chronotype === 'morning_person' ? 'Morning Person 🌅' : 'Night Owl 🌙'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Focus Preference</label>
                    <p className="text-white font-medium">
                      {userProfile?.focus_preference === 'deep_work' ? 'Deep Work Blocks' : 'Pomodoro Sprints'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">How You Found Us</label>
                    <p className="text-white font-medium">{userProfile?.how_found_us || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                    <p className="text-white font-medium">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105">
                  Edit Profile
                </button>
                <button className="px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-medium rounded-lg transition-all duration-200">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
