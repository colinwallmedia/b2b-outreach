// Re-exporting configured placeholders
import PlaceholderPage from '../components/ui/PlaceholderPage';
import CompanyProfile from './CompanyProfile'; // Import the new component

export { CompanyProfile }; // Export it
import { ChatContainer } from '../components/chat/ChatContainer';

export const Research = () => (
    <div className="h-[calc(100vh-4rem)] p-6">
        <ChatContainer
            taskType="company_research"
            initialMessage="Help me research potential companies."
            context="You are a research assistant helping to find B2B leads."
        />
    </div>
);
export const Personalisation = () => <PlaceholderPage title="Personalisation" />;
export const Execution = () => <PlaceholderPage title="Execution" />;
export const Analytics = () => <PlaceholderPage title="Analytics" />;
