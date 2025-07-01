"use client";

import { Button } from '@/shared/components/ui/button';
import { Github, Code, Mail, Star, GitFork, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

export function CTASection() {
  const handleCloneRepo = () => {
    // For now, copy clone command to clipboard
    navigator.clipboard.writeText('git clone https://github.com/your-username/vibecodementor-template.git');
    toast.success('📋 Clone command copied to clipboard!');
  };

  const handleCollaboration = () => {
    // Scroll to auth section to encourage sign up
    const authSection = document.getElementById('auth');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
      toast.info('👆 Sign up to start collaborating!');
    }
  };

  const handleGetInTouch = () => {
    // Open email client with pre-filled subject
    const subject = encodeURIComponent('VibeCodeMentor - Project Collaboration');
    const body = encodeURIComponent('Hi! I saw your VibeCodeMentor template and would like to discuss a project. Can we set up a time to chat?');
    window.open(`mailto:william.av.holmberg@gmail.com?subject=${subject}&body=${body}`);
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
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Github className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Clone & Start</h3>
            <p className="text-gray-100 mb-6 leading-relaxed">
              Get the complete codebase and start building immediately. Everything is configured and ready to go.
            </p>
            <Button 
              onClick={handleCloneRepo}
              className="w-full bg-transparent border-2 border-white/80 hover:bg-white/20 text-gray-100 hover:border-white transition-all duration-200 backdrop-blur-sm font-medium"
            >
              <Github className="w-4 h-4 mr-2" />
              Clone Repository
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>1.2k</span>
              </div>
                             <div className="flex items-center gap-1">
                 <GitFork className="w-4 h-4" />
                 <span>234</span>
               </div>
            </div>
          </div>

          {/* Build */}
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Let&apos;s Build Together</h3>
            <p className="text-gray-100 mb-6 leading-relaxed">
              Want to collaborate or need help customizing this template for your specific needs?
            </p>
            <Button 
              onClick={handleCollaboration}
              className="w-full bg-transparent border-2 border-white/80 hover:bg-white/20 text-gray-100 hover:border-white transition-all duration-200 backdrop-blur-sm font-medium"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Start Collaboration
            </Button>
            <div className="mt-4 text-sm text-gray-400">
              Available for consulting & development
            </div>
          </div>

          {/* Hire */}
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Hire the Creator</h3>
            <p className="text-gray-100 mb-6 leading-relaxed">
              Need a full-stack developer who builds with AI? Let&apos;s discuss your next project.
            </p>
            <Button 
              onClick={handleGetInTouch}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Mail className="w-4 h-4 mr-2" />
              Get In Touch
            </Button>
            <div className="mt-4 text-sm text-gray-400">
              Full-stack • AI-powered • Fast delivery
            </div>
          </div>
        </div>

        {/* Tech Stack Summary */}
        <div className="text-center border-t border-white/10 pt-12">
          <h3 className="text-lg font-medium mb-6 text-gray-300">Built With Modern Tech</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span className="bg-white/10 px-4 py-2 rounded-full">Next.js 15</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">.NET 9</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">SignalR</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">PostgreSQL</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">Tailwind CSS</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">Cloudflare R2</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">Resend</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Template created with AI assistance • Open source • MIT License
          </p>
        </div>
      </div>
    </section>
  );
} 