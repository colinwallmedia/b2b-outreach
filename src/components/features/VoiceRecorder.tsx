import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import SpeechToTextService from '../../services/speechToText';

interface VoiceRecorderProps {
    onTranscript: (text: string) => void;
    isRecording?: boolean;
    onStateChange?: (isRecording: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    onTranscript,
    isRecording: externalIsRecording,
    onStateChange
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const speechService = useRef<SpeechToTextService | null>(null);

    useEffect(() => {
        speechService.current = new SpeechToTextService();
        return () => {
            if (speechService.current) {
                speechService.current.stopRecording();
            }
        };
    }, []);

    // Sync with external state if provided
    useEffect(() => {
        if (typeof externalIsRecording === 'boolean' && externalIsRecording !== isRecording) {
            if (externalIsRecording) {
                startRecording();
            } else {
                stopRecording();
            }
        }
    }, [externalIsRecording]);

    const startRecording = () => {
        setError(null);
        if (!speechService.current?.isSupported()) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        speechService.current.startRecording(
            (text, isFinal) => {
                if (isFinal) {
                    onTranscript(text);
                }
            },
            (err) => {
                console.error('Voice Recorder Error:', err);
                setError('Error recording audio');
                stopRecording();
            }
        );

        setIsRecording(true);
        onStateChange?.(true);
    };

    const stopRecording = () => {
        if (speechService.current) {
            speechService.current.stopRecording();
        }
        setIsRecording(false);
        onStateChange?.(false);
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    if (error) {
        return (
            <div className="text-red-500 text-xs mt-1" title={error}>
                <MicOff size={16} />
            </div>
        );
    }

    return (
        <button
            onClick={toggleRecording}
            className={`p-2 rounded-full transition-all duration-200 ${isRecording
                ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
            type="button"
        >
            {isRecording ? <Square size={18} /> : <Mic size={18} />}
        </button>
    );
};
