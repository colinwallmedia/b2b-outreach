

// This is a helper to quickly generate placeholder pages
const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">
                This module is currently under development.
            </p>
        </div>
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
            <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">{title} Module</h3>
                <p className="mt-1 text-sm text-gray-500">Coming soon</p>
            </div>
        </div>
    </div>
);

export default PlaceholderPage;
