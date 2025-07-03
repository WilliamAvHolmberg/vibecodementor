import { HeroSection } from '@/features/homepage-vision';
import { ShowcaseIntro } from '@/features/homepage-showcase';
import { Chat } from '@/features/chat';
import { MetricsDashboard } from '@/features/dashboard';
import { ImageGallery } from '@/features/homepage-gallery';
import { AuthShowcase } from '@/features/homepage-auth';
import { NewsletterSignup } from '@/features/newsletter';
import { CTASection } from '@/features/homepage-cta';
import { AnalyticsAssistantSection } from '@/features/analytics-assistant';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section - VibeCodeMentor.net Vision & Repository */}
      <HeroSection />
      
      {/* Showcase Intro - Built-in Features */}
      <ShowcaseIntro />
      
      {/* Chat Section */}
      <section id="chat" className="py-12 sm:py-20 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-white text-base sm:text-lg">💬</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
              Real-Time Chat with <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">SignalR</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-4 sm:mb-6">
              Built with Microsoft SignalR for blazing-fast real-time communication. No polling, no delays - just instant messaging 
              with PostgreSQL persistence and automatic reconnection handling.
            </p>
            
            {/* Technical Highlights */}
            <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">WebSocket Connections</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Auto-Reconnection</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">PostgreSQL Persistence</span>
              </div>
            </div>
          </div>
          
          {/* Chat Component */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200/20 dark:border-gray-700/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
                🚀 <strong>Try it live!</strong> Messages appear instantly for all connected users - open multiple tabs to test real-time sync
              </p>
            </div>
            <Chat />
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-12 sm:py-20 px-3 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-white text-base sm:text-lg">📊</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
              Live Analytics <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Dashboard</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-4 sm:mb-6">
              Real-time system metrics, user analytics, and performance monitoring powered by background services and 
              SignalR updates. Track everything from server performance to user behavior patterns.
            </p>
            
            {/* Analytics Features */}
            <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                <span className="text-xs sm:text-sm font-medium text-cyan-700 dark:text-cyan-300">System Metrics</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">User Analytics</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                <span className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">Background Jobs</span>
              </div>
            </div>
          </div>
          
          {/* Analytics Dashboard */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200/20 dark:border-gray-700/20 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
                📈 <strong>Live data updates!</strong> Metrics refresh automatically using Hangfire background jobs + SignalR broadcasting
              </p>
            </div>
            <div className="p-3 sm:p-6">
              <MetricsDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Assistant Section */}
      <AnalyticsAssistantSection />

      {/* Image Gallery Section */}
      <ImageGallery />

      {/* Auth Showcase Section */}
      <AuthShowcase />

      {/* Newsletter Section */}
      <NewsletterSignup />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
