import { useEffect, useState } from 'react';
import { Users, Mail, MousePointerClick, MessageSquare, Calendar, TrendingUp, AlertCircle, type LucideIcon } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { supabase } from '../lib/supabase';
import type { DashboardKPI } from '../types/dashboard';

const ICON_MAP: Record<string, LucideIcon> = {
    Users,
    Mail,
    MousePointerClick,
    MessageSquare,
    Calendar,
    TrendingUp,
};

export default function Dashboard() {
    const [kpis, setKpis] = useState<DashboardKPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchKPIs() {
            try {
                const { data, error } = await supabase
                    .from('dashboard_kpis')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (data) {
                    setKpis(data);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        }

        fetchKPIs();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                <p className="text-muted-foreground mt-1 text-sm text-gray-500">
                    Overview of your outreach performance and key metrics.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi) => {
                    const IconComponent = ICON_MAP[kpi.icon_key] || Users;
                    return (
                        <KPICard
                            key={kpi.id}
                            title={kpi.title}
                            value={kpi.value}
                            change={kpi.change}
                            trend={kpi.trend}
                            icon={IconComponent}
                            iconColor={kpi.icon_color}
                        />
                    );
                })}
            </div>

            {/* Placeholder for charts/tables */}
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                <p>Charts and detailed analytics will be implemented here.</p>
            </div>
        </div>
    );
}
