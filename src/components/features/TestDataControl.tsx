import React, { useState } from 'react';
import { Database, Check, AlertCircle, Loader2 } from 'lucide-react';
import { seedTestData } from '../../utils/seedData';

export const TestDataControl: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSeed = async () => {
        setStatus('loading');
        const result = await seedTestData();
        setStatus(result.success ? 'success' : 'error');
        setMessage(result.message);

        // Reset after 3 seconds
        if (result.success) {
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
                // Reload to show new data if on relevant pages
                window.location.reload();
            }, 3000);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Database size={16} className="text-blue-600" />
                Test Data Control
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                Populate the database with sample company and team data for testing.
            </p>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleSeed}
                    disabled={status === 'loading'}
                    className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white transition-all
            ${status === 'success' ? 'bg-green-600 hover:bg-green-700' :
                            status === 'error' ? 'bg-red-600 hover:bg-red-700' :
                                'bg-blue-600 hover:bg-blue-700'}
            disabled:opacity-50 disabled:cursor-wait
          `}
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Seeding...
                        </>
                    ) : status === 'success' ? (
                        <>
                            <Check size={16} className="mr-2" />
                            Success
                        </>
                    ) : status === 'error' ? (
                        <>
                            <AlertCircle size={16} className="mr-2" />
                            Retry
                        </>
                    ) : (
                        'Populate Test Data'
                    )}
                </button>
            </div>

            {message && (
                <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};
