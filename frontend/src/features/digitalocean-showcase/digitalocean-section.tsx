'use client';

import { Cloud, Zap, Heart, Brain, Rocket, Globe } from 'lucide-react';

export function DigitalOceanSection() {
  const philosophyPoints = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Simple by Design",
      description: "Clean interfaces, clear pricing, straightforward docs",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Pragmatic Scaling",
      description: "Start small, grow smart - add complexity when you need it",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Developer Joy",
      description: "When infrastructure just works, you innovate more",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Friendly",
      description: "Clear architecture that both humans and AI understand",
      color: "from-purple-500 to-indigo-600"
    }
  ];

  const journeyHighlights = [
    {
      icon: "🎯",
      title: "Focus on Value",
      description: "We chose tools that let us build features, not fight infrastructure"
    },
    {
      icon: "🏗️",
      title: "Monolith Advantage", 
      description: "One codebase, one deployment, one truth - easier for everyone"
    },
    {
      icon: "⚡",
      title: "Speed Matters",
      description: "From idea to production in hours, not weeks of configuration"
    }
  ];

  // const stackSynergy = [
  //   {
  //     dotnet: ".NET Background Jobs",
  //     digitalocean: "Reliable Droplets",
  //     result: "Hangfire + solid infrastructure = worry-free automation"
  //   },
  //   {
  //     dotnet: "SignalR Real-time",
  //     digitalocean: "DO Networking",
  //     result: "WebSockets that just work, globally"
  //   },
  //   {
  //     dotnet: "EF Migrations",
  //     digitalocean: "Managed PostgreSQL",
  //     result: "Database evolution without the ops overhead"
  //   }
  // ];

  // const alternatives = [
  //   {
  //     scenario: "Enterprise with complex compliance",
  //     suggestion: "AWS might offer more specialized tools"
  //   },
  //   {
  //     scenario: "Serverless-first architecture",
  //     suggestion: "Vercel/Netlify could be simpler"
  //   },
  //   {
  //     scenario: "Massive scale from day one",
  //     suggestion: "Google Cloud has powerful auto-scaling"
  //   }
  // ];

  return (
    <section id="digitalocean" className="py-16 px-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900/50 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
            <Cloud className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DigitalOcean</span>: Where Rapid Development Feels Natural
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We chose DigitalOcean not because it&apos;s the only option, but because it perfectly aligns with our 
            philosophy: simple, pragmatic, and focused on what actually matters.
          </p>
        </div>

        {/* Philosophy Match */}
        <div className="mb-16">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  🤝 The Philosophy Match
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  DigitalOcean thinks like we think - simple solutions for complex problems.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {philosophyPoints.map((point, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${point.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                      {point.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {point.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Our Journey */}
        <div className="mb-16">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  🚀 Our Journey: Why This Stack
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  We&apos;ve learned that the best architecture is the one that gets out of your way.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {journeyHighlights.map((highlight, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200/20 dark:border-gray-700/20">
                    <div className="text-3xl mb-3">{highlight.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {highlight.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <p className="text-blue-700 dark:text-blue-300 text-center font-medium">
                  💡 <strong>Key Learning:</strong> When your infrastructure is boring and reliable, 
                  your product innovation becomes exciting and rapid.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
              🚀 See It in Action
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              This entire site runs on a simple DigitalOcean droplet. Try the features below to see 
              how our pragmatic stack delivers real-world performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const chatSection = document.getElementById('chat');
                  if (chatSection) {
                    chatSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Try Real-time Chat
              </button>
              <button
                onClick={() => {
                  const analyticsSection = document.getElementById('analytics');
                  if (analyticsSection) {
                    analyticsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3 bg-blue-400 text-white font-semibold rounded-xl hover:bg-blue-300 transition-colors"
              >
                View Live Analytics
              </button>
            </div>
            <div className="mt-6 text-blue-100 text-sm">
              <Globe className="w-4 h-4 inline mr-2" />
              Hosted on a $5/month DigitalOcean droplet in EU Central
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 