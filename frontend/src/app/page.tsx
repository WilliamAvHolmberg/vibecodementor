import { HeroSection } from '@/features/homepage-vision';
import { NewsletterSignup } from '@/features/newsletter';
import { AppHeader } from '@/shared/components/app-header';
import { FloatingChat } from '@/shared/components/floating-chat';
import { Users, Code, Zap, ArrowRight, Github, Star } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ship AI-Powered Apps in Days, Not Months | Open Source Starter',
  description: 'Production-ready Next.js + .NET 9 starter with built-in AI integration (OpenRouter), real-time features (SignalR), authentication, and more. Used by 90k+ users in production.',
  keywords: [
    'AI development',
    'Next.js starter',
    '.NET 9 template',
    'full-stack boilerplate',
    'OpenRouter integration',
    'SignalR real-time',
    'production ready',
    'open source',
    'rapid development',
    'AI-powered apps'
  ],
  openGraph: {
    title: 'Ship AI-Powered Apps in Days, Not Months',
    description: 'Production-ready starter with Next.js 15, .NET 9, OpenRouter AI, SignalR real-time, and complete authentication. Clone and start building immediately.',
    type: 'website',
    url: 'https://vibecodementor.net',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VibeCodeMentor - AI-Powered Full-Stack Starter',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ship AI-Powered Apps in Days, Not Months',
    description: 'Production-ready starter with built-in AI, real-time features, and authentication. Used by 90k+ users.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://vibecodementor.net',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function Home() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-white dark:bg-gray-950">

        {/* Hero Section - Clean Value Proposition */}
        <HeroSection />

        {/* 3 Key Benefits Section */}
        <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-6">
                Why Choose This <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI-Powered Starter?</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Stop wasting weeks on boilerplate. Start building features from day one.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Benefit 1: Start Building Immediately */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/20 dark:border-gray-700/20 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  ⚡ Start Building Immediately
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  <strong>Skip months of setup.</strong> Production-ready Next.js 15 + .NET 9 stack with Docker,
                  PostgreSQL, and complete authentication system. Just clone and build.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Next.js 15 + React 19 + TypeScript</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>.NET 9 + ASP.NET Core + EF Core</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Docker + PostgreSQL + Production Ready</span>
                  </div>
                </div>
              </div>

              {/* Benefit 2: AI-Powered by Default */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/20 dark:border-gray-700/20 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                  <Code className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🤖 AI-Powered by Default
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  <strong>Add AI to any feature instantly.</strong> Built-in OpenRouter integration with Claude, GPT,
                  and function calling patterns. No complex setup, just start building intelligent features.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>OpenRouter + Claude + GPT Integration</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Function Calling + Tool System</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Streaming + Type-Safe APIs</span>
                  </div>
                </div>
              </div>

              {/* Benefit 3: Real-time Everything */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/20 dark:border-gray-700/20 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🚀 Real-time Everything
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  <strong>Build collaborative apps effortlessly.</strong> Microsoft SignalR for WebSocket connections,
                  real-time chat, live dashboards, and instant user updates. Scale to thousands of users.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                    <span>SignalR + WebSocket Connections</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Real-time Chat + Live Analytics</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span>Background Jobs + Auto-Reconnection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof & Trust Section */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 text-center border border-emerald-200/50 dark:border-emerald-700/50">
              <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Github className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">Open Source</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">MIT License • No Vendor Lock-in</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">Production Ready</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Used by real applications</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">🇸🇪</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">Swedish Innovation</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Built with Nordic engineering excellence</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This exact stack powers <strong>VibeCodeMentor.net</strong>, <strong>Glenn Explore</strong>, and multiple client projects.
                Battle-tested in production with real users and traffic.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Battle-Tested in Production</span>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Feature Preview */}
        <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white mb-6">
              Want to See What&apos;s Included? 👀
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Interactive demos of real-time chat, AI assistants, analytics dashboards,
              authentication systems, and more. All functional and ready to use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/features"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Explore Interactive Demos
                <ArrowRight className="w-4 h-4" />
              </a>

              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors">
                <Github className="w-4 h-4" />
                View on GitHub
              </button>
            </div>
          </div>
        </section>

        {/* Blog Preview Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <span className="text-white text-xl">✍️</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-6">
                Stories from the <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Development</span> Journey
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Real stories, hard-earned lessons, and practical insights from building viral AI applications with this exact stack.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Featured: Bus Ride Story */}
              <a
                href="/blog/from-bus-ride-to-90k-users"
                className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/20 dark:border-gray-700/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 md:col-span-2"
              >
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">🚗</span>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                      Success Story
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    From Bus Ride to 90k Users: How Glenn Explore Went Viral
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    The raw story of how a 10-hour bus ride coding session turned into a viral sensation, getting featured by DigitalOcean and rediscovering the joy of &ldquo;just shipping it.&rdquo;
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>July 4, 2025</span>
                    <span>•</span>
                    <span>90k users reached</span>
                  </div>

                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                    <span>Read the viral story</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>

              {/* Other Articles */}
              <div className="space-y-6">
                <a
                  href="/blog/amazing-time-to-be-alive"
                  className="group block bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/20 dark:border-gray-700/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Philosophy</span>
                    </div>

                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      It&apos;s an amazing time to be alive
                    </h4>

                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      AI is creating 10x engineers and unleashing human potential.
                    </p>
                  </div>
                </a>

                <a
                  href="/blog/vibecoding-template"
                  className="group block bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/20 dark:border-gray-700/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">⚡</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Technical</span>
                    </div>

                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      I open-sourced my vibecoding template
                    </h4>

                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      The template behind 20+ apps and one viral hit.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Blog CTA */}
            <div className="text-center">
              <a
                href="/blog"
                className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                Read All Stories
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSignup />

        {/* Final CTA */}
        <section className="py-16 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-6">
              Ready to Ship Faster? 🚀
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join developers who are building AI-powered applications in days, not months.
              Clone the repository and start building your next big idea.
            </p>

            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-lg">
              <Github className="w-6 h-6" />
              Clone Repository & Start Building
            </button>

            <div className="mt-6">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Free Forever • Open Source • Production Ready • No Dependencies
              </p>
            </div>
          </div>
        </section>

        {/* Floating Chat */}
        <FloatingChat />
      </div>
    </>
  );
}
