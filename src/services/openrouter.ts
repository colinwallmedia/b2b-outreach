import { supabase } from '../lib/supabase'; // Assuming supabase client is available if needed for logging later, or remove if not used yet.

// Types
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface OpenRouterRequest {
    model: string;
    messages: Message[];
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}

export interface OpenRouterResponse {
    id: string;
    choices: {
        message: Message;
        finish_reason: string | null;
    }[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    error?: {
        code: number;
        message: string;
    };
}

export type TaskType =
    | 'company_research'
    | 'icp_conversation'
    | 'document_analysis'
    | 'quick_response'
    | 'synthesis'
    | 'data_extraction';

export type ModelRouting = Record<TaskType, string>;

/**
 * Service for interacting with OpenRouter API
 */
export class OpenRouterService {
    private apiKey: string;
    private baseUrl: string = 'https://openrouter.ai/api/v1';

    private modelRouting: ModelRouting = {
        company_research: 'anthropic/claude-3.5-sonnet',
        icp_conversation: 'openai/gpt-4-turbo',
        document_analysis: 'anthropic/claude-3.5-sonnet',
        quick_response: 'openai/gpt-4o-mini',
        synthesis: 'anthropic/claude-3.5-sonnet',
        data_extraction: 'openai/gpt-4-turbo'
    };

    constructor() {
        this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
        if (!this.apiKey) {
            console.warn('OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in .env');
        }
    }

    /**
     * Selects the appropriate model for a given task
     * @param taskType The type of task to perform
     * @returns The model ID string
     */
    public selectModel(taskType: TaskType): string {
        return this.modelRouting[taskType] || this.modelRouting.quick_response;
    }

    /**
     * Sends a chat completion request to OpenRouter
     * @param messages Array of messages
     * @param taskType The type of task (determines model)
     * @param options Additional options
     * @returns The assistant's response message
     */
    public async chat(
        messages: Message[],
        taskType: TaskType,
        options: Partial<OpenRouterRequest> = {}
    ): Promise<Message | null> {
        const model = this.selectModel(taskType);
        const requestBody: OpenRouterRequest = {
            model,
            messages,
            ...options
        };

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                if (import.meta.env.DEV) {
                    console.log(`[OpenRouter] Request (Attempt ${attempts}):`, { taskType, model, messages });
                }

                const response = await fetch(`${this.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': window.location.origin, // Optional, for including your app on openrouter.ai rankings
                        'X-Title': 'Outreach B2B Platform', // Optional. Shows in rankings on openrouter.ai.
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
                }

                const data: OpenRouterResponse = await response.json();

                if (data.error) {
                    throw new Error(`OpenRouter API returned error: ${data.error.message}`);
                }

                if (import.meta.env.DEV) {
                    console.log(`[OpenRouter] Response:`, data);
                }

                if (data.usage) {
                    this.trackUsage(model, data.usage.prompt_tokens, data.usage.completion_tokens);
                }

                return data.choices[0]?.message || null;

            } catch (error) {
                console.error(`[OpenRouter] Error (Attempt ${attempts}):`, error);

                if (attempts === maxAttempts) {
                    throw error;
                }

                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
            }
        }

        return null;
    }

    /**
     * Streams chat response
     * @param messages Array of messages
     * @param taskType The type of task
     * @param onChunk Callback for each chunk of content
     */
    public async streamChat(
        messages: Message[],
        taskType: TaskType,
        onChunk: (content: string) => void
    ): Promise<void> {
        const model = this.selectModel(taskType);

        try {
            if (import.meta.env.DEV) {
                console.log(`[OpenRouter] Stream Request:`, { taskType, model });
            }

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Outreach B2B Platform',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`Stream error: ${response.statusText}`);
            }

            if (!response.body) throw new Error('ReadableStream not supported');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.trim() === 'data: [DONE]') return;

                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            console.warn('Error parsing stream chunk', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('[OpenRouter] Stream error:', error);
            throw error;
        }
    }

    /**
     * Tracks token usage for cost monitoring
     * @param model Model used
     * @param inputTokens Number of input tokens
     * @param outputTokens Number of output tokens
     */
    public trackUsage(model: string, inputTokens: number, outputTokens: number): void {
        // In a real app, you might send this to your backend database
        if (import.meta.env.DEV) {
            console.log(`[Usage Tracked] Model: ${model}, Input: ${inputTokens}, Output: ${outputTokens}`);
        }

        // Example: send to analytics service or supabase
        // this.logUsageToSupabase(model, inputTokens, outputTokens);
    }
}

export const openRouterService = new OpenRouterService();
