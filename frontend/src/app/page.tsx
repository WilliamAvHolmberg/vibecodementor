import { HeroSection, FloatingMetrics } from '@/features/homepage-hero';
import { Chat } from '@/features/chat';
import { MetricsDashboard } from '@/features/dashboard';
import { ImageGallery } from '@/features/homepage-gallery';
import { AuthShowcase } from '@/features/homepage-auth';
import { CTASection } from '@/features/homepage-cta';
import { AnalyticsAssistantSection } from '@/features/analytics-assistant';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section with Floating Metrics Overlay */}
      <div className="relative">
        <HeroSection />
        <FloatingMetrics />
      </div>
      
      {/* Chat Section */}
      <section id="chat" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-white text-lg">💬</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
              Real-Time Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              SignalR-powered messaging with PostgreSQL persistence
            </p>
          </div>
          
          {/* Chat Component */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
            <Chat />
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-white text-lg">📊</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
              Live Analytics Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Real-time system metrics and performance monitoring
            </p>
          </div>
          
          {/* Analytics Dashboard */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 p-6">
            <MetricsDashboard />
          </div>
        </div>
      </section>

      {/* Analytics Assistant Section */}
      <AnalyticsAssistantSection />

      {/* Image Gallery Section */}
      <ImageGallery />

      {/* Auth Showcase Section */}
      <AuthShowcase />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
