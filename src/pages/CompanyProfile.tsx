import { useState } from 'react';
import { Building2, Target, Lightbulb, Users as UsersIcon } from 'lucide-react';
import { CompanyForm } from '../components/company/CompanyForm';
import { ICPGenerator } from '../components/company/ICPGenerator';
import { TeamList } from '../components/company/TeamList';
import { ValuePropBuilder } from '../components/company/ValuePropBuilder';

type Tab = 'general' | 'value-prop' | 'icp' | 'team';

export default function CompanyProfile() {
    const [activeTab, setActiveTab] = useState<Tab>('general');

    const tabs = [
        { id: 'general' as const, label: 'General Info', icon: Building2 },
        { id: 'value-prop' as const, label: 'Value Proposition', icon: Lightbulb },
        { id: 'icp' as const, label: 'Ideal Customer Profile', icon: Target },
        { id: 'team' as const, label: 'Team Members', icon: UsersIcon },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Company Profile</h2>
                <p className="text-muted-foreground mt-1 text-sm text-gray-500">
                    Manage your organization details and target audience settings.
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }
                `}
                            >
                                <Icon
                                    className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                                />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'general' && <CompanyForm />}
                {activeTab === 'value-prop' && <ValuePropBuilder />}
                {activeTab === 'icp' && <ICPGenerator />}
                {activeTab === 'team' && <TeamList />}
            </div>
        </div>
    );
}
