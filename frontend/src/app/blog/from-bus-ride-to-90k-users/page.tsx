import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'From Bus Ride to 90k Users: How Glenn Explore Went Viral | VibeCodeMentor',
    description: 'The raw story of how a 10-hour bus ride coding session turned into a viral sensation with 90k users. A reminder that sometimes you just need to ship and see what happens.',
    openGraph: {
        title: 'From Bus Ride to 90k Users: How Glenn Explore Went Viral',
        description: 'The raw story of how a 10-hour bus ride coding session turned into a viral sensation with 90k users. A reminder that sometimes you just need to ship and see what happens.',
        type: 'article',
        publishedTime: '2025-01-17',
        authors: ['William Holmberg'],
    },
};

export default function GlennExploreViralBlogPost() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'From Bus Ride to 90k Users: How Glenn Explore Went Viral',
        description: 'The raw story of how a 10-hour bus ride coding session turned into a viral sensation with 90k users',
        image: 'https://vibecodementor.net/blog/bus-ride-viral.jpg',
        datePublished: '2025-07-04',
        dateModified: '2025-07-04',
        author: {
            '@type': 'Person',
            name: 'William Holmberg',
            url: 'https://vibecodementor.se'
        },
        publisher: {
            '@type': 'Organization',
            name: 'VibeCodeMentor',
            logo: {
                '@type': 'ImageObject',
                url: 'https://vibecodementor.net/logo.png'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://vibecodementor.net/blog/from-bus-ride-to-90k-users'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
                                <time className="text-sm text-gray-500 dark:text-gray-400">January 17, 2025</time>
                                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">12 min read</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                                From Bus Ride to 90k Users: How Glenn Explore Went Viral
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                The raw story of how a 10-hour bus ride coding session turned into a viral sensation with 90k users, getting featured by DigitalOcean, and rediscovering the joy of &ldquo;just shipping it.&rdquo;
                            </p>
                        </div>
                    </section>

                    {/* Main Content */}
                    <section className="pb-20 px-3 sm:px-6">
                        <div className="max-w-4xl mx-auto">
                            <article className="prose prose-lg dark:prose-invert max-w-none">

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8">
                                    Two months ago, I was sitting on a bus for 10 hours with nothing but my laptop and what seemed like a stupid idea. Today, <a href="https://playglenn.com" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Glenn Explore</a> has been played by over 90,000 people, got shouted out by <a href="https://twitter.com/levelsio" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">@levelsio</a> and <a href="https://twitter.com/threejs" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">@threejs</a>, and was featured in DigitalOcean&apos;s weekly tech talks.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                                    This is the story of how that bus ride changed everything and reminded me why I fell in love with coding in the first place.
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    Chapter 1: The Bus Ride That Started It All
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    I&apos;m stuck on this endless bus ride with nothing but time and a laptop. The idea hits me: &ldquo;What if people could just drive around in a 3D world together? Like, actually explore the real world but in a game?&rdquo;
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Instead of sketching wireframes or planning architecture like a &quot;proper&quot; developer, I just opened VS Code and started hacking. ThreeJS for the 3D magic, Mapbox for real-world terrain data, and whatever else I could slap together to make cars move around a virtual Earth.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    By the time I got off that bus, I had something that barely worked but felt... <em>alive</em>. You could drive a little car around, the terrain was real, and it was janky as hell. Perfect.
                                </p>

                                <blockquote className="border-l-4 border-blue-500 pl-6 italic text-gray-600 dark:text-gray-400 my-8">
                                &quot;The kid who&apos;d build RuneScape bots in a single night was back. I had forgotten how good it felt to just... ship.&quot;
                                </blockquote>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    Chapter 2: The First Viral Moment
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    I threw together a quick demo video and posted it on X, expecting my usual 3 likes from my mom and maybe a colleague. Instead, I woke up to absolute chaos.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    <strong>30,000 impressions. 400 likes. People actually trying the game.</strong>
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    But here&apos;s where it got real—people started asking &ldquo;Where is everyone else? Can we drive together?&rdquo; I&apos;m watching the player count climb and thinking, &ldquo;Holy shit, they want multiplayer and they want it NOW.&rdquo;
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    So I did what any sane developer would do: I frantically Googled &ldquo;real-time multiplayer&rdquo; and found PartyKit. Twenty minutes later—chat system, player dots on the map, basic multiplayer. Done. Shipped. The day ended with 2,300 players and 100k total views.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    I was losing my mind in the best possible way.
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    Chapter 3: Feeding the Beast
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    The feedback started pouring in. People wanted satellite maps, elevation data, better UI, free camera mode (they called it &ldquo;car jail&rdquo; when you could only follow the car). So I built it all.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Three days of non-stop coding later, I dropped another post. Refined UI, satellite maps with actual elevation, slick intro sequence, free camera controls, day/night toggle, time tracking. The response was even bigger.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    <strong>4,000 players. 300k total impressions.</strong>
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Then something magical happened. @levelsio—the guy I&apos;d been following for years, watching him build empire after empire—commented on my video. I literally screenshot it and sent it to everyone I knew. This wasn&apos;t just viral luck anymore. People really liked what I was building.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    When the official ThreeJS account jumped in too? I knew this was real.
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    Chapter 4: The $4 VPS That Could
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Here&apos;s the part that still blows my mind. The entire thing was running on a $4 DigitalOcean VPS. Not some fancy cloud architecture with auto-scaling and microservices. Just:
                                </p>

                                <ul className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 space-y-2">
                                    <li>• .NET backend with SignalR for real-time multiplayer</li>
                                    <li>• SQLite database (yes, <em>SQLite</em> for 90k users)</li>
                                    <li>• ThreeJS + Mapbox frontend</li>
                                    <li>• $4/month VPS</li>
                                </ul>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Peak traffic: 90 players online simultaneously. Peak CPU usage: never hit 40%. The whole time I&apos;m thinking about all those meetings I&apos;ve sat through about &ldquo;scalable architecture&rdquo; and &ldquo;cloud-native this&rdquo; and &ldquo;microservices that.&rdquo;
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Sometimes simple just works.
                                </p>

                                <blockquote className="border-l-4 border-green-500 pl-6 italic text-gray-600 dark:text-gray-400 my-8 text-xl font-medium">
                                    &ldquo;DigitalOcean featured it in their weekly tech talks. A $4 VPS handling viral traffic while enterprise teams debate auto-scaling strategies.&rdquo;
                                </blockquote>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    Chapter 5: Growing Pains and Real Problems
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Going viral isn&apos;t all celebration and dopamine hits. When Glenn crossed 50k unique visitors, I had to make a hard choice. Server costs were climbing faster than my salary could handle, so I put up a paywall.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    It felt terrible. Here I am preaching &ldquo;just ship it&rdquo; and suddenly I&apos;m gatekeeping my own creation. But here&apos;s what happened next: <strong>300 amazing people actually paid</strong>. They believed in what I was building enough to support it.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    And then darker problems emerged. The chat became toxic. Racist comments, abuse, trolling. I tried moderating manually, but I&apos;m not online 24/7. So I did what any pragmatic developer would do: I deployed an AI-powered anti-racist filter using Gemini.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    300ms delay per message. Problem solved. The community stayed awesome, the vibes stayed good. Sometimes the solution is just... shipping a solution.
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    Chapter 6: The Viral Feedback Loop
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    The most insane moment came when someone posted a video about Glenn on Facebook. I woke up to 2,000 new players and 60 people online simultaneously. The video had over 300k views.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    People were sharing stories in chat, getting to know each other, planning virtual road trips together. I realized I hadn&apos;t just built a game—I&apos;d accidentally created a community.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    So I leaned into it. Added a quest system to onboard new players properly. Future quests to explore the 7 Wonders, different types of road trips. Integrated MeshyAI so players could generate their own 3D models and add them to the world.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    I even vibe-coded an email campaign tool in under an hour. Is it perfect? Hell no. Does it work? Absolutely.
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    Chapter 7: The Return to Free-to-Play
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Thanks to those 300 paying legends, I was able to optimize costs and recently made Glenn free-to-play again. Launch day 2.0 was beautiful: 137 new users and 71,128km driven in a single day.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    The community came flooding back, stronger than ever. And I realized something: this wasn&apos;t about the technology or the architecture or even the viral moments. It was about giving people a space to explore and connect.
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    What I Rediscovered About Building
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Glenn brought back something I had lost in years of enterprise development: the pure joy of just building shit and seeing what happens.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    At 9, I was running RuneScape private servers. At 10, coding bots. At 17, managing a bot-net empire with 300 bots across 10 machines. I didn&apos;t care if the code was garbage—I&apos;d ship it, break it, fix it, ship it again.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Then corporate life happened. &ldquo;Best practices.&rdquo; &ldquo;Code reviews.&rdquo; &ldquo;Scalable architecture.&rdquo; I became paralyzed by perfection, tweaking endlessly, scared my code wasn&apos;t &ldquo;good enough.&rdquo;
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    <strong>Glenn reminded me: done is better than perfect. Shipped is better than polished. Community is better than code quality.</strong>
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    The Numbers That Matter (And Don&apos;t)
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Let me share the final stats, not to brag, but to prove a point about what&apos;s actually important:
                                </p>

                                <ul className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 space-y-2">
                                    <li>• <strong>90,000+ users</strong> over 2 months</li>
                                    <li>• <strong>400k+ impressions</strong> across social media</li>
                                    <li>• <strong>Peak: 90 players online simultaneously</strong></li>
                                    <li>• <strong>300 paying supporters</strong> during paywall period</li>
                                    <li>• <strong>Featured by DigitalOcean, @levelsio, @threejs</strong></li>
                                    <li>• <strong>$4/month hosting cost</strong> for most of the journey</li>
                                    <li>• <strong>10 days</strong> from first line of code to viral</li>
                                </ul>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    But here&apos;s what actually mattered: People had fun. They made friends. They explored the world together. They told me Glenn brought them joy during tough times.
                                </p>

                                <blockquote className="border-l-4 border-purple-500 pl-6 italic text-gray-600 dark:text-gray-400 my-8 text-xl font-medium">
                                    &ldquo;90% of the time, you don&apos;t need fancy infrastructure. You need to ship features that make people happy.&rdquo;
                                </blockquote>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    The Balancing Act
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Full transparency: I&apos;ve got a full-time job, an amazing kid, and the best girlfriend in the world. When Glenn exploded, my head was spinning with ideas every second, but focus became impossible.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    I had to learn to balance the entrepreneurial fire with real life. New strategy: code every other night, completely disconnect on off-nights. No refreshing X every 3 minutes. It&apos;s working.
                                </p>

                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 mt-12">
                                    What This Means for You
                                </h2>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    If you&apos;re reading this and have been sitting on an idea, tweaking it endlessly, waiting for it to be &ldquo;ready&rdquo;—stop. Ship it. See what happens.
                                </p>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    Glenn started as a stupid idea on a bus ride. It became something that brought joy to 90,000 people. Your idea might be next.
                                </p>

                                <ul className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 space-y-2">
                                    <li>• Simple stacks scale further than you think</li>
                                    <li>• Community matters more than code quality</li>
                                    <li>• Viral is unpredictable—just keep shipping</li>
                                    <li>• Real-time features create magic moments</li>
                                    <li>• $4 VPS &gt; $400 cloud bill for most projects</li>
                                    <li>• Done is better than perfect, always</li>
                                </ul>

                                <div className="mt-12 text-center border-t border-gray-200 dark:border-gray-700 pt-8">
                                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                                        Glenn&apos;s story continues. The 90k users became the foundation for something bigger. But that&apos;s another story for another day.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <a
                                            href="https://playglenn.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            🚗 Drive Around the World
                                        </a>
                                        <a
                                            href="https://github.com/WilliamAvHolmberg/vibecodementor"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                                        >
                                            🛠️ Get the Same Stack
                                        </a>
                                        <Link
                                            href="/"
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                                        >
                                            💡 Start Building
                                        </Link>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 mt-6">
                                        From a 10-hour bus ride to 90k users. Sometimes the best ideas come from the most unexpected places. 🚀
                                    </p>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
} 