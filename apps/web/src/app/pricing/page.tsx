'use client'

import { Check, ChevronRight, Crown, Star, Clock, Users } from 'lucide-react';
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"

// Define types for better TypeScript support
type BillingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface PricingTier {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    popular: boolean;
    color: string;
    savings?: string;
    icon: any;
    students: string;
    duration: string;
}

function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

    const pricingTiers: Record<BillingPeriod, PricingTier[]> = {
        daily: [
            {
                name: "Daily Primary",
                price: "KSh 25",
                period: "/day",
                description: "Perfect for Primary students (Grade 4-6) building strong CBC foundations",
                features: [
                    "Access to Grade 4-6 CBC subjects",
                    "Mathematics, English, Kiswahili, Environmental Studies",
                    "Creative Arts & Physical Education",
                    "Interactive learning activities",
                    "Basic progress tracking",
                    "Mobile app access"
                ],
                popular: false,
                color: "blue",
                icon: Users,
                students: "2,500+",
                duration: "Flexible"
            },
            {
                name: "Daily Junior",
                price: "KSh 40",
                period: "/day",
                description: "Comprehensive support for Junior Secondary students (Grade 7-9)",
                features: [
                    "Access to Grade 7-9 CBC subjects",
                    "Mathematics, English, Kiswahili, Integrated Science",
                    "Social Studies, Creative Arts, Life Skills",
                    "Career guidance introduction",
                    "Daily practice questions",
                    "Progress analytics"
                ],
                popular: true,
                color: "green",
                icon: Star,
                students: "4,200+",
                duration: "Daily Access"
            },
            {
                name: "Daily Senior",
                price: "KSh 60",
                period: "/day",
                description: "Premium support for Senior Secondary students (Grade 10-12) with KCSE focus",
                features: [
                    "Access to Grade 10-12 CBC subjects",
                    "Core: Math, English, Kiswahili, Sciences",
                    "Optional: Geography, History, Business, Computer Science",
                    "KCSE preparation materials",
                    "University entry guidance",
                    "Career pathway resources"
                ],
                popular: false,
                color: "red",
                icon: Crown,
                students: "1,800+",
                duration: "Premium"
            }
        ],
        weekly: [
            {
                name: "Weekly Primary",
                price: "KSh 150",
                period: "/week",
                description: "Weekly support for Primary students mastering CBC fundamentals",
                features: [
                    "Complete Grade 4-6 CBC curriculum",
                    "Foundational Mathematics & Languages",
                    "Environmental Studies & Science introduction",
                    "Creative Arts & Physical Education",
                    "Weekly assessments",
                    "Parent progress updates",
                    "Fun learning activities"
                ],
                popular: false,
                color: "blue",
                icon: Users,
                students: "1,900+",
                duration: "7 Days"
            },
            {
                name: "Weekly Junior",
                price: "KSh 250",
                period: "/week",
                description: "Complete Junior Secondary package for smooth CBC transition",
                features: [
                    "Full Grade 7-9 CBC curriculum access",
                    "Integrated Science & Advanced Mathematics",
                    "Social Studies & Life Skills development",
                    "Creative Arts & Technical subjects intro",
                    "Grade 9 KPSEA preparation",
                    "Senior Secondary readiness",
                    "Weekly mock tests"
                ],
                popular: true,
                color: "green",
                icon: Star,
                students: "3,100+",
                duration: "7 Days"
            },
            {
                name: "Weekly Senior",
                price: "KSh 400",
                period: "/week",
                description: "Intensive Senior Secondary support for KCSE excellence",
                features: [
                    "Complete Grade 10-12 curriculum",
                    "Subject clustering guidance",
                    "KCSE past papers & solutions",
                    "University application support",
                    "Career counseling sessions",
                    "Mock KCSE examinations",
                    "Study group access"
                ],
                popular: false,
                color: "red",
                icon: Crown,
                students: "1,400+",
                duration: "7 Days"
            }
        ],
        monthly: [
            {
                name: "Primary CBC",
                price: "KSh 499",
                period: "/month",
                description: "Complete monthly support for Grade 4-6 CBC foundation building",
                features: [
                    "Full Grade 4-6 CBC curriculum",
                    "Mathematics, English, Kiswahili mastery",
                    "Environmental Studies & Science basics",
                    "Creative Arts & Physical Education",
                    "Monthly progress assessments",
                    "Parent-teacher communication",
                    "Interactive learning games",
                    "Junior Secondary preparation"
                ],
                popular: false,
                color: "blue",
                icon: Users,
                students: "5,200+",
                duration: "30 Days"
            },
            {
                name: "Junior Secondary",
                price: "KSh 899",
                period: "/month",
                description: "Comprehensive Grade 7-9 support with seamless CBC progression",
                features: [
                    "Complete Grade 7-9 CBC curriculum",
                    "Advanced Mathematics & Integrated Science",
                    "Social Studies & Life Skills development",
                    "Creative Arts & pre-technical subjects",
                    "Grade 9 KPSEA preparation",
                    "Senior Secondary pathway guidance",
                    "Monthly competency assessments",
                    "Career exploration activities"
                ],
                popular: true,
                color: "green",
                icon: Star,
                students: "8,900+",
                duration: "30 Days"
            },
            {
                name: "Senior Secondary",
                price: "KSh 1,499",
                period: "/month",
                description: "Premium Grade 10-12 package targeting KCSE success and university entry",
                features: [
                    "Complete Senior Secondary CBC curriculum",
                    "All core & optional subjects",
                    "Subject clustering & stream selection",
                    "KCSE preparation & practice tests",
                    "University application guidance",
                    "Career aptitude & development",
                    "Personal academic advisor",
                    "Scholarship opportunity alerts"
                ],
                popular: false,
                color: "red",
                icon: Crown,
                students: "3,700+",
                duration: "30 Days"
            }
        ],
        yearly: [
            {
                name: "Primary Journey",
                price: "KSh 4,999",
                period: "/year",
                description: "Complete 3-year Primary CBC journey (Grade 4-6) with Junior Secondary prep",
                features: [
                    "Complete Grade 4-6 CBC program",
                    "Foundation building in all subjects",
                    "Save KSh 1,989 annually",
                    "Continuous assessment & tracking",
                    "Junior Secondary preparation",
                    "Holiday learning programs",
                    "Family learning dashboard",
                    "Grade 6 assessment readiness"
                ],
                popular: false,
                color: "blue",
                savings: "Save KSh 1,989",
                icon: Users,
                students: "2,100+",
                duration: "365 Days"
            },
            {
                name: "CBC Complete",
                price: "KSh 14,999",
                period: "/year",
                description: "Ultimate 9-year CBC journey (Grade 4-12) with guaranteed academic success",
                features: [
                    "Complete Grade 4-12 CBC curriculum",
                    "Primary to Senior Secondary progression",
                    "Save KSh 3,489 annually",
                    "All national exam preparations",
                    "University & career guidance",
                    "Continuous competency tracking",
                    "Family & alumni network access",
                    "Post-KCSE transition support",
                    "Lifetime learning resources"
                ],
                popular: true,
                color: "green",
                savings: "Save KSh 3,489",
                icon: Crown,
                students: "1,200+",
                duration: "365 Days"
            }
        ]
    };

    const periods: { id: BillingPeriod; name: string }[] = [
        { id: 'daily', name: 'Daily' },
        { id: 'weekly', name: 'Weekly' },
        { id: 'monthly', name: 'Monthly' },
        { id: 'yearly', name: 'Yearly' }
    ];

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 pt-20">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 transform rotate-45 animate-pulse"></div>
                <div className="absolute top-1/2 -left-40 w-60 h-60 bg-blue-200/20 transform rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-red-200/20 transform -rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                        Choose Your
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1 sm:mt-2">
                            Learning Plan
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl lg:max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
                        Affordable pricing designed specifically for Kenyan students following the CBC curriculum.
                        Start your academic excellence journey today.
                    </p>
                </div>

                {/* Billing Period Selector */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
                    {periods.map((period) => (
                        <Button
                            key={period.id}
                            variant={billingPeriod === period.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBillingPeriod(period.id)}
                            className={`transition-all duration-300 text-xs sm:text-sm ${billingPeriod === period.id
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'border-green-200 text-green-700 hover:bg-green-50'
                                }`}
                        >
                            {period.name}
                        </Button>
                    ))}
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
                    {pricingTiers[billingPeriod].map((tier, index) => (
                        <Card
                            key={tier.name}
                            className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl transform hover:scale-105 ${tier.popular
                                    ? 'border-2 border-green-500 bg-gradient-to-br from-green-50/50 to-white scale-105 shadow-lg'
                                    : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300'
                                }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-2 sm:py-3 text-xs sm:text-sm font-bold tracking-wide">
                                    <Crown className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    MOST POPULAR
                                </div>
                            )}

                            {tier.savings && (
                                <div className="absolute top-2 right-2 z-10">
                                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs">
                                        {tier.savings}
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className={`${tier.popular ? 'pt-12 sm:pt-16' : 'pt-4 sm:pt-6'}`}>
                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                    <tier.icon className={`h-8 w-8 sm:h-10 sm:w-10 text-${tier.color}-600 transition-transform duration-300 group-hover:scale-110`} />
                                    <Badge className={`text-xs ${tier.color === 'green' ? 'bg-green-100 text-green-800' :
                                            tier.color === 'red' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {tier.popular ? 'Popular' : 'Available'}
                                    </Badge>
                                </div>

                                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                    {tier.name}
                                </CardTitle>

                                <div className="mb-3 sm:mb-4">
                                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">{tier.price}</span>
                                    <span className="text-sm sm:text-base text-gray-600 ml-1">{tier.period}</span>
                                </div>

                                <CardDescription className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                                    {tier.description}
                                </CardDescription>

                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        {tier.students}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        {tier.duration}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start">
                                            <Badge
                                                className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex items-center justify-center rounded-full bg-green-600 text-white p-0"
                                            >
                                                <Check className="h-2 w-2 sm:h-3 sm:w-3" />
                                            </Badge>
                                            <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full text-xs sm:text-sm py-3 sm:py-4 font-semibold transition-all duration-300 group ${tier.popular
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                                        }`}
                                >
                                    <span className="flex items-center justify-center">
                                        Get Started
                                        <ChevronRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                </Button>
                            </CardContent>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </Card>
                    ))}
                </div>

                {/* Bottom CTA Section */}
                <div className="text-center">
                    <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 via-white to-red-600 border-0 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-gray-800/80 to-red-600/90"></div>
                        <CardContent className="relative z-10 p-6 sm:p-8 lg:p-12 text-center text-white">
                            <Star className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-yellow-300" />
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                                Start Your Free Trial Today
                            </h3>
                            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                                All plans include a 7-day free trial. No credit card required.
                                CBC curriculum aligned with special rates for schools and institutions.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    size="lg"
                                    className="bg-white text-green-600 hover:bg-gray-100 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                                >
                                    Start Free Trial
                                    <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto transition-all duration-300"
                                >
                                    Contact Sales
                                </Button>
                            </div>
                            <p className="text-xs sm:text-sm mt-4 sm:mt-6 opacity-75">
                                Prices in Kenyan Shillings (KSh) • Special discounts for schools and bursary holders
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

export default PricingPage;