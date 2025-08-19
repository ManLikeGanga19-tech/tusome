'use client'

import { BookOpen, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, Users, BookMarked, Trophy, GraduationCap, Shield, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Import your existing auth hooks (assuming they exist in the same location as signup)
// If these don't exist yet, I'll create them below
import { useAuth } from '@/lib/api/auth';

// Types to match your backend
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade: string;
  grade_category: 'primary' | 'junior' | 'senior';
  grade_tier: 'Primary CBC' | 'Junior Secondary' | 'Senior Secondary';
  profile_image?: string;
  is_active: boolean;
  email_verified: boolean;
  trial_start_date?: Date;
  trial_end_date?: Date;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_in: number;
  message: string;
}

// Helper function to determine dashboard route based on grade category
function getDashboardRoute(gradeCategory: 'primary' | 'junior' | 'senior'): string {
  const dashboardRoutes = {
    primary: '/dashboard/primary',     // Grades 4-6
    junior: '/dashboard/junior',       // Grades 7-9  
    senior: '/dashboard/senior'        // Grades 10-12
  };

  return dashboardRoutes[gradeCategory] || '/dashboard/junior'; // Default fallback
}

// Grade mapping for display purposes (matches your gradeConfig)
const getGradeDisplayInfo = (gradeLevel: string) => {
  const gradeMap: Record<string, { label: string; tier: string; category: string; color: string }> = {
    'grade-4': { label: 'Grade 4', tier: 'Primary CBC', category: 'primary', color: 'blue' },
    'grade-5': { label: 'Grade 5', tier: 'Primary CBC', category: 'primary', color: 'blue' },
    'grade-6': { label: 'Grade 6', tier: 'Primary CBC', category: 'primary', color: 'blue' },
    'grade-7': { label: 'Grade 7', tier: 'Junior Secondary', category: 'junior', color: 'green' },
    'grade-8': { label: 'Grade 8', tier: 'Junior Secondary', category: 'junior', color: 'green' },
    'grade-9': { label: 'Grade 9', tier: 'Junior Secondary', category: 'junior', color: 'green' },
    'grade-10': { label: 'Grade 10', tier: 'Senior Secondary', category: 'senior', color: 'red' },
    'grade-11': { label: 'Grade 11', tier: 'Senior Secondary', category: 'senior', color: 'red' },
    'grade-12': { label: 'Grade 12', tier: 'Senior Secondary', category: 'senior', color: 'red' },
  };

  return gradeMap[gradeLevel] || null;
};

// Custom hook for login functionality
function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (loginData: LoginRequest): Promise<AuthResponse> => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting login process...');
      console.log('Login data:', { email: loginData.email, password: '[HIDDEN]' });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log('Backend response status:', response.status);

      if (!response.ok) {
        console.error('❌ Login failed:', data);
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      console.log('✅ Login successful!');

      // Store tokens in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data as AuthResponse;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError('');

  return { login, loading, error, clearError };
}

// Custom hook to fetch user info by email (for grade tier display)
function useUserLookup() {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const lookupUser = async (email: string) => {
    if (!email || !email.includes('@')) {
      setUserInfo(null);
      return;
    }

    setLoading(true);
    try {
      console.log('Looking up user info for:', email);

      // Create a lightweight endpoint call to check if user exists and get basic info
      // Since your backend doesn't have a public user lookup endpoint, we'll simulate
      // what the API response would look like by calling a getUserByEmail equivalent

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/user-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData.user || null);
      } else {
        // User not found or error - don't show tier info
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error looking up user:', error);
      // For demo purposes, let's simulate some users until you create the endpoint
      simulateUserLookup(email);
    } finally {
      setLoading(false);
    }
  };

  // Temporary simulation function until you create the backend endpoint
  const simulateUserLookup = (email: string) => {
    const mockUsers: Record<string, Partial<User>> = {
      'test@gmail.com': {
        id: '1',
        first_name: 'Test',
        last_name: 'Student',
        email: 'test@gmail.com',
        grade: 'grade-8',
        grade_category: 'junior',
        grade_tier: 'Junior Secondary',
        subscription_status: 'trial'
      },
      'john.doe@example.com': {
        id: '2',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        grade: 'grade-10',
        grade_category: 'senior',
        grade_tier: 'Senior Secondary',
        subscription_status: 'active'
      },
      'grace.m@student.ke': {
        id: '3',
        first_name: 'Grace',
        last_name: 'Mwangi',
        email: 'grace.m@student.ke',
        grade: 'grade-12',
        grade_category: 'senior',
        grade_tier: 'Senior Secondary',
        subscription_status: 'trial'
      },
      'peter.k@student.ke': {
        id: '4',
        first_name: 'Peter',
        last_name: 'Kiprotich',
        email: 'peter.k@student.ke',
        grade: 'grade-6',
        grade_category: 'primary',
        grade_tier: 'Primary CBC',
        subscription_status: 'active'
      },
    };

    const userData = mockUsers[email.toLowerCase()];
    setUserInfo(userData as User || null);
  };

  return { userInfo, loading, lookupUser, setUserInfo };
}

function SignInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { login, loading: loginLoading, error, clearError } = useLogin();
  const { userInfo, loading: lookupLoading, lookupUser, setUserInfo } = useUserLookup();

  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Redirect if already authenticated - redirect to sign-in instead of dashboard
  useEffect(() => {
    if (user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  // Lookup user info when email changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email && formData.email.includes('@')) {
        lookupUser(formData.email);
      } else {
        // Clear user info if email is invalid
        if (userInfo) {
          setUserInfo(null);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const authResponse = await login({
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Login successful:', authResponse);

      // Determine dashboard route based on user's grade category
      const dashboardRoute = getDashboardRoute(authResponse.user.grade_category);
      console.log(`Redirecting to dashboard: ${dashboardRoute}`);

      // Store user data for dashboard access
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('refresh_token', authResponse.refresh_token);

      // Show success message with automatic redirect (like signup page)
      const gradeInfo = getGradeDisplayInfo(authResponse.user.grade);
      setSuccessMessage(`Welcome back! Redirecting to your ${authResponse.user.grade_tier} dashboard...`);

      // Redirect to appropriate dashboard after showing success message
      setTimeout(() => {
        router.push(dashboardRoute);
      }, 2000);

    } catch (error) {
      console.error('❌ Login failed:', error);
      // Error is already handled by the useLogin hook
    }
  };

  // Handle forgot password click
  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const features = [
    {
      icon: BookMarked,
      title: "Fast Loading",
      description: "Optimized content that loads quickly on slow connections"
    },
    {
      icon: Users,
      title: "Local Content",
      description: "CBC curriculum with Kenyan examples and context"
    },
    {
      icon: Trophy,
      title: "M-Pesa Payments",
      description: "Easy and affordable payments through mobile money"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          {/* Logo */}
          <div className="flex items-center group">
            <div className="relative">
              <BookOpen className="h-12 w-12 text-green-600 transition-transform duration-300" />
              <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75"></div>
            </div>
            <span className="ml-3 text-3xl font-bold text-gray-900 tracking-tight">Tusome</span>
          </div>

          {/* Welcome Back Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Welcome Back to Your Learning Journey
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Continue your studies with content designed for Kenyan students. Fast-loading lessons that work well even on slower internet connections.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2K+</div>
              <div className="text-sm text-gray-600">Kenyan Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">14+</div>
              <div className="text-sm text-gray-600">Counties Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2 pb-6">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-4">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Tusome</span>
                </div>
              </div>

              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to access your learning dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success Message - Fallback like signup page */}
              {successMessage && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Sign In Failed</div>
                      <div className="text-sm">{error}</div>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs mt-2 text-red-500">
                          Check browser console and Encore logs for details
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="ml-2 h-auto p-0 text-red-600 hover:text-red-700"
                    >
                      Dismiss
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Connection Status for Development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Backend: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Grade Level Display - Shows when user is found via login response */}
                {userInfo && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Student Account</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Verified</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Grade Level:</span>
                        <Badge className={`text-xs ${userInfo.grade_category === 'junior' ? 'bg-green-100 text-green-800' :
                            userInfo.grade_category === 'senior' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {getGradeDisplayInfo(userInfo.grade)?.label || userInfo.grade}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Program:</span>
                        <span className="text-sm font-medium text-gray-900">{userInfo.grade_tier}</span>
                      </div>

                      <div className="pt-1 border-t border-green-100">
                        <p className="text-xs text-gray-500">
                          Welcome back, {userInfo.first_name}! Your content is personalized for {getGradeDisplayInfo(userInfo.grade)?.label || userInfo.grade}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                      className="border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-green-600 text-white py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold relative overflow-hidden group"
                  size="lg"
                >
                  {loginLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="relative z-10">
                        {userInfo ? `Access ${userInfo.grade_tier} Dashboard` : 'Sign In'}
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-green-700 transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></div>
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50 transition-colors duration-300"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <span className="text-gray-600">Don't have an account? </span>
                <a
                  href="/auth/signup"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
                >
                  Sign up for free
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;