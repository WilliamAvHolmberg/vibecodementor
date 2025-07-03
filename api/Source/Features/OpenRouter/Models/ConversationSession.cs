using Api.Features.OpenRouter.Models;

namespace Api.Features.OpenRouter.Models
{
    public class ConversationSession
    {
        public string ConversationId { get; set; } = string.Empty;
        public List<Message> Messages { get; set; } = new List<Message>();
        public DateTime LastActivity { get; set; } = DateTime.UtcNow;

        public ConversationSession(string conversationId)
        {
            ConversationId = conversationId;
            LastActivity = DateTime.UtcNow;
        }

        public void AddMessage(Message message)
        {
            Messages.Add(message);
            LastActivity = DateTime.UtcNow;
        }

        public bool IsExpired(TimeSpan expireAfter)
        {
            return DateTime.UtcNow - LastActivity > expireAfter;
        }
    }
} 