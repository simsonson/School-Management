import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/apiClient';

const OAuthCallback = () => {
  const { provider } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) {
        setError('Authorization code not found');
        return;
      }
      try {
        const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
        const res = await api.post(`/api/auth/oauth/${provider}/callback`, { code, redirectUri });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        const rolePaths = { Admin: '/admin', Teacher: '/teacher', Student: '/student', Parent: '/parent', Principal: '/principal' };
        navigate(rolePaths[user.role] || '/');
      } catch (err) {
        setError(err.response?.data?.error || 'OAuth login failed');
      }
    };
    run();
  }, [provider, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
        {error ? <p className="text-red-600">{error}</p> : <p className="text-gray-600">Completing {provider} login...</p>}
      </div>
    </div>
  );
};

export default OAuthCallback;
