import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | VibeCodeMentor - AI Development Stories & Insights',
  description: 'Stories, insights, and lessons from building AI-powered applications. From viral successes to technical deep dives.',
  openGraph: {
    title: 'Blog | VibeCodeMentor',
    description: 'Stories, insights, and lessons from building AI-powered applications. From viral successes to technical deep dives.',
    type: 'website',
  },
};

const blogPosts = [
  {
    slug: 'from-bus-ride-to-90k-users',
    title: 'From Bus Ride to 90k Users: How Glenn Explore Went Viral',
    description: 'The raw story of how a 10-hour bus ride coding session turned into a viral sensation with 90k users, getting featured by DigitalOcean and rediscovering the joy of "just shipping it."',
    date: 'July 4, 2025',
    readTime: '12 min read',
    category: 'Success Story',
    icon: '🚗',
    gradient: 'from-blue-500 to-purple-600',
    bgGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
    featured: true,
    stats: '90k users • Viral',
    tags: ['Viral', 'Startup', 'Gaming', 'Real-time']
  },
  {
    slug: 'amazing-time-to-be-alive',
    title: "It's an amazing time to be alive",
    description: 'AI is creating 10x engineers and enabling smaller teams to achieve more. The future of software development isn\'t about replacing engineers—it\'s about unleashing human potential.',
    date: 'July 4, 2025',
    readTime: '8 min read',
    category: 'Philosophy',
    icon: '🤖',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    featured: false,
    stats: 'Popular',
    tags: ['AI', 'Philosophy', '10x Engineers', 'Future']
  },
  {
    slug: 'vibecoding-template',
    title: 'I just open-sourced my vibecoding template',
    description: 'After 6 months of vibecoding, building 20+ apps, and having one go viral with 90k+ users, I\'m sharing the template that made it all possible.',
    date: 'July 4, 2025',
    readTime: '10 min read',
    category: 'Technical',
    icon: '⚡',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    featured: false,
    stats: 'Open Source',
    tags: ['Template', 'Open Source', '.NET', 'Next.js']
  }
];

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Blog Header */}
      <section className="py-16 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-white text-2xl">✍️</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Stories & Insights
            </span> from the Journey
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
            Real stories, hard-earned lessons, and practical insights from building AI-powered applications. 
            From viral successes to technical deep dives - learn what works (and what doesn&apos;t).
          </p>


        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">


            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/blog/${featuredPost.slug}`}
                className="group block bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              >
                <div className={`h-2 bg-gradient-to-r ${featuredPost.gradient}`}></div>
                
                <div className="p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                                         {/* Category */}
                       <div className="mb-4">
                         <span className={`px-3 py-1 bg-gradient-to-r ${featuredPost.bgGradient} rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50`}>
                           {featuredPost.category}
                         </span>
                       </div>

                      <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h3>
                      
                      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                        {featuredPost.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{featuredPost.date}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredPost.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                        <span>Read the full story</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Visual element */}
                    <div className="relative">
                                         <div className={`w-full h-64 bg-gradient-to-br ${featuredPost.bgGradient} rounded-2xl flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50`}>
                       <div className={`w-20 h-20 bg-gradient-to-br ${featuredPost.gradient} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                         <span className="text-white text-3xl">{featuredPost.icon}</span>
                       </div>
                     </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts Grid */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">All Stories</h2>
            <p className="text-gray-600 dark:text-gray-400">More insights from the AI development journey</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {regularPosts.map((post, index) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/20 dark:border-gray-700/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Top gradient bar */}
                <div className={`h-1 bg-gradient-to-r ${post.gradient}`}></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${post.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <span className="text-white text-lg">{post.icon}</span>
                    </div>
                    <span className={`px-3 py-1 bg-gradient-to-r ${post.bgGradient} rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50`}>
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-3 transition-all">
                    <span>Read more</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6">
            <span className="text-white text-2xl">📧</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-6">
            Don&apos;t Miss the Next Story
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Get notified when we publish new insights, viral success stories, and technical deep dives. 
            Join developers who are building the future.
          </p>
          
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Subscribe to Updates
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <div className="mt-6">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              Free Forever • No Spam • Early Access to New Content
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 