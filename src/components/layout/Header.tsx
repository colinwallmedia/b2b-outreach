import { Bell, Search, User } from 'lucide-react';

export function Header() {
    return (
        <header className="fixed right-0 top-0 left-64 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex w-96 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search companies, contacts..."
                    className="bg-transparent text-sm outline-none placeholder:text-gray-400 w-full"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-700">John Doe</span>
                        <span className="text-xs text-gray-500">Admin</span>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-white">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
