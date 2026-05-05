import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle } from 'lucide-react';
import api from '../lib/apiClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [oauthError, setOauthError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      // Redirect based on role
      const rolePaths = {
        Admin: '/admin',
        Teacher: '/teacher',
        Student: '/student',
        Parent: '/parent',
        Principal: '/principal'
      };
      navigate(rolePaths[user.role] || '/');
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setOauthError('');
    try {
      const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
      const res = await api.get(`/api/auth/oauth/${provider}`, { params: { redirectUri } });
      const redirectUrl = res.data?.data?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setOauthError(err.response?.data?.error || `${provider} login unavailable`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EduManage</h1>
          <p className="text-indigo-200">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="name@school.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-xs text-indigo-200 mb-3 text-center">Or continue with</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => handleSocialLogin('google')} className="w-full py-2.5 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
              Continue with Google
            </button>
            <button onClick={() => handleSocialLogin('microsoft')} className="w-full py-2.5 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
              Continue with Microsoft
            </button>
            <button onClick={() => handleSocialLogin('apple')} className="w-full py-2.5 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
              Continue with Apple
            </button>
          </div>
          {oauthError && <p className="text-xs text-red-300 mt-2 text-center">{oauthError}</p>}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-indigo-300">
            Forgot your password? <a href="#" className="text-indigo-400 hover:text-white font-medium underline underline-offset-4">Contact Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
