"use client";

import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/features/auth";
import { User, LogOut, Zap, Menu, ChevronDown, GitBranch, ExternalLink } from "lucide-react";

// Navigation sections with anchor links
const sections = [
  { id: 'hero', label: 'Home', href: '/#hero' },
  { id: 'chat', label: 'Chat', href: '/#chat' },
  { id: 'analytics', label: 'Analytics', href: '/#analytics' },
  { id: 'gallery', label: 'Gallery', href: '/#gallery' },
  { id: 'auth', label: 'Auth', href: '/#auth' },
  { id: 'digitalocean', label: 'DigitalOcean', href: '/#digitalocean' },
  { id: 'cta', label: 'Contact', href: '/#cta' },
];

export function AppHeader() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="border-b border-white/20 dark:border-gray-800/30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl sticky top-0 z-50 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-8">
              <a href="/" className="flex items-center gap-3 sm:gap-4 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    VibeCodeMentor
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium tracking-wide">AI-Powered Development</p>
                </div>
                <div className="block sm:hidden">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    VCM
                  </h1>
                </div>
              </a>
              <div className="w-20 sm:w-24 h-8 sm:h-10 bg-gray-100/70 dark:bg-gray-800/70 rounded-xl animate-pulse backdrop-blur-sm" />
            </div>
            <div className="w-32 sm:w-40 h-10 sm:h-12 bg-gray-100/70 dark:bg-gray-800/70 rounded-xl animate-pulse backdrop-blur-sm" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-white/20 dark:border-gray-800/30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl sticky top-0 z-50 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 sm:h-20">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-3 sm:gap-8 min-w-0">
            <a href="/" className="group flex items-center gap-3 sm:gap-4 min-w-0 transition-all duration-300 hover:scale-[1.02]">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25 group-hover:shadow-2xl group-hover:shadow-purple-500/40 transition-all duration-500 flex-shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:via-blue-500 group-hover:to-cyan-500 transition-all duration-300">
                  VibeCodeMentor
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium tracking-wide">AI-Powered Development</p>
              </div>
              <div className="block sm:hidden min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:via-blue-500 group-hover:to-cyan-500 transition-all duration-300">
                  VCM
                </h1>
              </div>
            </a>

            {/* Navigation Dropdowns */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Features Dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="hidden sm:block">Features</span>
                  <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                </Button>
                <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl shadow-black/10 dark:shadow-black/30 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={section.href}
                      className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 rounded-xl transition-all duration-200 cursor-pointer block"
                    >
                      {section.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Articles Dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="hidden sm:block">Articles</span>
                  <span className="block sm:hidden">Blog</span>
                  <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                </Button>
                <div className="absolute left-0 top-full mt-2 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl shadow-black/10 dark:shadow-black/30 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <a
                    href="/blog/amazing-time-to-be-alive"
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 rounded-xl transition-all duration-200 cursor-pointer leading-relaxed block"
                  >
                    It's an amazing time to be alive
                  </a>
                  <a
                    href="/blog/vibecoding-template"
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 rounded-xl transition-all duration-200 cursor-pointer leading-relaxed block"
                  >
                    I just open-sourced my vibecoding template
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {isAuthenticated && user ? (
              // Authenticated State
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50/90 to-purple-50/90 dark:from-blue-900/30 dark:to-purple-900/30 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-blue-200/40 dark:border-blue-700/40 backdrop-blur-sm shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Authenticated</p>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-red-200/60 dark:border-red-700/60 hover:border-red-300/80 dark:hover:border-red-600/80 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-300 rounded-xl shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20 hover:scale-105 backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden sm:block font-medium">Sign Out</span>
                </Button>
              </div>
            ) : (
              // CTAs
              <div className="flex items-center gap-2 sm:gap-3">
                <Button 
                  asChild
                  variant="ghost"
                  size="sm"
                  className="group relative overflow-hidden"
                >
                  <a href="/#newsletter" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    <span className="text-sm group-hover:scale-110 transition-transform duration-200">🚀</span>
                    <span className="hidden md:block font-semibold">Join Movement</span>
                    <span className="hidden sm:block md:hidden font-semibold">Join</span>
                    <span className="block sm:hidden font-semibold">✨</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </Button>
                <Button 
                  asChild
                  variant="ghost" 
                  size="sm" 
                  className="group relative overflow-hidden"
                >
                  <a 
                    href="https://github.com/WilliamAvHolmberg/vibecodementor" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 hover:border-gray-300/80 dark:hover:border-gray-500/80 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <GitBranch className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-semibold hidden sm:block">Clone Repo</span>
                    <span className="font-semibold sm:hidden">CLONE</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent dark:from-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 