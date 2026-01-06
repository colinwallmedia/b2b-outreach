import { supabase } from '../lib/supabase';

// Environment variables
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL;
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY; // Optional
const MINDPAL_API_KEY = import.meta.env.VITE_MINDPAL_API_KEY;

// Constants for predefined workflows
export const WORKFLOWS = {
    COMPANY_RESEARCH: 'company-research',
    DOCUMENT_ANALYSIS: 'analyze-document',
    ICP_ENRICHMENT: 'enrich-icp',
    LEAD_SOURCING: 'source-leads',
} as const;

export type WorkflowType = typeof WORKFLOWS[keyof typeof WORKFLOWS];

// Service Interfaces
export interface WebhookResponse<T = any> {
    success: boolean;
    data?: T;
    webhookId?: string;
    estimatedTime?: number; // in seconds
    error?: string;
}

export interface WebhookPayload {
    [key: string]: any;
}

interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;
    backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffFactor: 2,
};

// Helper for retrying fetch requests
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
    let attempt = 0;
    let delay = config.initialDelay;

    while (attempt < config.maxAttempts) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            // If we get a server error (5xx), we might want to retry
            if (response.status >= 500 && attempt < config.maxAttempts - 1) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response; // Return 4xx errors directly, don't retry
        } catch (error) {
            attempt++;
            if (attempt === config.maxAttempts) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= config.backoffFactor;
        }
    }
    throw new Error('Max retry attempts reached');
}

export const webhookService = {
    /**
     * Trigger an n8n workflow
     */
    async triggerN8N(workflowName: string, payload: WebhookPayload): Promise<WebhookResponse> {
        if (!N8N_BASE_URL) {
            console.error('VITE_N8N_BASE_URL is not defined');
            return { success: false, error: 'Configuration error: N8N URL missing' };
        }

        const url = `${N8N_BASE_URL.replace(/\/$/, '')}/${workflowName}`;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (N8N_API_KEY) {
            headers['X-N8N-API-KEY'] = N8N_API_KEY;
        }

        try {
            const response = await fetchWithRetry(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`n8n request failed: ${response.statusText}`);
            }

            const data = await response.json().catch(() => ({})); // Handle empty responses

            return {
                success: true,
                data,
                webhookId: data.webhookId || crypto.randomUUID(), // Fallback if n8n doesn't return ID
                estimatedTime: 30, // Default estimate
            };
        } catch (error) {
            console.error('Failed to trigger n8n workflow:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },

    /**
     * Trigger a MindPal agent
     */
    async triggerMindPal(agentId: string, payload: WebhookPayload): Promise<WebhookResponse> {
        if (!MINDPAL_API_KEY) {
            console.error('VITE_MINDPAL_API_KEY is not defined');
            return { success: false, error: 'Configuration error: MindPal API Key missing' };
        }

        // Assumption: MindPal API endpoint structure. Adjust as per actual API docs.
        const url = `https://api.mindpal.io/v1/agents/${agentId}/trigger`; // Placeholder URL

        try {
            const response = await fetchWithRetry(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MINDPAL_API_KEY}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`MindPal request failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                data,
                webhookId: data.executionId || data.id,
                estimatedTime: 60,
            };
        } catch (error) {
            console.error('Failed to trigger MindPal agent:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },

    /**
     * Poll for results or wait for subscription
     * @param webhookId The ID of the webhook/workflow execution
     * @param timeoutMs Max time to wait in ms (default 5 mins)
     */
    async waitForResult(webhookId: string, timeoutMs: number = 300000): Promise<WebhookResponse> {
        const startTime = Date.now();

        return new Promise((resolve) => {
            // 1. Check if result already exists in Supabase
            const checkDb = async () => {
                const { data, error } = await supabase
                    .from('workflow_results')
                    .select('*')
                    .eq('webhook_id', webhookId)
                    .single();

                if (data && !error) {
                    resolve({ success: true, data });
                    return true;
                }
                return false;
            };

            // Initial check
            checkDb().then((found) => {
                if (found) return;

                // 2. Set up polling interval as backup or primary if Realtime fails
                const pollInterval = setInterval(async () => {
                    if (Date.now() - startTime > timeoutMs) {
                        clearInterval(pollInterval);
                        resolve({ success: false, error: 'Timeout waiting for result' });
                        return;
                    }

                    const found = await checkDb();
                    if (found) {
                        clearInterval(pollInterval);
                    }
                }, 5000); // Poll every 5 seconds
            });
        });
    },

    /**
     * Subscribe to real-time updates for a specific user's workflows
     */
    subscribeToResults(userId: string, callback: (payload: any) => void): () => void {
        const channel = supabase
            .channel('workflow_results_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERT and UPDATE
                    schema: 'public',
                    table: 'workflow_results',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    callback(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
