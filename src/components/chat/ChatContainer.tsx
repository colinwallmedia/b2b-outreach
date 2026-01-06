import React, { useState, useRef, useEffect } from 'react';
import { openRouterService, type Message, type TaskType } from '../../services/openrouter';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Loader2 } from 'lucide-react';

interface ChatContainerProps {
    initialMessage?: string;
    taskType?: TaskType;
    context?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    initialMessage,
    taskType = 'quick_response',
    context
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            handleSendMessage(initialMessage);
        }
    }, [initialMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        const userMessage: Message = { role: 'user', content };

        // Optimistic update
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Prepare conversation history
            // Add system context if provided
            let conversation: Message[] = [...messages, userMessage];

            if (context) {
                conversation = [
                    { role: 'system', content: `Context: ${context}` },
                    ...conversation
                ];
            }

            // We'll use streaming for better UX
            /* 
               NOTE: For this implementation phase, we will use the non-streaming chat method first 
               to ensure stability, or implement streaming if the service supports it well.
               The openRouterService has streamChat, let's try to use it for that premium feel.
            */

            // -- Streaming Implementation --
            let assistantMessageContent = '';

            // Add a placeholder assistant message
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            await openRouterService.streamChat(
                conversation,
                taskType,
                (chunk) => {
                    assistantMessageContent += chunk;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        // Update the last message (which is the assistant placeholder)
                        newMessages[newMessages.length - 1] = {
                            role: 'assistant',
                            content: assistantMessageContent
                        };
                        return newMessages;
                    });
                }
            );

        } catch (error) {
            console.error('Chat error:', error);
            // Remove the user message on error or show error message
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Sorry, I encountered an error creating a response. Please try again.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header (Optional) */}
            <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                    {taskType.replace('_', ' ').toUpperCase()}
                </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/30">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="max-w-xs text-sm">
                            Start a conversation. I can help you with research, analysis, and content generation.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {messages.map((msg, index) => (
                            // Filter out system messages from display
                            msg.role !== 'system' && (
                                <ChatMessage key={index} message={msg} />
                            )
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="py-6 px-4 max-w-4xl mx-auto flex gap-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-400 animate-pulse">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
};
