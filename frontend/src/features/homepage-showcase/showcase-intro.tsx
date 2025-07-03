'use client';

import { MessageSquare, BarChart3, Bot, Zap, Code2, Rocket } from 'lucide-react';

export function ShowcaseIntro() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "SignalR-powered messaging",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Live Analytics",
      description: "Real-time metrics dashboard",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI Assistant",
      description: "OpenRouter integration",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6">
            <span className="text-white text-xl">✨</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Built-in Features</span> Ready to Use
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Don&apos;t start from scratch. This repository comes loaded with production-ready features 
            that you can use immediately or customize for your needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
          <div className="p-8 md:p-12">
            
            {/* Top Description */}
            <div className="text-center mb-10">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                🚀 What You Get Out of the Box
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Use them as-is or as inspiration for your own implementations.
              </p>
            </div>

            {/* Features Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Technical Highlights */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Real-time First</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">SignalR for live updates</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Type-safe APIs</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Auto-generated TypeScript</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Production Ready</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Docker + PostgreSQL</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                👇 <strong>Try them out below!</strong> Each feature is interactive and shows you what&apos;s possible.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Live Demo Below</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 