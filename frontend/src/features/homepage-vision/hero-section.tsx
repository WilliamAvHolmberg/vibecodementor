'use client';

import { useState } from 'react';
import { Rocket, Users, Code, Lightbulb, Globe, Zap, Target, Building2 } from 'lucide-react';

export function HeroSection() {
  const [activeTab, setActiveTab] = useState('vision');

  const roadmapItems = [
    {
      icon: <Code className="w-5 h-5" />,
      title: "AI Prototype Builder",
      description: "Generate working React apps in 30 seconds",
      status: "Coming Soon",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Developer Community",
      description: "Forums, discussions, and collaboration",
      status: "Planning",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Learning Platform",
      description: "Tutorials, courses, and hands-on projects",
      status: "In Progress",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Consulting Services",
      description: "From prototype to production partnerships",
      status: "Available",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const whyNowPoints = [
    {
      icon: "🤖",
      title: "AI Revolution",
      description: "Development is changing faster than ever. Stay ahead of the curve."
    },
    {
      icon: "⚡",
      title: "Speed Matters",
      description: "Ship faster, iterate quicker, and validate ideas in days, not months."
    },
    {
      icon: "🌍",
      title: "Global Opportunity",
      description: "Remote-first world means Swedish expertise can serve anyone, anywhere."
    }
  ];

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20" />
      
      {/* Floating Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Hero Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-2xl">
            <span className="text-white text-2xl sm:text-3xl">🚀</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              VibeCodeMentor.net
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8">
            We&apos;re building the future of AI-powered development. A place where rapid prototyping meets production-ready solutions, 
            where community meets cutting-edge technology, and where Swedish innovation serves the global market.
          </p>

          {/* Quick CTA */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => {
                const newsletterSection = document.getElementById('newsletter');
                if (newsletterSection) {
                  newsletterSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>🚀</span>
              Join us!
            </button>
          </div>
          
          {/* Based in Sweden badge
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-yellow-100 dark:from-blue-900/30 dark:to-yellow-900/30 rounded-full border border-blue-200 dark:border-blue-700 mb-8">
            <span className="text-lg">🇸🇪</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Based in Sweden • Serving Globally</span>
          </div> */}

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {['OpenRouter AI', 'Next.js 15', '.NET 9', 'SignalR', 'PostgreSQL', 'Open Source'].map((tech) => (
              <span
                key={tech}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

                {/* Open Source Repository Highlight */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Open Source</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                    🚀 This <span className="text-indigo-600 dark:text-indigo-400">Entire Repository</span> is Your Starting Point
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Don&apos;t just join the community - clone the foundation! This entire codebase is open source and 
                    optimized for rapid AI-powered development. Start building immediately.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-xs">⚡</span>
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Next.js 15 + .NET 9 + OpenRouter integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 dark:text-purple-400 text-xs">🤖</span>
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">AI function calling patterns built-in</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 text-xs">🚀</span>
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Docker + PostgreSQL + Production ready</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 sm:p-6 text-green-400 font-mono text-xs sm:text-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 ml-2">terminal</span>
                  </div>
                  <div className="space-y-2">
                    <div className="break-all"><span className="text-blue-400">$</span> git clone git@github.com:WilliamAvHolmberg/vibecodementor.git</div>
                    <div><span className="text-blue-400">$</span> npm run setup:local</div>
                    <div><span className="text-blue-400">$</span> npm run install:all</div>
                    <div><span className="text-blue-400">$</span> npm run start:all</div>
                    <div className="text-gray-500"># AI-powered app running in 2 minutes ⚡</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 text-center">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-700/50">
                  <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    💡 The same stack that powers this site, Glenn Explore, and our client projects - all yours to use!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              {[
                { id: 'vision', label: 'Our Vision', icon: <Target className="w-4 h-4" /> },
                { id: 'building', label: "What We're Building", icon: <Rocket className="w-4 h-4" /> },
                { id: 'why', label: 'Why Now?', icon: <Zap className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
          
          {/* Vision Tab */}
          {activeTab === 'vision' && (
            <div className="p-6 sm:p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    AI-Powered Development Community + Consulting
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Community First</h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                          A thriving ecosystem where developers learn, share, and build amazing things together using AI-powered tools.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Prototype to Production</h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                          We help businesses transform ideas into reality at lightning speed, leveraging AI and modern development practices.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Swedish Innovation, Global Impact</h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                          Rooted in Swedish engineering excellence, we&apos;re building solutions that serve developers and businesses worldwide.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 sm:p-8 border border-indigo-200/50 dark:border-indigo-700/50">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    🌟 Early Access Community
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6">
                    You&apos;re seeing this in the early stages. We&apos;re building in public and would love you to be part of the journey.
                  </p>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Building in Public</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Building Tab */}
          {activeTab === 'building' && (
            <div className="p-6 sm:p-8 md:p-12">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
                Here&apos;s What We&apos;re Building 🚀
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {roadmapItems.map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{item.title}</h4>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          item.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          item.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 sm:mt-8 text-center">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-indigo-200/50 dark:border-indigo-700/50">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                    <strong>Transparency:</strong> We&apos;re just getting started, but we have big plans. Each piece will be built with the community&apos;s input and needs in mind.
                  </p>
                  <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    Want to influence what we build next? Join the early access community!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Why Now Tab */}
          {activeTab === 'why' && (
            <div className="p-6 sm:p-8 md:p-12">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
                Why AI Development Community? Why Now? ⚡
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {whyNowPoints.map((point, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl sm:text-4xl mb-4">{point.icon}</div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">{point.title}</h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{point.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 sm:mt-12 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 sm:p-8 border border-orange-200/50 dark:border-orange-700/50">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  🎯 The Perfect Storm
                </h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                  AI is democratizing development. Remote work is here to stay. Speed is the new competitive advantage. 
                  We&apos;re positioned at the intersection of these trends, ready to help developers and businesses thrive in this new world.
                </p>
                <div className="text-center mt-6">
                  <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">
                    The question isn&apos;t &quot;Why now?&quot; — it&apos;s &quot;Why not sooner?&quot;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main CTA Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 sm:p-8 border border-emerald-200/50 dark:border-emerald-700/50">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Join the Movement? 🚀
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Be the first to know about new AI tools, exclusive tutorials, and community updates. 
              Join developers who are shaping the future of AI-powered development.
            </p>
            <button
              onClick={() => {
                const newsletterSection = document.getElementById('newsletter');
                if (newsletterSection) {
                  newsletterSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Users className="w-5 h-5" />
              Join the Community
            </button>
            <div className="mt-4">
              <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Free forever • No spam • Early access to new features
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 