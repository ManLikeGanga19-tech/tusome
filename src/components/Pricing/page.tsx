'use client'

import { Check, ChevronRight } from 'lucide-react';
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'
import { Badge } from "@/components/ui/badge"
//our flag color 
const kenyanGreen = '#006600'
const kenyanRed = '#BB0000'
const kenyanBlack = '#000000'
const kenyanWhite = '#FFFFFF'

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
}

function page() {
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
                color: "border-gray-200 hover:border-gray-300"
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
                color: "border-blue-500 ring-2 ring-blue-200"
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
                color: "border-green-500 ring-2 ring-green-200"
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
                color: "border-gray-200 hover:border-gray-300"
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
                color: "border-blue-500 ring-2 ring-blue-200"
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
                color: "border-green-500 ring-2 ring-green-200"
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
                color: "border-gray-200 hover:border-gray-300"
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
                color: "border-blue-500 ring-2 ring-blue-200"
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
                color: "border-green-500 ring-2 ring-green-200"
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
                color: "border-gray-200 hover:border-gray-300"
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
                color: "border-purple-500 ring-2 ring-purple-200"
            }
        ]
    };

    const periods: BillingPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];

    return (
        <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23BB0000' fill-opacity='1'%3E%3Cpath d='M50 10L60 50L50 90L40 50Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 transition-all duration-1000">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 text-black">
                        Choose Your Learning Plan
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
                        Affordable pricing designed specifically for Kenyan Junior Secondary (Grade 7-9) and Senior Secondary (Grade 10-12) students following the CBC curriculum.
                    </p>

                    <div className="flex justify-center mb-12 transition-all duration-1000 delay-300">
                        <Menubar>
                            {periods.map((period) => (
                                <MenubarMenu key={period}>
                                    <MenubarTrigger
                                        onClick={() => setBillingPeriod(period)}
                                        className={`px-6 py-2 font-semibold capitalize transition-colors duration-300
                                            ${billingPeriod === period
                                                ? 'bg-[#006600] text-white'
                                                : 'bg-white text-black hover:bg-gray-200'}`}
                                    >
                                        {period}
                                    </MenubarTrigger>

                                </MenubarMenu>
                            ))}
                        </Menubar>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto transition-all duration-1000 delay-500">
                    {pricingTiers[billingPeriod].map((tier, index) => (
                        <Card
                            key={index}
                            className={`shadow-xl overflow-hidden relative border-2 transition-all duration-500 hover:shadow-2xl group ${tier.color} ${tier.popular ? 'transform scale-105 lg:scale-110' : 'hover:scale-105'}`}
                        >
                            {tier.popular && (
                                <div
                                    className="absolute top-0 left-0 right-0 text-white text-center py-3 text-sm font-bold tracking-wide"
                                    style={{ backgroundColor: kenyanGreen }}
                                >
                                    MOST POPULAR
                                </div>
                            )}

                            <CardHeader className={`${tier.popular ? 'pt-16 lg:pt-20' : ''} text-center`}>
                                <CardTitle className="text-2xl lg:text-3xl font-black text-black">{tier.name}</CardTitle>
                                <CardDescription className="mb-6 text-gray-700">{tier.description}</CardDescription>
                                <div className="mb-8">
                                    <span className="text-4xl lg:text-5xl font-black text-black">{tier.price}</span>
                                    <span className="text-gray-600 text-lg">{tier.period}</span>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <ul className="space-y-4 mb-10">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start group">
                                            <Badge
                                                variant="secondary"
                                                className={`flex-shrink-0 w-6 h-6 mr-4 mt-1 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 bg-[#006600] text-white p-0`}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Badge>
                                            <span className="text-gray-800">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full py-4 px-8 font-bold transition-all duration-300 relative overflow-hidden group"
                                    style={{
                                        backgroundColor: tier.popular ? kenyanGreen : kenyanWhite,
                                        color: tier.popular ? kenyanWhite : kenyanGreen,
                                        border: `2px solid ${kenyanGreen}`
                                    }}
                                >
                                    <span className="flex items-center justify-center">
                                        Get Started
                                        <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center mt-16 transition-all duration-1000 delay-700">
                    <Card className="p-8 shadow-lg border max-w-2xl mx-auto">
                        <p className="mb-4 text-lg text-gray-700">
                            All plans include a 7-day free trial. No credit card required. CBC curriculum aligned.
                        </p>
                        <p className="text-sm text-gray-500">
                            Prices are in Kenyan Shillings (KSh). Special rates for schools, KNEC registered institutions, and bursary holders.
                        </p>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default page