/**
 * Web Speech API Type Definitions
 * These augment the global scope to include Web Speech API types
 * which might not be present in all TypeScript configurations.
 */

interface SpeechRecognitionErrorEvent extends Event {
    error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
    message: string;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

export type TranscriptCallback = (text: string, isFinal: boolean) => void;
export type ErrorCallback = (error: string) => void;

type RecordingState = 'idle' | 'recording' | 'paused';

/**
 * Service to handle speech-to-text functionality using the Web Speech API.
 * 
 * Features:
 * - Browser Web Speech API wrapper
 * - Real-time transcription
 * - Separate handling for interim and final results
 * - Error handling for common speech recognition issues
 * 
 * @example
 * const speechService = new SpeechToTextService();
 * 
 * if (speechService.isSupported()) {
 *   speechService.startRecording(
 *     (text, isFinal) => {
 *       console.log(isFinal ? 'Final:' : 'Interim:', text);
 *     },
 *     (error) => {
 *       console.error('Speech recognition error:', error);
 *     }
 *   );
 * 
 *   // Later...
 *   speechService.stopRecording();
 * }
 */
export default class SpeechToTextService {
    private recognition: SpeechRecognition | null = null;
    private state: RecordingState = 'idle';
    private onTranscript: TranscriptCallback | null = null;
    private onError: ErrorCallback | null = null;

    constructor() {
        this.initializeRecognition();
    }

    /**
     * Initializes the SpeechRecognition instance if supported by the browser.
     */
    private initializeRecognition(): void {
        if (typeof window === 'undefined') return;

        // Check for browser support (standard or webkit prefix)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();

            // Configure settings
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            // Bind event handlers
            this.recognition.onresult = this.handleResult.bind(this);
            this.recognition.onerror = this.handleError.bind(this);
            this.recognition.onend = this.handleEnd.bind(this);
        }
    }

    /**
     * Checks if the Web Speech API is supported in the current environment.
     * @returns {boolean} True if supported, false otherwise.
     */
    public isSupported(): boolean {
        return !!this.recognition;
    }

    /**
     * Starts the speech recognition recording.
     * @param onTranscript Callback function to receive transcript text and finality status.
     * @param onError Callback function to handle errors.
     */
    public startRecording(onTranscript: TranscriptCallback, onError: ErrorCallback): void {
        if (!this.recognition) {
            onError('Speech recognition is not supported in this browser.');
            return;
        }

        if (this.state === 'recording') {
            return; // Already recording
        }

        this.onTranscript = onTranscript;
        this.onError = onError;

        try {
            this.recognition.start();
            this.state = 'recording';
        } catch (error) {
            // Sometimes start() throws if instance is already active
            if (this.onError && error instanceof Error) {
                this.onError(`Failed to start recording: ${error.message}`);
            }
        }
    }

    /**
     * Stops the speech recognition recording.
     */
    public stopRecording(): void {
        if (!this.recognition || this.state === 'idle') return;

        this.recognition.stop();
        this.state = 'idle';
    }

    /**
     * Pauses the recording.
     * Note: Web Speech API does not support native pause; this stops the stream.
     * Resuming will start a new stream.
     */
    public pauseRecording(): void {
        if (!this.recognition || this.state !== 'recording') return;

        this.recognition.stop();
        this.state = 'paused';
    }

    /**
     * Resumes the recording from a paused state.
     */
    public resumeRecording(): void {
        if (!this.recognition || this.state !== 'paused') return;

        if (this.onTranscript && this.onError) {
            try {
                this.recognition.start();
                this.state = 'recording';
            } catch (error) {
                if (this.onError && error instanceof Error) {
                    this.onError(`Failed to resume recording: ${error.message}`);
                }
            }
        }
    }

    /**
     * Returns the current state of the service.
     */
    public getState(): RecordingState {
        return this.state;
    }

    private handleResult(event: SpeechRecognitionEvent): void {
        if (!this.onTranscript) return;

        // The API might return multiple results; we want the latest
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const isFinal = result.isFinal;

            this.onTranscript(transcript, isFinal);
        }
    }

    private handleError(event: SpeechRecognitionErrorEvent): void {
        if (!this.onError) return;

        let errorMessage = 'An unknown error occurred.';

        switch (event.error) {
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please allow access to the microphone.';
                this.state = 'idle'; // Force idle on permission error
                break;
            case 'network':
                errorMessage = 'Network error experienced while recording.';
                break;
            case 'no-speech':
                // No speech detected is a common event, might not require alerting the user aggressively,
                // but we pass it as a message.
                errorMessage = 'No speech was detected.';
                break;
            case 'audio-capture':
                errorMessage = 'No microphone was found or audio capture failed.';
                break;
            default:
                errorMessage = `Speech recognition error: ${event.error}`;
        }

        this.onError(errorMessage);
    }

    private handleEnd(): void {
        // If we are in 'recording' state but it ended (e.g. silence timeout),
        // we might want to automatically restart if "continuous" logic dictates it,
        // OR we just mark it as idle.
        // Given the simple requirement, we will mark it effectively as idle unless we implement auto-restart logic.
        // However, simply updating state to 'idle' is the safest base implementation.

        // Note: If paused, we called stop(), so onend will fire. We want to stay 'paused'.

        if (this.state === 'recording') {
            this.state = 'idle';
        }
    }
}
