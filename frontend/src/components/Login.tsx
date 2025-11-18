import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const success = await register(username, email, password);
      if (success) {
        setSuccess('Registration successful! You can now sign in.');
        // Reset form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Switch to login mode after a short delay
        setTimeout(() => {
          setIsRegister(false);
          setSuccess('');
        }, 2000);
      } else {
        setError('Registration failed. Username or email may already be taken.');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">
              Formula 1 Data Management System
            </h1>
            <p className="login-subtitle">
              Monitor race results, driver points, and constructor performance
            </p>
          </div>

          {/* Toggle between Login and Register */}
          <div className="login-tabs">
            <button
              type="button"
              onClick={() => isRegister && switchMode()}
              className={`login-tab ${!isRegister ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => !isRegister && switchMode()}
              className={`login-tab ${isRegister ? 'active' : ''}`}
            >
              Register
            </button>
          </div>
          
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="login-form">
            {error && (
              <div className="login-alert login-alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="login-alert login-alert-success">
                {success}
              </div>
            )}
            
            <div className="login-input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="login-input"
              />
            </div>

            {isRegister && (
              <div className="login-input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
              </div>
            )}
            
            <div className="login-input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>

            {isRegister && (
              <div className="login-input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="login-input"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading 
                ? (isRegister ? 'Registering...' : 'Signing in...') 
                : (isRegister ? 'Register' : 'Sign In')
              }
            </button>
          </form>

          {!isRegister && (
            <div className="login-demo-info">
              <p><strong>Demo Credentials:</strong> admin / admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;