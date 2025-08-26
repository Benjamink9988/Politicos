
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NationalAuditPage from './components/pages/NationalAuditPage';
import PersonAnalysisPage from './components/pages/PersonAnalysisPage';
import ConstituencyPage from './components/pages/ConstituencyPage';
import DashboardPage from './components/pages/DashboardPage';
import Footer from './components/common/Footer';
import LegislativeSupportPage from './components/pages/LegislativeSupportPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-background text-text-primary">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 sm:p-8 md:p-10 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/audit" element={<NationalAuditPage />} />
              <Route path="/analysis" element={<PersonAnalysisPage />} />
              <Route path="/constituency" element={<ConstituencyPage />} />
              <Route path="/legislative-support" element={<LegislativeSupportPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
