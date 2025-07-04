import { Chat } from '@/features/chat';
import { MetricsDashboard } from '@/features/dashboard';
import { ImageGallery } from '@/features/homepage-gallery';
import { AuthShowcase } from '@/features/homepage-auth';
import { AnalyticsAssistantSection } from '@/features/analytics-assistant';
import { Code, Github } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Feature Demos | Real-time Chat, AI Assistant, Analytics & More',
  description: 'Explore live demos of production-ready features: SignalR real-time chat, OpenRouter AI assistant with 200+ models, live analytics dashboard, authentication system, and Cloudflare R2 file uploads.',
  keywords: [
    'real-time chat demo',
    'SignalR WebSocket',
    'OpenRouter AI demo', 
    'live analytics dashboard',
    'authentication system',
    'file upload demo',
    'Cloudflare R2',
    'Next.js features',
    '.NET 9 features',
    'production ready demos'
  ],
  openGraph: {
    title: 'Interactive Feature Demos - See Everything in Action',
    description: 'Live, functional demos of every built-in feature. Real-time chat, AI assistant, analytics, auth, and more. All production-ready.',
    type: 'website',
    url: 'https://vibecodementor.net/features',
    images: [
      {
        url: '/og-features.png',
        width: 1200,
        height: 630,
        alt: 'Interactive Feature Demos - Real-time Chat, AI, Analytics',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Feature Demos - Everything Works Out of the Box',
    description: 'Real-time chat, AI assistant, analytics, auth system, file uploads. All live and production-ready.',
    images: ['/og-features.png'],
  },
  alternates: {
    canonical: 'https://vibecodementor.net/features',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Features Page Header */}
      <section className="py-16 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
            <span className="text-white text-2xl">🚀</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Built-in Features
            </span> Playground
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
            Every feature below is <strong>production-ready and fully functional</strong>. Use them as-is, 
            customize for your needs, or learn from the implementation. This is what you get out of the box.
          </p>

          {/* Tech Stack Highlights */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              'Next.js 15 + React 19',
              '.NET 9 + SignalR', 
              'OpenRouter AI',
              'PostgreSQL + Docker',
              'TypeScript + Tailwind',
              'Production Ready'
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Clone Repo CTA */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 p-6 inline-block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Ready to Build?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clone this entire repository and start building immediately</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Clone & Start
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Navigation */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Quick Navigation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Jump to any feature and see it in action
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { 
                  name: 'Real-time Chat', 
                  id: 'chat', 
                  icon: '💬',
                  description: 'SignalR messaging',
                  color: 'from-blue-500 to-purple-600',
                  bgColor: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                },
                { 
                  name: 'Live Analytics', 
                  id: 'analytics', 
                  icon: '📊',
                  description: 'Real-time metrics',
                  color: 'from-cyan-500 to-blue-600',
                  bgColor: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20'
                },
                { 
                  name: 'AI Assistant', 
                  id: 'ai-assistant', 
                  icon: '🤖',
                  description: 'OpenRouter integration',
                  color: 'from-orange-500 to-red-500',
                  bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
                },
                { 
                  name: 'Image Gallery', 
                  id: 'gallery', 
                  icon: '🖼️',
                  description: 'File upload system',
                  color: 'from-green-500 to-emerald-600',
                  bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                },
                { 
                  name: 'Authentication', 
                  id: 'auth', 
                  icon: '🔐',
                  description: 'OTP & JWT auth',
                  color: 'from-purple-500 to-pink-500',
                  bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
                }
              ].map((feature, index) => (
                <a
                  key={feature.id}
                  href={`#${feature.id}`}
                  className="group relative overflow-hidden bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <span className="text-lg">{feature.icon}</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {feature.name}
                    </h4>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                    
                    {/* Hover arrow */}
                    <div className="absolute top-4 right-4 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <span className="text-xs">→</span>
                    </div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
                  </div>
                </a>
              ))}
            </div>
            
            {/* Bottom hint */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <span className="animate-bounce">👆</span>
                Click any card to jump directly to that feature demo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Chat Feature */}
      <section id="chat" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-white text-lg">💬</span>
            </div>
            <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-4">
              Real-Time Chat with <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">SignalR</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-6">
              <strong>What you get:</strong> Instant messaging that scales to thousands of users. 
              Built with Microsoft SignalR for WebSocket-based real-time communication with PostgreSQL persistence and automatic reconnection handling.
            </p>

            {/* Technical Highlights */}
            <div className="flex justify-center gap-6 flex-wrap mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">WebSocket Connections</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Auto-Reconnection</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">PostgreSQL Persistence</span>
              </div>
            </div>
          </div>

          {/* Chat Demo */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                🚀 <strong>Try it live!</strong> Messages appear instantly for all connected users - open multiple tabs to test real-time sync
              </p>
            </div>
            <Chat />
          </div>

          {/* Implementation Details */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🔧 Implementation Details</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-gray-900 dark:text-white">Backend:</strong>
                <ul className="text-gray-600 dark:text-gray-400 ml-4 mt-1">
                  <li>• SignalR Hub for real-time messaging</li>
                  <li>• MediatR for command/query separation</li>
                  <li>• Entity Framework for data persistence</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">Frontend:</strong>
                <ul className="text-gray-600 dark:text-gray-400 ml-4 mt-1">
                  <li>• React hooks for connection management</li>
                  <li>• Auto-generated TypeScript types</li>
                  <li>• Optimistic UI updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Analytics Feature */}
      <section id="analytics" className="py-12 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-white text-lg">📊</span>
            </div>
            <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-4">
              Live Analytics <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Dashboard</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-6">
              <strong>What you get:</strong> Real-time system metrics and user analytics with background job processing. 
              Track server performance, user behavior, and custom metrics with Hangfire background services and SignalR live updates.
            </p>

            {/* Analytics Features */}
            <div className="flex justify-center gap-6 flex-wrap mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">System Metrics</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">User Analytics</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Background Jobs</span>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                📈 <strong>Live data updates!</strong> Metrics refresh automatically using Hangfire background jobs + SignalR broadcasting
              </p>
            </div>
            <div className="p-6">
              <MetricsDashboard />
            </div>
          </div>

          {/* Implementation Details */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-cyan-50 dark:from-gray-800/50 dark:to-cyan-900/20 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🔧 Implementation Details</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-gray-900 dark:text-white">Data Collection:</strong>
                <ul className="text-gray-600 dark:text-gray-400 ml-4 mt-1">
                  <li>• Hangfire background jobs for metrics</li>
                  <li>• Custom visit tracking middleware</li>
                  <li>• System performance monitoring</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">Real-time Updates:</strong>
                <ul className="text-gray-600 dark:text-gray-400 ml-4 mt-1">
                  <li>• SignalR for live dashboard updates</li>
                  <li>• React Query for cache management</li>
                  <li>• Responsive chart components</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Feature */}
      <AnalyticsAssistantSection />

      {/* Image Gallery Feature */}
      <ImageGallery />

      {/* Authentication Feature */}
      <AuthShowcase />

      {/* Bottom CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6">
            <span className="text-white text-2xl">🚀</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-6">
            Ready to Build Amazing Things?
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Clone this repository and start building your next AI-powered application. 
            Everything you just saw is yours to use and customize.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              <Github className="w-5 h-5" />
              Clone Repository
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              Open Source • Production Ready • AI-Powered • No Lock-in
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 