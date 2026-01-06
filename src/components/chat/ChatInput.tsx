import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, } from 'lucide-react';
import { VoiceRecorder } from '../features/VoiceRecorder';
import { FileUploader } from '../features/FileUploader';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleTranscript = (text: string) => {
        setMessage((prev) => (prev ? `${prev} ${text}` : text));
    };

    const handleUploadComplete = (url: string, fileName: string) => {
        // For now, we'll append the file info to the message or handle it as context.
        // simpler approach: append to message text
        const attachmentText = `\n[Attached: ${fileName}](${url})`;
        setMessage((prev) => prev + attachmentText);
    };

    return (
        <div className="bg-white border-t border-gray-100 p-4">
            <div className="max-w-4xl mx-auto relative flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Feature Tools */}
                <div className="flex items-center gap-1">
                    <VoiceRecorder onTranscript={handleTranscript} isRecording={false} />
                    <FileUploader onUploadComplete={handleUploadComplete} />

                    <button
                        onClick={() => handleSubmit()}
                        disabled={!message.trim() || isLoading}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${message.trim() && !isLoading
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
            <div className="max-w-4xl mx-auto mt-2 text-xs text-gray-400 text-center">
                AI can make mistakes. Please verify important information.
            </div>
        </div>
    );
};
