'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

/**
 * Authentication guard for admin panel access.
 * Validates credentials via server-side API endpoint.
 * Session is managed via httpOnly cookie (set by the server).
 */
export default function AuthGuard({ children, onAuthenticated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const MAX_ATTEMPTS = 5;

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    let timer;
    if (isLocked && lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const checkExistingSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        onAuthenticated?.(true);
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError(`Account locked. Try again in ${Math.ceil(lockoutTime / 1000)} seconds.`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setLoginAttempts(0);
        onAuthenticated?.(true);
        setCredentials({ username: '', password: '' });
      } else if (res.status === 429) {
        setIsLocked(true);
        setLockoutTime((data.retryAfter || 300) * 1000);
        setError('Too many failed attempts. Account locked.');
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        const remaining = data.remaining ?? (MAX_ATTEMPTS - newAttempts);
        setError(`Invalid credentials. ${Math.max(0, remaining)} attempts remaining.`);
      }
    } catch (err) {
      setError('Authentication service unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
    setCredentials({ username: '', password: '' });
    onAuthenticated?.(false);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show loading spinner while checking session to avoid flash
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Security Header */}
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-green-800">
              <Shield size={16} />
              <span>Secure Admin Session Active</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-green-700 hover:text-green-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Security Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">Restricted Access</span>
          </div>
          <p className="text-sm text-yellow-700">
            This admin panel is for authorized personnel only. All access attempts are logged and monitored.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ZSCORE Admin</h1>
            <p className="text-gray-600 mt-2">Content Management System</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isLocked && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-orange-800 mb-2">
                <Lock size={16} />
                <span className="font-semibold">Account Locked</span>
              </div>
              <p className="text-orange-700 text-sm">
                Time remaining: {formatTime(lockoutTime)}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter username"
                disabled={isLocked || isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter password"
                  disabled={isLocked || isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLocked || isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLocked || isLoading || !credentials.username || !credentials.password}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Failed attempts: {loginAttempts}/{MAX_ATTEMPTS}
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Session timeout: 1 hour</p>
        </div>
      </div>
    </div>
  );
}
