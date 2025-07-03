export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: (ChatContent | ToolUseContent)[] | string;
    timestamp: Date;
    name?: string | null;
    tool_name?: string | null;
    tool_call_id?: string | null;
    tool_calls?: ToolCall[] | null;
}

export interface TextContent {
    type: 'text';
    text?: string;
}

export interface ToolUseContent {
    type: 'tool_use';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tool_use: any;
}

export interface ToolResultContent {
    type: 'tool_result';
    tool_name?: string;
    tool_result?: string;
}

export type ChatContent = {
    type: 'text';
    text: string;
};

export interface ChatState {
    messages: ChatMessage[];
    isStreaming: boolean;
    currentStreamingContent: string;
}

export type ToolCallFunction = {
    name: string;
    arguments: string;
};

export type ToolCall = {
    id: string;
    type: string;
    function: ToolCallFunction;
};

export enum StreamState {
    Loading = 'Loading',
    Text = 'Text',
    ToolCall = 'ToolCall',
    Complete = 'Complete'
}

export interface CurrentTool {
    id: string;
    name: string;
    input: string;
    result: string;
}

// StreamEventType matches the C# enum
export enum StreamEventType {
    StateChange = 'StateChange',
    TextContent = 'TextContent',
    ToolCall = 'ToolCall',
    ToolResult = 'ToolResult',
    Error = 'Error',
    Complete = 'Complete'
}

// OpenRouter model interfaces
export interface OpenRouterModelPricing {
    prompt: string;
    completion: string;
}

export interface OpenRouterModel {
    id: string;
    name: string;
    contextLength: number;
    pricing: OpenRouterModelPricing;
    description: string;
    features: string[];
}

// FunctionCall matches the C# class
export interface FunctionCall {
    name?: string;
    arguments?: string;
}

// StreamEventArgs matches the C# class
export interface StreamEventArgs {
    eventType: StreamEventType;
    state: StreamState;
    toolName?: string;
    textDelta?: string;
    toolCall?: ToolCall;
    toolResult?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalResponse?: any;
} 