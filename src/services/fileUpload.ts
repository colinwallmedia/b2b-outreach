import { supabase } from '../lib/supabase';
import { webhookService } from './webhooks';

export interface FileUploadResult {
    uploadId: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    path: string;
}

const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'text/plain', // TXT
    'text/csv', // CSV
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'image/png',
    'image/jpeg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_UPLOAD = 5;

export const fileUploadService = {
    /**
     * Upload a single file to Supabase Storage
     */
    async uploadFile(file: File, userId: string): Promise<FileUploadResult> {
        this.validateFile(file);

        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${userId}/${timestamp}-${sanitizedFilename}`;

        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, file);

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

        // Store metadata in database
        const { data: dbData, error: dbError } = await supabase
            .from('file_uploads')
            .insert({
                user_id: userId,
                filename: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type,
                public_url: publicUrl,
            })
            .select()
            .single();

        if (dbError) {
            // Cleanup storage if DB insert fails
            await this.deleteFile(filePath);
            throw new Error(`Database insert failed: ${dbError.message}`);
        }

        // Trigger analysis
        await this.analyzeFile(publicUrl, file.type);

        return {
            uploadId: dbData.id,
            url: publicUrl,
            filename: file.name,
            size: file.size,
            type: file.type,
            path: filePath,
        };
    },

    /**
     * Upload multiple files
     */
    async uploadMultiple(files: File[], userId: string): Promise<FileUploadResult[]> {
        if (files.length > MAX_FILES_PER_UPLOAD) {
            throw new Error(`Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`);
        }

        const results: FileUploadResult[] = [];
        const errors: any[] = [];

        for (const file of files) {
            try {
                const result = await this.uploadFile(file, userId);
                results.push(result);
            } catch (error) {
                errors.push({ file: file.name, error });
            }
        }

        if (errors.length > 0 && results.length === 0) {
            throw new Error(`All uploads failed: ${JSON.stringify(errors)}`);
        }

        // In a partial failure scenario, we return the successful ones. 
        // The calling component can decide what to do with the errors if needed, 
        // but here we simply return the results of successful uploads.
        return results;
    },

    /**
     * Delete file from storage and database
     */
    async deleteFile(filePath: string): Promise<void> {
        const { error: storageError } = await supabase.storage
            .from('uploads')
            .remove([filePath]);

        if (storageError) {
            throw new Error(`Storage delete failed: ${storageError.message}`);
        }

        // Also try to remove from DB if it exists, but don't fail hard if storage delete worked
        await supabase
            .from('file_uploads')
            .delete()
            .match({ file_path: filePath });
    },

    /**
     * Get public URL for a file
     */
    getFileUrl(filePath: string): string {
        const { data } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);
        return data.publicUrl;
    },

    /**
     * Validate file type and size
     */
    validateFile(file: File): void {
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error(`File type ${file.type} not supported. Allowed types: PDF, DOCX, TXT, CSV, XLSX, PNG, JPG`);
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size ${file.size} exceeds limit of 10MB`);
        }
    },

    /**
     * Trigger document analysis via webhook
     */
    async analyzeFile(fileUrl: string, fileType: string): Promise<void> {
        // Don't await this, trigger it asynchronously
        webhookService.triggerN8N('analyze-document', {
            fileUrl,
            fileType,
            status: 'pending_analysis'
        }).catch(err => console.error("Failed to trigger analysis webhook", err));
    }
};
