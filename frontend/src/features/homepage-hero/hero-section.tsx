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
            AI-Powered
          </span>
          <br />
          <span className="text-gray-800 dark:text-gray-200">
            Full-Stack Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 font-light leading-relaxed">
          OpenRouter + Next.js 15 + .NET 9 + SignalR + PostgreSQL
        </p>

        {/* Core Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
              <span className="text-white text-lg">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">OpenRouter AI</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Switch between 200+ AI models with custom function calling</p>
          </div>
          
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-white text-lg">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Everything</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">SignalR + PostgreSQL for live data and instant updates</p>
          </div>
          
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-white text-lg">🔧</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Custom AI Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Easily add function calls to make AI read your data</p>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['OpenRouter', 'Next.js 15', '.NET 9', 'SignalR', 'PostgreSQL', 'Tailwind'].map((tech) => (
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