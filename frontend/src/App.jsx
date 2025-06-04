import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TaskList from './components/TaskList';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ConfirmSignup from './components/auth/ConfirmSignup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Loading from './components/Loading';
import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (err) {
      console.log('Not authenticated:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/tasks" /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/tasks" /> : <Signup />} 
        />
        <Route 
          path="/confirm-signup" 
          element={isAuthenticated ? <Navigate to="/tasks" /> : <ConfirmSignup />} 
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} replace />} 
        />
      </Routes>
    </div>
  );
}

// Wrap the App with Router
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
