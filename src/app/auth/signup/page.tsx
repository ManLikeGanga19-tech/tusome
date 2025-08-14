'use client'

import { BookOpen, Eye, EyeOff, Mail, User, Lock, ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Grade options mapped to your pricing structure
const gradeOptions = [
  {
    value: "grade-4",
    label: "Grade 4",
    category: "primary",
    tier: "Primary CBC"
  },
  {
    value: "grade-5", 
    label: "Grade 5",
    category: "primary",
    tier: "Primary CBC"
  },
  {
    value: "grade-6",
    label: "Grade 6", 
    category: "primary",
    tier: "Primary CBC"
  },
  {
    value: "grade-7",
    label: "Grade 7",
    category: "junior",
    tier: "Junior Secondary"
  },
  {
    value: "grade-8",
    label: "Grade 8",
    category: "junior", 
    tier: "Junior Secondary"
  },
  {
    value: "grade-9",
    label: "Grade 9",
    category: "junior",
    tier: "Junior Secondary"
  },
  {
    value: "grade-10",
    label: "Grade 10",
    category: "senior",
    tier: "Senior Secondary"
  },
  {
    value: "grade-11",
    label: "Grade 11",
    category: "senior",
    tier: "Senior Secondary"
  },
  {
    value: "grade-12",
    label: "Grade 12",
    category: "senior",
    tier: "Senior Secondary"
  }
];

// Pricing info for selected grade
const getPricingInfo = (gradeValue: string) => {
  const grade = gradeOptions.find(g => g.value === gradeValue);
  if (!grade) return null;

  const pricingMap = {
    primary: { 
      monthly: "KSh 499/month", 
      subjects: "Mathematics, English, Kiswahili, Environmental Studies",
      color: "blue"
    },
    junior: { 
      monthly: "KSh 899/month", 
      subjects: "Mathematics, English, Kiswahili, Integrated Science, Social Studies",
      color: "green"
    },
    senior: { 
      monthly: "KSh 1,499/month", 
      subjects: "Core & Optional subjects, KCSE preparation",
      color: "red"
    }
  };

  return {
    ...pricingMap[grade.category as keyof typeof pricingMap],
    tier: grade.tier
  };
};

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    grade: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get the selected grade info for backend
    const selectedGrade = gradeOptions.find(g => g.value === formData.grade);
    const registrationData = {
      ...formData,
      gradeLevel: selectedGrade?.value,
      gradeTier: selectedGrade?.tier,
      gradeCategory: selectedGrade?.category
    };

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Registration data:', registrationData);
    }, 2000);
  };

  const selectedPricing = formData.grade ? getPricingInfo(formData.grade) : null;

  const benefits = [
    "Low data usage - optimized for slow internet connections",
    "CBC curriculum aligned content in English & Kiswahili", 
    "Affordable pricing with M-Pesa payment options",
    "Works on any device - smartphones, tablets, or computers"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          {/* Logo */}
          <div className="flex items-center group">
            <div className="relative">
              <BookOpen className="h-12 w-12 text-green-600 transition-transform duration-300" />
              <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75"></div>
            </div>
            <span className="ml-3 text-3xl font-bold text-gray-900 tracking-tight">Tusome</span>
          </div>

          {/* Welcome Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Start Your Learning Journey Today
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Join thousands of Kenyan students who are excelling in their studies with locally relevant, CBC-aligned content optimized for Kenya's internet conditions.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Decorative element */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/10 blur-3xl"></div>
            <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-green-100">
              <p className="text-sm text-gray-600 italic">
                "Tusome helped me excel in my KCSE exams even with slow internet in my area. The lessons load quickly and I can pay with M-Pesa!"
              </p>
              <p className="text-sm font-semibold text-green-600 mt-2">- Grace M., Form 4 Student, Kakamega</p>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
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

              <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your details to get started with Tusome
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>

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
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Grade Selection */}
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
                    Current Grade Level
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                      <SelectTrigger className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Select your current grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Primary Section */}
                        <div className="px-2 py-1">
                          <div className="text-xs font-semibold text-blue-600 mb-1">PRIMARY (GRADE 4-6)</div>
                          {gradeOptions.filter(g => g.category === 'primary').map(grade => (
                            <SelectItem key={grade.value} value={grade.value} className="pl-4">
                              {grade.label}
                            </SelectItem>
                          ))}
                        </div>

                        {/* Junior Section */}
                        <div className="px-2 py-1">
                          <div className="text-xs font-semibold text-green-600 mb-1">JUNIOR SECONDARY (GRADE 7-9)</div>
                          {gradeOptions.filter(g => g.category === 'junior').map(grade => (
                            <SelectItem key={grade.value} value={grade.value} className="pl-4">
                              {grade.label}
                            </SelectItem>
                          ))}
                        </div>

                        {/* Senior Section */}
                        <div className="px-2 py-1">
                          <div className="text-xs font-semibold text-red-600 mb-1">SENIOR SECONDARY (GRADE 10-12)</div>
                          {gradeOptions.filter(g => g.category === 'senior').map(grade => (
                            <SelectItem key={grade.value} value={grade.value} className="pl-4">
                              {grade.label}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing Preview */}
                {selectedPricing && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{selectedPricing.tier}</h4>
                      <Badge className={`text-xs ${
                        selectedPricing.color === 'green' ? 'bg-green-100 text-green-800' :
                        selectedPricing.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedPricing.monthly}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{selectedPricing.subjects}</p>
                    <p className="text-xs text-green-600 mt-1 font-medium">✓ 7-day free trial included</p>
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
                      placeholder="Create a strong password"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                    className="border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-green-600 hover:text-green-700 underline">
                          Terms of Service
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Terms of Service</DialogTitle>
                          <DialogDescription>
                            Please read our terms of service carefully.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4 text-sm">
                          <h3 className="font-semibold text-base">1. Acceptance of Terms</h3>
                          <p>By accessing and using Tusome's educational platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>

                          <h3 className="font-semibold text-base">2. Service Description</h3>
                          <p>Tusome provides online educational content aligned with the Kenyan CBC curriculum, optimized for local internet conditions and accessible via M-Pesa payments.</p>

                          <h3 className="font-semibold text-base">3. User Responsibilities</h3>
                          <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>

                          <h3 className="font-semibold text-base">4. Payment Terms</h3>
                          <p>All payments are processed through M-Pesa and other approved payment methods. Subscription fees are non-refundable except as required by law.</p>

                          <h3 className="font-semibold text-base">5. Content Usage</h3>
                          <p>All educational content is protected by intellectual property rights. Users may access content for personal educational use only.</p>

                          <h3 className="font-semibold text-base">6. Limitation of Liability</h3>
                          <p>Tusome's liability is limited to the amount paid by the user for the service. We are not liable for any indirect or consequential damages.</p>

                          <h3 className="font-semibold text-base">7. Termination</h3>
                          <p>Either party may terminate the service agreement at any time. Upon termination, access to the platform will be revoked.</p>

                          <h3 className="font-semibold text-base">8. Governing Law</h3>
                          <p>These terms are governed by the laws of Kenya. Any disputes shall be resolved in Kenyan courts.</p>

                          <h3 className="font-semibold text-base">9. Changes to Terms</h3>
                          <p>Tusome reserves the right to modify these terms at any time. Users will be notified of significant changes.</p>

                          <p className="text-gray-600 text-xs mt-6">Last updated: January 2025</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {' '}and{' '}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-green-600 hover:text-green-700 underline">
                          Privacy Policy
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Privacy Policy</DialogTitle>
                          <DialogDescription>
                            Learn how we collect, use, and protect your personal information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4 text-sm">
                          <h3 className="font-semibold text-base">1. Information We Collect</h3>
                          <p>We collect personal information including name, email address, phone number for M-Pesa transactions, and educational progress data to provide our services effectively.</p>

                          <h3 className="font-semibold text-base">2. How We Use Your Information</h3>
                          <p>Your information is used to provide educational services, process payments, track learning progress, and communicate important updates about your account.</p>

                          <h3 className="font-semibold text-base">3. Data Protection</h3>
                          <p>We implement industry-standard security measures to protect your personal information. All payment data is encrypted and processed securely through approved payment gateways.</p>

                          <h3 className="font-semibold text-base">4. Information Sharing</h3>
                          <p>We do not sell, trade, or share your personal information with third parties except as necessary to provide our services (such as payment processing) or as required by law.</p>

                          <h3 className="font-semibold text-base">5. M-Pesa and Payment Data</h3>
                          <p>Payment information including M-Pesa transaction details are processed through secure, PCI-compliant payment processors. We do not store complete payment card details.</p>

                          <h3 className="font-semibold text-base">6. Educational Records</h3>
                          <p>Your learning progress, quiz scores, and educational achievements are stored to provide personalized learning experiences and track your academic progress.</p>

                          <h3 className="font-semibold text-base">7. Cookies and Tracking</h3>
                          <p>We use cookies and similar technologies to improve your experience, remember your preferences, and analyze platform usage to enhance our services.</p>

                          <h3 className="font-semibold text-base">8. Your Rights</h3>
                          <p>You have the right to access, correct, or delete your personal information. You may also opt-out of marketing communications at any time.</p>

                          <h3 className="font-semibold text-base">9. Data Retention</h3>
                          <p>We retain your information as long as your account is active or as needed to provide services. Educational records may be retained for academic continuity.</p>

                          <h3 className="font-semibold text-base">10. Contact Us</h3>
                          <p>For privacy concerns or questions, please contact us at privacy@tusome.ke or through our customer support channels.</p>

                          <p className="text-gray-600 text-xs mt-6">Last updated: January 2025</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !formData.agreeTerms || !formData.grade}
                  className="w-full bg-green-600 text-white py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold relative overflow-hidden group"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="relative z-10">Start Free Trial</span>
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
                  <span className="bg-white px-2 text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <a
                  href="/auth/signin"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
                >
                  Sign in to your account
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;