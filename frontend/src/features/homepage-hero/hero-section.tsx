// Server-rendered Hero Section
export function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Custom CSS for slower bounce */}

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20" />

      {/* Floating Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content - Server Rendered */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-8 shadow-2xl">
          <span className="text-2xl">🚀</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-light text-gray-900 dark:text-white mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            AI-Generated
          </span>
          <br />
          <span className="text-gray-800 dark:text-gray-200">
            Full-Stack Template
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 font-light leading-relaxed">
          Next.js 15 + .NET 9 + SignalR + PostgreSQL
        </p>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['Next.js', '.NET 9', 'SignalR', 'PostgreSQL', 'Tailwind'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
} 