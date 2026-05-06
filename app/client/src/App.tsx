import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CrmPage from './apps/myledger/pages/CrmPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/myledger" element={<CrmPage />} />
        <Route path="/myledger/*" element={<CrmPage />} />
      </Routes>
    </BrowserRouter>
  );
}
