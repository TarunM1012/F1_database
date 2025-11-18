import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Views from './components/Views';
import CRUD from './components/CRUD';
import Analytics from './components/Analytics';
import DataExport from './components/DataExport';
import ExternalAPIs from './components/ExternalAPIs';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Landing Page - No Navbar */}
            <Route path="/" element={<LandingPage />} />
            
            {/* All other routes with Navbar */}
            <Route path="/*" element={
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/views" 
                      element={
                        <ProtectedRoute>
                          <Views />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/crud" 
                      element={
                        <ProtectedRoute>
                          <CRUD />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/export" 
                      element={
                        <ProtectedRoute>
                          <DataExport />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/external-apis" 
                      element={
                        <ProtectedRoute>
                          <ExternalAPIs />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
              </div>
            } />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;