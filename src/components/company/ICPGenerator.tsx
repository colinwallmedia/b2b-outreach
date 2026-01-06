import { useState, useEffect } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Mock AI Data
const MOCK_ICP_RESULT = {
    demographics: {
        role: "VP of Sales / CRO",
        companySize: "50-500 employees",
        industry: "B2B SaaS",
        location: "North America / Europe"
    },
    painPoints: [
        "High CAC due to inefficient outbound",
        "SDR team defaulting to generic templates",
        "Difficulty identifying high-intent leads"
    ],
    goals: [
        "Increase qualified pipeline coverage",
        "Automate personalized outreach at scale",
        "Reduce ramp time for new SDRs"
    ]
};

export function ICPGenerator() {
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [icpData, setIcpData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await supabase.from('companies').select('id, target_audience').limit(1).single();
                if (data) {
                    setCompanyId(data.id);
                    setIcpData(data.target_audience);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleGenerate = async () => {
        if (!companyId) return;
        setGenerating(true);

        // Simulate AI delay
        setTimeout(async () => {
            try {
                const { error } = await supabase
                    .from('companies')
                    .update({ target_audience: MOCK_ICP_RESULT })
                    .eq('id', companyId);

                if (error) throw error;
                setIcpData(MOCK_ICP_RESULT);
            } catch (err) {
                console.error(err);
                alert('Failed to generate ICP');
            } finally {
                setGenerating(false);
            }
        }, 2000);
    };

    if (loading) return <div>Loading...</div>;
    if (!companyId) return <div>Please create a company first.</div>;

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Ideal Customer Profile (ICP)</h3>
                    <p className="text-sm text-gray-500">AI-generated analysis of your perfect prospect.</p>
                </div>
                <Bot className="h-6 w-6 text-purple-600" />
            </div>

            {!icpData ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Bot className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-4">No ICP generated yet. Let our AI analyze your company info.</p>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50"
                    >
                        {generating ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Generating Analysis...
                            </>
                        ) : (
                            'Generate ICP with AI'
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Display Mock Data fields */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-2">Demographics</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li><strong>Role:</strong> {icpData.demographics?.role}</li>
                                <li><strong>Size:</strong> {icpData.demographics?.companySize}</li>
                                <li><strong>Industry:</strong> {icpData.demographics?.industry}</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <h4 className="font-semibold text-amber-900 mb-2">Pain Points</h4>
                            <ul className="text-sm text-amber-800 space-y-1 list-disc pl-4">
                                {icpData.painPoints?.map((p: string, i: number) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-semibold text-green-900 mb-2">Strategic Goals</h4>
                        <ul className="text-sm text-green-800 space-y-1 list-disc pl-4 grid md:grid-cols-2">
                            {icpData.goals?.map((g: string, i: number) => (
                                <li key={i}>{g}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="text-sm text-gray-500 hover:text-purple-600 flex items-center transition-colors"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Regenerate Analysis
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
