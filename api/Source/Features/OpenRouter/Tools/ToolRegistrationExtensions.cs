using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Api.Features.OpenRouter.Tools
{
    /// <summary>
    /// Extension methods for registering tools with OpenRouterClient
    /// </summary>
    public static class ToolRegistrationExtensions
    {
        /// <summary>
        /// Register a method as a tool by passing a method reference
        /// </summary>
        /// <typeparam name="TResult">Return type of the method</typeparam>
        /// <param name="client">The OpenRouterClient instance</param>
        /// <param name="method">Method to register as a tool</param>
        /// <returns>The client for chaining</returns>
        public static OpenRouterClient RegisterTool<TResult>(
            this OpenRouterClient client,
            Func<string, TResult> method)
        {
            return RegisterToolInternal(client, method.Method, method.Target, null);
        }
        
        /// <summary>
        /// Register a method as a tool by passing a method reference
        /// </summary>
        /// <typeparam name="T1">Type of the first parameter</typeparam>
        /// <typeparam name="TResult">Return type of the method</typeparam>
        /// <param name="client">The OpenRouterClient instance</param>
        /// <param name="method">Method to register as a tool</param>
        /// <returns>The client for chaining</returns>
        public static OpenRouterClient RegisterTool<T1, TResult>(
            this OpenRouterClient client,
            Func<T1, TResult> method)
        {
            return RegisterToolInternal(client, method.Method, method.Target, null);
        }
        
        /// <summary>
        /// Register a method as a tool by passing a method reference
        /// </summary>
        /// <typeparam name="T1">Type of the first parameter</typeparam>
        /// <typeparam name="T2">Type of the second parameter</typeparam>
        /// <typeparam name="TResult">Return type of the method</typeparam>
        /// <param name="client">The OpenRouterClient instance</param>
        /// <param name="method">Method to register as a tool</param>
        /// <returns>The client for chaining</returns>
        public static OpenRouterClient RegisterTool<T1, T2, TResult>(
            this OpenRouterClient client,
            Func<T1, T2, TResult> method)
        {
            return RegisterToolInternal(client, method.Method, method.Target, null);
        }
        
        /// <summary>
        /// Register a method as a tool by passing a method reference and a custom name
        /// </summary>
        /// <typeparam name="TResult">Return type of the method</typeparam>
        /// <param name="client">The OpenRouterClient instance</param>
        /// <param name="method">Method to register as a tool</param>
        /// <param name="customName">Custom name for the tool</param>
        /// <returns>The client for chaining</returns>
        public static OpenRouterClient RegisterTool<TResult>(
            this OpenRouterClient client,
            Func<string, TResult> method,
            string customName)
        {
            return RegisterToolInternal(client, method.Method, method.Target, customName);
        }
        
        /// <summary>
        /// Register an async method as a tool by passing a method reference
        /// </summary>
        /// <typeparam name="TResult">Return type of the method</typeparam>
        /// <param name="client">The OpenRouterClient instance</param>
        /// <param name="method">Async method to register as a tool</param>
        /// <returns>The client for chaining</returns>
        public static OpenRouterClient RegisterTool<TResult>(
            this OpenRouterClient client,
            Func<string, Task<TResult>> method)
        {
            return RegisterToolInternal(client, method.Method, method.Target, null);
        }
        
        /// <summary>
        /// Register a method by specifying its object instance and method name
        /// </summary>
        /// <param name="client">The OpenRouterClient instance</param>
        /// <param name="instance">The object containing the method</param>
        /// <param name="methodName">The name of the method</param>
        /// <returns>The client for chaining</returns>
        public static OpenRouterClient RegisterTool(
            this OpenRouterClient client,
            object instance,
            string methodName)
        {
            var method = instance.GetType().GetMethod(methodName);
            if (method == null)
            {
                throw new ArgumentException($"Method '{methodName}' not found on type '{instance.GetType().Name}'");
            }
            
            return RegisterToolInternal(client, method, instance, null);
        }
        
        private static OpenRouterClient RegisterToolInternal(
            OpenRouterClient client,
            MethodInfo methodInfo,
            object targetInstance,
            string customName = null)
        {
            // Get tool metadata
            var toolAttr = methodInfo.GetCustomAttribute<ToolMethodAttribute>();
            if (toolAttr == null)
            {
                throw new InvalidOperationException(
                    $"Method '{methodInfo.Name}' is not marked with [ToolMethod] attribute");
            }
            
            // Get tool name (either from attribute, custom parameter, or method name)
            string toolName = customName ?? toolAttr.Name ?? ToSnakeCase(methodInfo.Name);
            
            // Generate schema from method parameters
            var parametersSchema = SchemaGenerator.GenerateParametersSchema(methodInfo);
            
            // Register the tool with the client
            var tool = Tool.CreateFunctionTool(
                toolName,
                toolAttr.Description,
                parametersSchema
            );
            
            // Create function to invoke the method
            Func<string, object> implementation = (argsJson) =>
            {
                try
                {
                    // Parse arguments from JSON
                    var argValues = DeserializeArguments(argsJson, methodInfo);
                    
                    // Invoke the method
                    var result = methodInfo.Invoke(targetInstance, argValues);
                    
                    // Handle async methods
                    if (result is Task task)
                    {
                        task.Wait(); // Wait for task to complete
                        
                        // Extract result from task if it's a Task<T>
                        if (methodInfo.ReturnType.IsGenericType && 
                            methodInfo.ReturnType.GetGenericTypeDefinition() == typeof(Task<>))
                        {
                            var resultProperty = task.GetType().GetProperty("Result");
                            result = resultProperty.GetValue(task);
                        }
                        else
                        {
                            // It's a Task without result
                            result = "Task completed successfully";
                        }
                    }
                    
                    return result;
                }
                catch (Exception ex)
                {
                    // Unwrap reflection exceptions
                    if (ex is TargetInvocationException targetEx && targetEx.InnerException != null)
                    {
                        ex = targetEx.InnerException;
                    }
                    
                    // Return error information
                    return $"Error executing tool: {ex.Message}";
                }
            };
            
            // Register with client
            client.RegisterTool(toolName, implementation, toolAttr.Description, parametersSchema);
            
            return client;
        }
        
        private static object[] DeserializeArguments(string argsJson, MethodInfo method)
        {
            var parameters = method.GetParameters();
            if (parameters.Length == 0)
            {
                return Array.Empty<object>();
            }
            
            // Parse the JSON arguments
            JsonDocument jsonDoc = JsonDocument.Parse(argsJson);
            var argValues = new object[parameters.Length];
            
            for (int i = 0; i < parameters.Length; i++)
            {
                var param = parameters[i];
                
                // Check if the parameter exists in the JSON
                if (jsonDoc.RootElement.TryGetProperty(param.Name, out var jsonValue))
                {
                    // Convert the JSON value to the parameter type
                    argValues[i] = DeserializeValue(jsonValue, param.ParameterType);
                }
                else if (param.HasDefaultValue)
                {
                    // Use default value if not provided
                    argValues[i] = param.DefaultValue;
                }
                else
                {
                    // Parameter is required but not provided
                    throw new ArgumentException($"Required parameter '{param.Name}' was not provided");
                }
            }
            
            return argValues;
        }
        
        private static object DeserializeValue(JsonElement jsonValue, Type targetType)
        {
            switch (jsonValue.ValueKind)
            {
                case JsonValueKind.String:
                    var stringValue = jsonValue.GetString();
                    if (targetType == typeof(string))
                    {
                        return stringValue;
                    }
                    // Add conversion for other types that can be parsed from string
                    return Convert.ChangeType(stringValue, targetType);
                    
                case JsonValueKind.Number:
                    if (targetType == typeof(int) || targetType == typeof(int?))
                    {
                        return jsonValue.GetInt32();
                    }
                    else if (targetType == typeof(long) || targetType == typeof(long?))
                    {
                        return jsonValue.GetInt64();
                    }
                    else if (targetType == typeof(float) || targetType == typeof(float?))
                    {
                        return jsonValue.GetSingle();
                    }
                    else if (targetType == typeof(double) || targetType == typeof(double?))
                    {
                        return jsonValue.GetDouble();
                    }
                    else if (targetType == typeof(decimal) || targetType == typeof(decimal?))
                    {
                        return jsonValue.GetDecimal();
                    }
                    break;
                    
                case JsonValueKind.True:
                case JsonValueKind.False:
                    return jsonValue.GetBoolean();
                    
                case JsonValueKind.Object:
                    // For complex objects, use System.Text.Json serializer
                    return JsonSerializer.Deserialize(jsonValue.GetRawText(), targetType);
                    
                case JsonValueKind.Array:
                    // Handle array types
                    if (targetType.IsArray)
                    {
                        var elementType = targetType.GetElementType();
                        var array = Array.CreateInstance(elementType, jsonValue.GetArrayLength());
                        
                        int index = 0;
                        foreach (var element in jsonValue.EnumerateArray())
                        {
                            array.SetValue(DeserializeValue(element, elementType), index++);
                        }
                        
                        return array;
                    }
                    // Handle generic collections
                    else if (targetType.IsGenericType)
                    {
                        var genericType = targetType.GetGenericTypeDefinition();
                        if (genericType == typeof(List<>))
                        {
                            var elementType = targetType.GetGenericArguments()[0];
                            var listType = typeof(List<>).MakeGenericType(elementType);
                            var list = Activator.CreateInstance(listType);
                            var addMethod = listType.GetMethod("Add");
                            
                            foreach (var element in jsonValue.EnumerateArray())
                            {
                                var value = DeserializeValue(element, elementType);
                                addMethod.Invoke(list, new[] { value });
                            }
                            
                            return list;
                        }
                    }
                    break;
                    
                case JsonValueKind.Null:
                    return null;
            }
            
            // Fallback to built-in deserializer for complex cases
            return JsonSerializer.Deserialize(jsonValue.GetRawText(), targetType);
        }
        
        private static string ToSnakeCase(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return text;
            }
            
            // Insert underscore before uppercase letters
            var snakeCase = Regex.Replace(text, "([a-z0-9])([A-Z])", "$1_$2").ToLower();
            
            return snakeCase;
        }
    }
} 