using Api.Features.OpenRouter.Models;
using System.Collections.Concurrent;

namespace Api.Features.OpenRouter.Services
{
    public class ConversationCacheService
    {
        private readonly ConcurrentDictionary<string, ConversationSession> _conversations = new();
        private readonly TimeSpan _expireAfter = TimeSpan.FromHours(1);
        private readonly ILogger<ConversationCacheService> _logger;

        public ConversationCacheService(ILogger<ConversationCacheService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Get all messages for a specific conversation
        /// </summary>
        public List<Message> GetMessages(string conversationId)
        {
            CleanupExpiredConversations();
            
            if (_conversations.TryGetValue(conversationId, out var session))
            {
                session.LastActivity = DateTime.UtcNow;
                return session.Messages;
            }

            // Create new conversation if it doesn't exist
            var newSession = new ConversationSession(conversationId);
            _conversations[conversationId] = newSession;
            _logger.LogInformation("Created new conversation session for ID: {ConversationId}", conversationId);
            
            return newSession.Messages;
        }

        /// <summary>
        /// Add a message to a specific conversation
        /// </summary>
        public void AddMessage(string conversationId, Message message)
        {
            CleanupExpiredConversations();
            
            var session = _conversations.GetOrAdd(conversationId, id => new ConversationSession(id));
            session.AddMessage(message);
            
            _logger.LogDebug("Added message to conversation {ConversationId}. Total messages: {MessageCount}", 
                conversationId, session.Messages.Count);
        }

        /// <summary>
        /// Set all messages for a conversation (used after tool processing)
        /// </summary>
        public void SetMessages(string conversationId, List<Message> messages)
        {
            CleanupExpiredConversations();
            
            var session = _conversations.GetOrAdd(conversationId, id => new ConversationSession(id));
            session.Messages = messages;
            session.LastActivity = DateTime.UtcNow;
            
            _logger.LogDebug("Set {MessageCount} messages for conversation {ConversationId}", 
                messages.Count, conversationId);
        }

        /// <summary>
        /// Remove expired conversations from memory
        /// </summary>
        public void CleanupExpiredConversations()
        {
            var expiredKeys = _conversations
                .Where(kvp => kvp.Value.IsExpired(_expireAfter))
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var key in expiredKeys)
            {
                if (_conversations.TryRemove(key, out var removedSession))
                {
                    _logger.LogInformation("Removed expired conversation {ConversationId} with {MessageCount} messages", 
                        key, removedSession.Messages.Count);
                }
            }
        }

        /// <summary>
        /// Get the number of active conversations
        /// </summary>
        public int GetActiveConversationCount()
        {
            CleanupExpiredConversations();
            return _conversations.Count;
        }
    }
} 