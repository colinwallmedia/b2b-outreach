import { Users, Mail, MousePointerClick, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';

export default function Dashboard() {
    const kpis = [
        { title: 'Total Prospects', value: '2,543', change: '+12.5%', trend: 'up' as const, icon: Users, iconColor: 'text-blue-600' },
        { title: 'Emails Sent', value: '12,450', change: '+8.2%', trend: 'up' as const, icon: Mail, iconColor: 'text-purple-600' },
        { title: 'Open Rate', value: '45.2%', change: '-2.1%', trend: 'down' as const, icon: MousePointerClick, iconColor: 'text-yellow-600' },
        { title: 'Reply Rate', value: '12.8%', change: '+1.4%', trend: 'up' as const, icon: MessageSquare, iconColor: 'text-green-600' },
        { title: 'Meetings Booked', value: '84', change: '+24.5%', trend: 'up' as const, icon: Calendar, iconColor: 'text-pink-600' },
        { title: 'Pipeline Value', value: '$142k', change: '+18.2%', trend: 'up' as const, icon: TrendingUp, iconColor: 'text-indigo-600' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                <p className="text-muted-foreground mt-1 text-sm text-gray-500">
                    Overview of your outreach performance and key metrics.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>

            {/* Placeholder for charts/tables */}
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                <p>Charts and detailed analytics will be implemented here.</p>
            </div>
        </div>
    );
}
