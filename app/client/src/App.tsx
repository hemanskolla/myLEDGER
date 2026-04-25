import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CrmPage from './pages/CrmPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/crm"
        element={
          <ProtectedRoute>
            <CrmPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
