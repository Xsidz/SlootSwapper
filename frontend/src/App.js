import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import CalendarDashboard from './components/CalendarDashboard';
import MarketplaceView from './components/MarketplaceView';
import NotificationsView from './components/NotificationsView';

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50">
                        <Routes>
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/signup" element={<SignupForm />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <CalendarDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/marketplace"
                                element={
                                    <ProtectedRoute>
                                        <MarketplaceView />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/notifications"
                                element={
                                    <ProtectedRoute>
                                        <NotificationsView />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;