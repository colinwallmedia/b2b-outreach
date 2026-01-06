import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Header />
            <main className="pl-64 pt-16">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
