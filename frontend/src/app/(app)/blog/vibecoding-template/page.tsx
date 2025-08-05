import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'I just open-sourced my vibecoding template | VibeCodeMentor',
  description: '6 months of vibecoding, 20+ apps, one went viral with 90k+ users. Here&apos;s my battle-tested template and what I learned.',
  openGraph: {
    title: 'I just open-sourced my vibecoding template',
    description: '6 months of vibecoding, 20+ apps, one went viral with 90k+ users. Here&apos;s my battle-tested template and what I learned.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['William Holmberg'],
  },
};

export default function VibeCodingTemplateBlogPost() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="relative">
        {/* Simple Header */}
        <section className="pt-24 pb-8 px-3 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back navigation */}
            <div className="mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to VibeCodeMentor
              </Link>
            </div>

            {/* Post Meta */}
            <div className="mb-6">
              <time className="text-sm text-gray-500 dark:text-gray-400">July 4, 2025</time>
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
              I just open-sourced my vibecoding template
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              After 6 months of vibecoding, building 20+ apps, and having one go viral with 90k+ users, I&apos;m sharing the template that made it all possible.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-20 px-3 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8">
                If you&apos;ve been following the vibecoding space, you know how quickly this community has grown. After spending the last 6 months deep in the vibecoding world, I wanted to share what I&apos;ve learned and give back to the community that&apos;s taught me so much.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                The Journey So Far
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Over the last 6 months, I&apos;ve built over 20 different applications using AI-assisted development. One of them, <a href="https://playglenn.com" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">glenn-explore</a>, unexpectedly went viral and had over <strong>90,000 people try it out</strong>. That experience taught me a lot about scaling, hosting, and what really matters when building for real users.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                Taking a Different Path
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                While most vibecoders seem to go with the typical Vercel + Supabase combo, I decided to take a different route. I&apos;ve been self-hosting a .NET backend with SQLite on a <strong>$5 DigitalOcean droplet</strong>, and honestly? It&apos;s worked amazingly well. There&apos;s something really satisfying about going back to the &ldquo;primitives&rdquo; and understanding how everything fits together.
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                My current stack: .NET Backend (self-hosted), Next.js (self-hosted), and Postgres (Supabase). Claude 4 is absolutely incredible with C#, and the established patterns just make projects scale so much better over time.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                The Template Experiment
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Here&apos;s where it gets interesting. I&apos;ve been playing around with MCPs and created an integration with a kanban tool I use. It works so well that I decided to try an experiment: <strong>let Claude Opus plan an entire starter template, then have Sonnet implement it.</strong>
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                The process was simple but effective:
              </p>
              
              <ol className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 space-y-2">
                <li>1. Opus created all the tasks and broke everything down</li>
                <li>2. Sonnet implemented each task step by step</li>
                <li>3. I could literally leave at night, come back the next day, and the LLM could just check the kanban to see where it left off</li>
              </ol>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                This structured approach where the LLM both creates tasks AND implements them has been game-changing for me.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                What&apos;s in the Template
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                The result is a 100% vibecoded starter template that includes everything you need to build a modern web application:
              </p>
              
              <ul className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 space-y-1">
                <li>• <strong>Authentication</strong> - ASP.NET Core Identity + JWT + OTP</li>
                <li>• <strong>Email</strong> - Resend integration</li>
                <li>• <strong>File Upload</strong> - Cloudflare R2</li>
                <li>• <strong>LLM Integration</strong> - OpenRouter</li>
                <li>• <strong>Real-time</strong> - SignalR/WebSockets</li>
                <li>• <strong>Analytics</strong> - Metrics & monitoring</li>
                <li>• <strong>Modern UI</strong> - Next.js 15 + React 19 + shadcn/ui</li>
                <li>• <strong>Background Jobs</strong> - Hangfire integration</li>
              </ul>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                <strong>Repository:</strong> <a href="https://github.com/WilliamAvHolmberg/vibecodementor" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://github.com/WilliamAvHolmberg/vibecodementor</a>
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Is it perfect? Absolutely not. There are definitely bugs and things that need attention before going live. But it&apos;s a solid foundation that I&apos;ve been using as my starting point for every new project.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                Building in Public
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                I decided to open-source this because I genuinely believe you learn so much more by building in public. I want to create a space where we can all share our vibecoding approaches and learn from each other.
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Some questions I&apos;d love to hear your thoughts on:
              </p>
              
              <ul className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 space-y-1">
                <li>• What&apos;s your go-to vibecoding stack?</li>
                <li>• Have you tried the LLM → kanban → LLM workflow?</li>
                <li>• What features would you want to see in a starter template?</li>
                <li>• Any thoughts on self-hosting vs. managed services for vibecoding?</li>
              </ul>

              <div className="mt-12 text-center border-t border-gray-200 dark:border-gray-700 pt-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  I&apos;d love to hear what you think about the repository and approach! Planning to keep iterating on this based on community feedback.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="https://github.com/WilliamAvHolmberg/vibecodementor" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                  >
                    Check out the Repository
                  </a>
                  <Link 
                    href="/" 
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Try the Live Demo
                  </Link>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mt-6">
                  Let&apos;s build something cool together! 🚀
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
} 