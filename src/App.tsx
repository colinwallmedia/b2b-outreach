import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import {
  CompanyProfile,
  Research,
  Personalisation,
  Execution,
  Analytics
} from './pages';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="company-profile" element={<CompanyProfile />} />
              <Route path="research" element={<Research />} />
              <Route path="personalisation" element={<Personalisation />} />
              <Route path="execution" element={<Execution />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
