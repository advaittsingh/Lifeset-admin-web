import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { LogIn, Loader2, Shield, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        emailOrMobile: email,
        password,
      });
      
      // Handle the response structure: response.data is the axios wrapper, response.data.data is our API response
      const apiResponse = response.data;
      const loginData = apiResponse.data || apiResponse;
      
      if (loginData.user && loginData.accessToken) {
        await setAuth(loginData.user, loginData.accessToken);
        // Redirect based on user role
        const userType = loginData.user.userType || loginData.user.user_type || 'ADMIN';
        if (userType === 'COMPANY') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error?.message || 
                          err.message || 
                          'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50 mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            LifeSet Admin
          </h1>
          <p className="text-slate-600 text-sm">Secure Admin Portal</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Sign in to your admin account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs">!</span>
                    </div>
                  </div>
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email or Mobile
                </label>
                <Input
                  id="email"
                  type="text"
                  placeholder="admin@lifeset.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500" />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-center text-slate-500">
                Protected by enterprise-grade security
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2024 LifeSet Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
