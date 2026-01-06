// Re-exporting configured placeholders
import PlaceholderPage from '../components/ui/PlaceholderPage';
import CompanyProfile from './CompanyProfile'; // Import the new component

export { CompanyProfile }; // Export it
export const Research = () => <PlaceholderPage title="Research" />;
export const Personalisation = () => <PlaceholderPage title="Personalisation" />;
export const Execution = () => <PlaceholderPage title="Execution" />;
export const Analytics = () => <PlaceholderPage title="Analytics" />;
