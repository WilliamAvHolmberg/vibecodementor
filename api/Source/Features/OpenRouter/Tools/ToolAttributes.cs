using System;

namespace Api.Features.OpenRouter.Tools
{
    /// <summary>
    /// Marks a method as available for use as an OpenRouter tool
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ToolMethodAttribute : Attribute
    {
        /// <summary>
        /// Description of what the tool does
        /// </summary>
        public string Description { get; }
        
        /// <summary>
        /// Optional name override (if not specified, method name converted to snake_case will be used)
        /// </summary>
        public string Name { get; }
        
        /// <summary>
        /// Marks a method as available for use as an OpenRouter tool
        /// </summary>
        /// <param name="description">Description of what the tool does</param>
        public ToolMethodAttribute(string description)
        {
            Description = description;
            Name = null;
        }
        
        /// <summary>
        /// Marks a method as available for use as an OpenRouter tool
        /// </summary>
        /// <param name="name">Name of the tool (snake_case preferred)</param>
        /// <param name="description">Description of what the tool does</param>
        public ToolMethodAttribute(string name, string description)
        {
            Name = name;
            Description = description;
        }
    }
    
    /// <summary>
    /// Provides additional metadata for a tool parameter
    /// </summary>
    [AttributeUsage(AttributeTargets.Parameter)]
    public class ToolParameterAttribute : Attribute
    {
        /// <summary>
        /// Description of the parameter
        /// </summary>
        public string Description { get; }
        
        /// <summary>
        /// Whether the parameter is required
        /// </summary>
        public bool Required { get; }
        
        /// <summary>
        /// Provides additional metadata for a tool parameter
        /// </summary>
        /// <param name="description">Description of the parameter</param>
        /// <param name="required">Whether the parameter is required (default: true)</param>
        public ToolParameterAttribute(string description, bool required = true)
        {
            Description = description;
            Required = required;
        }
    }
} 