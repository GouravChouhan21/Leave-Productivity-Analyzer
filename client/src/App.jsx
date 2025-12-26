import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import EmployeePage from './pages/EmployeePage';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/upload') return location.pathname === '/upload' || location.pathname === '/';
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/employee') return location.pathname.startsWith('/employee');
    return false;
  };

  const navLinkClass = (path) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <nav className="flex space-x-1">
      <Link to="/upload" className={navLinkClass('/upload')}>
        Upload
      </Link>
      <Link to="/dashboard" className={navLinkClass('/dashboard')}>
        Dashboard
      </Link>
      <span className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive('/employee') ? 'bg-primary-100 text-primary-700' : 'text-gray-400'
      }`}>
        Employee Details
      </span>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Leave & Productivity Analyzer
              </h1>
              <Navigation />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employee/:id" element={<EmployeePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;