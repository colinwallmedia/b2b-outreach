import React from 'react';
import { User, Sparkles } from 'lucide-react';
import type { Message } from '../../services/openrouter';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`py-6 ${isUser ? 'bg-white' : 'bg-gray-50/50'}`}>
            <div className="max-w-4xl mx-auto px-4 flex gap-6">
                <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          ${isUser
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'}
        `}>
                    {isUser ? <User size={18} /> : <Sparkles size={18} />}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="font-medium text-sm text-gray-900">
                        {isUser ? 'You' : 'AI Assistant'}
                    </div>
                    <div className={`
            prose prose-sm max-w-none text-gray-600 leading-relaxed
            ${isUser ? 'whitespace-pre-wrap' : ''}
          `}>
                        {/* 
                In a real app, use ReactMarkdown here. 
                For now we'll just display text, handling bolding somewhat if needed or plain text 
             */}
                        {message.content.split('\n').map((line, i) => (
                            <p key={i} className="min-h-[1em]">{line}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
