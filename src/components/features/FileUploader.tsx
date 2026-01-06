import React, { useRef, useState } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { fileUploadService } from '../../services/fileUpload';

interface FileUploaderProps {
    onUploadComplete: (fileUrl: string, fileName: string) => void;
    userId?: string; // Optional, defaults to 'anonymous' or handled by auth context in real app
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, userId = 'user-123' }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setIsUploading(true);

        try {
            const result = await fileUploadService.uploadFile(file, userId);
            onUploadComplete(result.url, result.filename);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative inline-block">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
            />

            <button
                onClick={handleClick}
                disabled={isUploading}
                className={`p-2 rounded-full transition-colors ${isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                title="Attach file"
                type="button"
            >
                {isUploading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Paperclip size={18} />
                )}
            </button>
        </div>
    );
};
