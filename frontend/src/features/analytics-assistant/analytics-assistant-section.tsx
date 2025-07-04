'use client';

import { useState } from 'react';
import { BarChart3, MessageSquare } from 'lucide-react';
import { ChatContainer } from '@/features/openrouter';
import { useConversationId } from './hooks/use-conversation-id';

export function AnalyticsAssistantSection() {
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [hasScrolledToChat, setHasScrolledToChat] = useState(false);
  const { conversationId } = useConversationId();

  const suggestionPrompts = [
    "Show me today's visit statistics",
    "What are my most popular pages?",
    "Analyze visitor retention trends",
    "Compare this week vs last week traffic"
  ];

  const handleChatStart = () => {
    setHasStartedChat(true);
    
    // Only scroll once when chat first expands
    if (!hasScrolledToChat) {
      setHasScrolledToChat(true);
      setTimeout(() => {
        const section = document.getElementById('ai-assistant');
        if (section) {
          const offsetTop = section.offsetTop + 200;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  };

  return (
    <section id="ai-assistant" className="py-20 px-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
            <span className="text-white text-2xl">🤖</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">OpenRouter</span> AI Analytics Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto mb-4">
            Powered by OpenRouter&apos;s 200+ AI models with custom function calling. 
            Switch between GPT-4, Claude, Gemini, and more while the AI intelligently reads your real data.
          </p>
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full border border-orange-200 dark:border-orange-700">
            <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Live AI with Real Database Access</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">

          {/* OpenRouter Magic Section */}
          <div className="p-6">
            {/* Why OpenRouter is Amazing */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 mb-4 border border-orange-200/50 dark:border-orange-700/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center">
                🚀 Why OpenRouter is Pure Magic
              </h3>
              <div className="grid md:grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg mb-1">🔄</div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs">Model Switching</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">GPT-4, Claude, Gemini, Llama - all in one API</div>
                </div>
                <div>
                  <div className="text-lg mb-1">🛠️</div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs">Custom Function Calls</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">AI calls your C# methods directly</div>
                </div>
                <div>
                  <div className="text-lg mb-1">📊</div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs">Live Data Access</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">AI reads your PostgreSQL in real-time</div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Smart Database Queries
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    AI automatically calls C# functions to fetch live analytics from PostgreSQL
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    200+ AI Models
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Switch between OpenAI, Anthropic, Google, Meta models with zero code changes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">⚡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Custom Tool Registration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Add new AI capabilities by simply decorating C# methods with [OpenRouterTool]
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">🔗</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Function Calling Made Easy
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    AI intelligently chooses when to call your functions based on user questions
                  </p>
                </div>
              </div>
            </div>


          </div>

          {/* Integrated Chat Interface */}
          {conversationId && (
            <div className={`transition-all duration-500 ease-in-out ${hasStartedChat ? 'opacity-100' : 'opacity-100'} -mt-2`}>
              <ChatContainer
                conversationId={conversationId}
                isOpen={true}
                isCompact={!hasStartedChat}
                onClose={() => {}}
                onChatStart={handleChatStart}
                suggestions={suggestionPrompts}
              />
            </div>
          )}

          {/* Code Example - Two Steps */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden mt-8">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  🔧 Add This to Your Project
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Implement your own OpenRouter AI tools in just 2 steps
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-2 font-medium">🔧 Step 1: Adding custom AI tools is this easy:</div>
                  <code className="text-sm text-green-400 font-mono block leading-relaxed">
                    [OpenRouterTool(&quot;Get analytics data&quot;)]<br/>
                    public async Task&lt;AnalyticsData&gt; GetVisitStats() &#123;<br/>
                    &nbsp;&nbsp;return await _db.Visits.GetTodayStats();<br/>
                    &#125;
                  </code>
                  <div className="text-xs text-gray-500 mt-2">The AI automatically calls this when users ask about analytics!</div>
                </div>

                {/* Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                  <div className="px-4 text-sm text-gray-500 dark:text-gray-400 font-medium">then</div>
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-2 font-medium">⚡ Step 2: Register in OpenRouterToolsController.cs:</div>
                  <code className="text-sm text-blue-400 font-mono block leading-relaxed">
                    var tools = new VisitAnalyticsTools(_context);<br/>
                    client.RegisterTool&lt;string, Task&lt;AnalyticsData&gt;&gt;(<br/>
                    &nbsp;&nbsp;tools.GetVisitStats<br/>
                    );
                  </code>
                  <div className="text-xs text-gray-500 mt-2">Now OpenRouter can call your method across 200+ AI models!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 