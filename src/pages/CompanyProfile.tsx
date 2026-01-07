import { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, Building2, Globe, Save, Edit2, Check } from 'lucide-react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { webhookService } from '../services/webhooks';
import { supabase } from '../lib/supabase';
import type { Company } from '../types/company';

type ProfileState = 'input' | 'researching' | 'chat' | 'summary';

interface ResearchProgress {
    step: string;
    completed: boolean;
}

export default function CompanyProfile() {
    const [state, setState] = useState<ProfileState>('input');
    const [url, setUrl] = useState('');
    const [researchData, setResearchData] = useState<Partial<Company> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<ResearchProgress[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Mock progress steps for the visual effect
    const startResearchSimulation = () => {
        const steps = [
            { step: 'Analyzing website content...', completed: false },
            { step: 'Locating LinkedIn profile...', completed: false },
            { step: 'Extracting company information...', completed: false },
            { step: 'Generating insights...', completed: false },
        ];
        setProgress(steps);

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep >= steps.length) {
                clearInterval(interval);
                return;
            }

            setProgress(prev => prev.map((p, i) =>
                i === currentStep ? { ...p, completed: true } : p
            ));
            currentStep++;
        }, 1500);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setState('researching');
        setError(null);
        startResearchSimulation();

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || 'anonymous';

            // Trigger n8n workflow
            const response = await webhookService.triggerN8N('company-research', {
                companyUrl: url,
                userId: userId,
                timestamp: Date.now()
            });

            if (!response.success && !import.meta.env.DEV) {
                throw new Error(response.error || 'Failed to start research');
            }

            setTimeout(() => {
                const mockData: Partial<Company> = {
                    name: "NetBrain Technologies",
                    industry: "Enterprise Software",
                    description: "Leading enterprise AI Network Operations software provider.",
                    website: url,
                    target_territories: ["North America", "EMEA"],
                    use_cases: [
                        {
                            name: "Network Automation",
                            description: "Automating network configuration",
                            icp: {
                                company_size: "5000+",
                                industries: ["Financial Services", "Healthcare"],
                                decision_makers: ["CIO", "VP Network Ops"],
                                pain_points: ["Manual configs", "Slow changes"],
                                goals: ["Automation", "Visibility"],
                                budget_range: "$500k+"
                            }
                        }
                    ],
                    case_studies: []
                };

                setResearchData(mockData);
                setState('chat');
            }, 7000);

        } catch (err) {
            console.error('Research error:', err);
            setError('Failed to complete research. Please try again.');
            setState('input');
        }
    };

    const handleSaveProfile = async () => {
        if (!researchData) return;
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user logged in");

            const { error: saveError } = await supabase
                .from('companies')
                .upsert({
                    user_id: user.id,
                    name: researchData.name,
                    website: researchData.website,
                    industry: researchData.industry,
                    description: researchData.description,
                    target_territories: researchData.target_territories,
                    use_cases: researchData.use_cases,
                    case_studies: researchData.case_studies,
                    value_propositions: researchData.value_propositions,
                    updated_at: new Date().toISOString()
                });

            if (saveError) throw saveError;

            alert('Profile saved successfully!');
            setState('summary'); // Stay on summary or reset? 
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const generateInitialMessage = (data: Partial<Company> | null) => {
        if (!data) return '';
        return `Great! I've analyzed ${data.name}. Here's what I found:

✅ CONFIRMED INFORMATION:
• Company: ${data.name}
• Industry: ${data.industry}
• Description: ${data.description}

Let me ask you a few questions to complete your profile...
First, what geographic territories do you primarily focus on?`;
    };

    if (state === 'input') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-2xl text-center space-y-8">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-6">
                            <Building2 size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Let's Build Your Company Profile</h1>
                        <p className="text-lg text-gray-600">
                            Enter your company website URL and our AI will research your business<br />
                            to help define your ideal customer profile.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Globe className="text-gray-400" size={20} />
                            </div>
                            <input
                                type="url"
                                required
                                placeholder="https://yourcompany.com"
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg transition-all"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Search size={20} />
                            Research My Company
                        </button>
                    </form>

                    {error && (
                        <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 py-2 px-4 rounded-lg text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (state === 'researching') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="relative w-16 h-16 mx-auto">
                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                            <div className="relative bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center text-blue-600">
                                <Search size={24} />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Researching {url}...</h2>
                        <p className="text-sm text-gray-500">This usually takes 30-60 seconds</p>
                    </div>

                    <div className="space-y-4">
                        {progress.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 transition-opacity duration-300" style={{ opacity: item.completed ? 1 : 0.5 }}>
                                {item.completed ? (
                                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <CheckCircle2 size={12} />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                        <Loader2 size={12} className="text-gray-400 animate-spin" />
                                    </div>
                                )}
                                <span className={`text-sm ${item.completed ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                    {item.step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (state === 'chat') {
        return (
            <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col">
                <div className="flex-none p-4 bg-white border-b border-gray-200 flex justify-between items-center px-8">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Company Research</h2>
                        <p className="text-sm text-gray-500">I'm analyzing your company to build the perfect profile.</p>
                    </div>
                    <button
                        onClick={() => setState('summary')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <CheckCircle2 size={18} />
                        View Profile Summary
                    </button>
                </div>
                <div className="flex-1 max-w-5xl w-full mx-auto p-4 h-full">
                    <ChatContainer
                        taskType="company_research"
                        initialMessage={generateInitialMessage(researchData)}
                        context={`You are a business analyst.`}
                    />
                </div>
            </div>
        );
    }

    if (state === 'summary') {
        return (
            <div className="max-w-5xl mx-auto p-8 space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
                        <p className="text-gray-500 mt-1">Review and confirm the gathered information.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setState('chat')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Edit2 size={16} />
                            Continue Research
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Confirm & Save Profile
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="text-gray-400" size={20} />
                            General Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Company Name</label>
                                <div className="mt-1 text-gray-900 font-medium">{researchData?.name}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Industry</label>
                                <div className="mt-1 text-gray-900">{researchData?.industry}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <div className="mt-1 text-gray-900">{researchData?.description}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-500">Target Territories</label>
                                <div className="mt-1 flex gap-2">
                                    {researchData?.target_territories?.map(t => (
                                        <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Check className="text-gray-400" size={20} />
                            Use Cases & ICPs
                        </h3>
                        {researchData?.use_cases?.map((uc, idx) => (
                            <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900">{uc.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">{uc.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Company Size:</span> {uc.icp.company_size}
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Decision Makers:</span> {uc.icp.decision_makers.join(', ')}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Pain Points:</span> {uc.icp.pain_points.join(', ')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
