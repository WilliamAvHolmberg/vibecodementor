"use client";

import { Button } from "@/shared/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth";
import { User, LogOut, Zap, Menu, ChevronDown, GitBranch, ExternalLink } from "lucide-react";

// Navigation sections (same as floating nav)
const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'chat', label: 'Chat' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'auth', label: 'Auth' },
  { id: 'cta', label: 'Contact' },
];

export function AppHeader() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <header className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    VibeCodeMentor
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI-Powered Development</p>
                </div>
                <div className="block sm:hidden">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    VCM
                  </h1>
                </div>
              </div>
              <div className="w-16 sm:w-20 h-6 sm:h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
            <div className="w-24 sm:w-32 h-8 sm:h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-3 sm:gap-8 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  VibeCodeMentor
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI-Powered Development</p>
              </div>
              <div className="block sm:hidden min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  VCM
                </h1>
              </div>
            </div>

            {/* Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium"
                >
                  <Menu className="w-4 h-4" />
                  <span className="hidden sm:block">Features</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50">
                {sections.map((section) => (
                  <DropdownMenuItem
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:bg-purple-50 dark:focus:bg-purple-900/20 text-gray-700 dark:text-gray-300"
                  >
                    {section.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {isAuthenticated && user ? (
              // Authenticated State
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Authenticated</p>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 px-2 sm:px-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </Button>
              </div>
            ) : (
              // CTAs
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  onClick={() => {
                    const newsletterSection = document.getElementById('newsletter');
                    if (newsletterSection) {
                      newsletterSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold transition-all duration-200 shadow-sm hover:shadow-md px-2 sm:px-3"
                >
                  <span className="text-sm">🚀</span>
                  <span className="hidden md:block font-semibold">Join Movement</span>
                  <span className="hidden sm:block md:hidden font-semibold">Join</span>
                  <span className="block sm:hidden font-semibold">✨</span>
                </Button>
                <Button 
                  asChild
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 hover:from-emerald-100 hover:to-blue-100 dark:hover:from-emerald-900/30 dark:hover:to-blue-900/30 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md px-2 sm:px-3"
                >
                  <a 
                    href="https://github.com/WilliamAvHolmberg/vibecodementor" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span className="font-semibold hidden sm:block">Clone Repo</span>
                    <span className="font-semibold sm:hidden">CLONE</span>
                    <ExternalLink className="w-3 h-3" />
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