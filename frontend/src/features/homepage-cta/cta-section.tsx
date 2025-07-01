"use client";

import { Button } from '@/shared/components/ui/button';
import { Github, Code, Mail, ArrowUp } from 'lucide-react';

export function CTASection() {
  const handleCollaboration = () => {
    // Scroll to auth section to encourage sign up
    const authSection = document.getElementById('auth');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="cta" className="py-20 px-6 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            Ready to Build Something
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Amazing?
            </span>
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Get started with this AI-generated template and ship your next project faster than ever.
          </p>
        </div>

        {/* Three Options Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Clone */}
          <article className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Github className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Clone & Start</h3>
            <p className="text-gray-100 mb-6 leading-relaxed">
              Get the complete codebase and start building immediately. Everything is configured and ready to go.
            </p>
            <Button 
              asChild
              className="w-full bg-transparent border-2 border-white/80 hover:bg-white/20 text-gray-100 hover:border-white transition-all duration-200 backdrop-blur-sm font-medium"
            >
              <a 
                href="https://github.com/WilliamAvHolmberg/vibecodementor"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit vibecodementor repository on GitHub"
              >
                <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                View Repository
              </a>
            </Button>
          </article>

          {/* Build */}
          <article className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Code className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Let&apos;s Build Together</h3>
            <p className="text-gray-100 mb-6 leading-relaxed">
              Want to collaborate or need help customizing this template for your specific needs?
            </p>
            <Button 
              onClick={handleCollaboration}
              className="w-full bg-transparent border-2 border-white/80 hover:bg-white/20 text-gray-100 hover:border-white transition-all duration-200 backdrop-blur-sm font-medium"
            >
              <ArrowUp className="w-4 h-4 mr-2" aria-hidden="true" />
              Start Collaboration
            </Button>
            <div className="mt-4 text-sm text-gray-400">
              Available for consulting & development
            </div>
          </article>

          {/* Hire */}
          <article className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Hire the Creator</h3>
            <p className="text-gray-100 mb-6 leading-relaxed">
              Need a full-stack developer who builds with AI? Let&apos;s discuss your next project.
            </p>
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <a 
                href="mailto:william.av.holmberg@gmail.com?subject=VibeCodeMentor%20-%20Project%20Collaboration&body=Hi!%20I%20saw%20your%20VibeCodeMentor%20template%20and%20would%20like%20to%20discuss%20a%20project.%20Can%20we%20set%20up%20a%20time%20to%20chat?"
                aria-label="Send email to William for project collaboration"
              >
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                Get In Touch
              </a>
            </Button>
            <div className="mt-4 text-sm text-gray-400">
              Full-stack • AI-powered • Fast delivery
            </div>
          </article>
        </div>

        {/* Tech Stack Summary */}
        <div className="text-center border-t border-white/10 pt-12">
          <h3 className="text-lg font-medium mb-6 text-gray-300">Built With Modern Tech</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm" role="list">
            <span className="bg-white/10 px-4 py-2 rounded-full" role="listitem">Next.js 15</span>
            <span className="bg-white/10 px-4 py-2 rounded-full" role="listitem">.NET 9</span>
            <span className="bg-white/10 px-4 py-2 rounded-full" role="listitem">SignalR</span>
            <span className="bg-white/10 px-4 py-2 rounded-full" role="listitem">PostgreSQL</span>
            <span className="bg-white/10 px-4 py-2 rounded-full" role="listitem">Tailwind CSS</span>
            <span className="bg-white/10 px-4 py-2 rounded-full" role="listitem">Cloudflare R2</span>
            <span className="bg-white/10 px-4 py-2 rounded-full" role="listitem">Resend</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Template created with AI assistance • Open source • MIT License
          </p>
        </footer>
      </div>
    </section>
  );
} 