'use client'

import { BookOpen, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, Users, BookMarked, Trophy } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call with validation
    setTimeout(() => {
      setIsLoading(false);

      // Check credentials
      if (formData.email === 'test@gmail.com' && formData.password === 'test123') {
        console.log('Login successful:', formData);

        // Redirect to dashboard
        window.location.href = '/dashboard';

        // Alternative using Next.js router (if using Next.js):
        // import { useRouter } from 'next/navigation';
        // const router = useRouter();
        // router.push('/dashboard');

      } else {
        setError('Invalid email or password. Try: test@gmail.com / test123');
      }
    }, 2000);
  };

  // Handle forgot password click
  const handleForgotPassword = () => {
    window.location.href = '/auth/forgot-password';
  };

  // Demo credentials filler
  const fillDemoCredentials = () => {
    setFormData({
      email: 'test@gmail.com',
      password: 'test123',
      rememberMe: false
    });
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
              {/* Demo Credentials Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Demo Credentials</p>
                    <p className="text-xs text-blue-700">test@gmail.com / test123</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={fillDemoCredentials}
                    className="text-xs"
                  >
                    Use Demo
                  </Button>
                </div>
              </div>

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

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

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
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold relative overflow-hidden group"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="relative z-10">Sign In</span>
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