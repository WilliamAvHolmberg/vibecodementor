'use client';

import { Github, Star, ArrowRight, Code, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20" />
      
      {/* Floating Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-2xl">
            <span className="text-white text-2xl sm:text-3xl">🚀</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 dark:text-white mb-6 tracking-tight">
            Ship AI-Powered Apps in 
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Days, Not Months
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
            Production-ready <strong>Next.js + .NET starter</strong> with AI integration, real-time features, 
            and everything you need to build modern applications fast. Clone, customize, ship.
          </p>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Next.js 15', '.NET 9', 'OpenRouter AI', 'SignalR', 'PostgreSQL', 'Docker Ready'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="/features"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              <span>🎮</span>
              Explore Features
              <ArrowRight className="w-5 h-5" />
            </a>
            
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-lg">
              <Github className="w-5 h-5" />
              Clone & Start Building
            </button>
          </div>
          
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            Open Source • Production Ready • AI-Powered • No Vendor Lock-in
          </p>
        </div>

        {/* Open Source Repository Highlight */}
        <div className="mb-12">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Open Source</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                    🚀 This <span className="text-indigo-600 dark:text-indigo-400">Entire Repository</span> is Your Starting Point
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Don&apos;t just join the community - clone the foundation! This entire codebase is open source and 
                    optimized for rapid AI-powered development. Start building immediately.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                        <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
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
                    <div className="break-all"><span className="text-blue-400">$</span> git clone https://github.com/WilliamAvHolmberg/vibecodementor.git</div>
                    <div><span className="text-blue-400">$</span> npm run setup:local</div>
                    <div><span className="text-blue-400">$</span> npm run start:all</div>
                    <div className="text-gray-500"># AI-powered app running in 2 minutes ⚡</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-700/50">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    💡 The same stack that powers this site, Glenn Explore, and our client projects - all yours to use!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
            <div className="flex flex-wrap justify-center items-center gap-8 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Production Ready</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Battle-tested in real applications</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-lg">🇸🇪</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Swedish Innovation</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Nordic engineering excellence</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Built by developers who understand the pain of starting from scratch. 
              Join the movement toward faster, smarter development.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 