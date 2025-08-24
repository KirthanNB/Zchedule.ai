"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "AI-Powered Scheduling",
      description: "Smart algorithms that learn your preferences and optimize your time",
      icon: "🤖"
    },
    {
      title: "Intelligent Conflicts Resolution",
      description: "Automatically detects and suggests solutions for scheduling conflicts",
      icon: "⚡"
    },
    {
      title: "Personal Productivity Insights",
      description: "Get detailed analytics on your time usage and productivity patterns",
      icon: "📊"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-10 animate-ping"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-40 w-5 h-5 bg-cyan-400 rounded-full opacity-60 animate-bounce delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            zchedule.ai
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="px-6 py-2 text-white hover:text-purple-300 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            Schedule
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Smarter
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your chaotic calendar into a perfectly orchestrated symphony with AI-powered scheduling that adapts to your life
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link 
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-2xl"
            >
              Start Scheduling Now
            </Link>
            <button className="px-8 py-4 border border-white/20 text-white text-lg font-medium rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </button>
          </div>

          {/* Feature showcase */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">
                {features[currentFeature].icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {features[currentFeature].title}
              </h3>
              <p className="text-gray-300 text-lg">
                {features[currentFeature].description}
              </p>
            </div>
            
            {/* Feature indicators */}
            <div className="flex justify-center space-x-3">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentFeature 
                      ? "bg-purple-400 scale-125" 
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              2.5x
            </div>
            <p className="text-gray-300">More Productive</p>
          </div>
          
          <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              90%
            </div>
            <p className="text-gray-300">Less Scheduling Conflicts</p>
          </div>
          
          <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              5min
            </div>
            <p className="text-gray-300">Daily Setup Time</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: "🧠",
              title: "Smart Learning",
              description: "AI that understands your patterns and preferences over time"
            },
            {
              icon: "🔄",
              title: "Auto-Sync",
              description: "Seamlessly integrates with all your existing calendars"
            },
            {
              icon: "📱",
              title: "Mobile First",
              description: "Optimized for on-the-go scheduling and quick adjustments"
            },
            {
              icon: "🎯",
              title: "Goal Tracking",
              description: "Align your schedule with your personal and professional goals"
            },
            {
              icon: "🤝",
              title: "Team Collaboration",
              description: "Easy coordination with colleagues, friends, and family"
            },
            {
              icon: "🔒",
              title: "Privacy First",
              description: "Your data is encrypted and never shared without permission"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Schedule?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already revolutionized their productivity with zchedule.ai
          </p>
          <Link 
            href="/login"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-2xl"
          >
            Start Your Free Trial
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            zchedule.ai
          </div>
          <p className="text-gray-400 mb-6">
            Making time work for you, not against you
          </p>
          <div className="flex justify-center space-x-8 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}