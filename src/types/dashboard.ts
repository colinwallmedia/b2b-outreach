export interface DashboardKPI {
    id: string;
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon_key: string;
    icon_color: string;
}
