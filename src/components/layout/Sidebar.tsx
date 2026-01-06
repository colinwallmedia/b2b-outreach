import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Search,
    UserCog,
    Send,
    BarChart3,
    LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/company-profile', label: 'Company Profile', icon: Building2 },
    { path: '/research', label: 'Research', icon: Search },
    { path: '/personalisation', label: 'Personalisation', icon: UserCog },
    { path: '/execution', label: 'Execution', icon: Send },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white">
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
                <h1 className="text-xl font-bold text-primary">Outreach B2B</h1>
            </div>

            <nav className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-primary",
                                        isActive ? "bg-blue-50 text-blue-600 hover:bg-blue-50" : "text-gray-700"
                                    )
                                }
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="border-t border-gray-200 pt-4">
                    <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </nav>
        </aside>
    );
}
