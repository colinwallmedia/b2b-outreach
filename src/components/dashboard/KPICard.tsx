import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface KPICardProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    iconColor?: string;
}

export function KPICard({ title, value, change, trend, icon: Icon, iconColor = "text-primary" }: KPICardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={cn("rounded-lg p-2 bg-gray-50", iconColor)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span
                    className={cn(
                        "font-medium",
                        trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-gray-600"
                    )}
                >
                    {change}
                </span>
                <span className="ml-2 text-gray-500">vs last month</span>
            </div>
        </div>
    );
}
