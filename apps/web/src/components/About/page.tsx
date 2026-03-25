'use client'

import React from 'react'
import { Check, Globe, Clock, BookOpen, Trophy, Users, Heart, Star, Target, Award, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

function page() {
    return (
        <section id="about" className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
            {/* Enhanced Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.6'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Enhanced Header Section */}
                <div className="text-center pt-20 pb-24 transition-all duration-1000">
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <BookOpen className="h-16 w-16 text-green-600" />
                            <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75"></div>
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-gray-900 leading-tight">
                        About <span className="text-green-600">Tusome</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
                        Tusome (Swahili for "Let's Learn") is Kenya's premier educational platform,
                        designed specifically for Kenyan students following the CBC curriculum.
                    </p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">25K+</div>
                            <div className="text-sm text-gray-600">Active Students</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">47</div>
                            <div className="text-sm text-gray-600">Counties Served</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">2,800+</div>
                            <div className="text-sm text-gray-600">Teachers Supported</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Mission & Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
                    {/* Left side - Enhanced */}
                    <div className="transition-all duration-1000 delay-300">
                        <div className="flex items-center mb-6">
                            <Target className="h-8 w-8 text-green-600 mr-3" />
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Our Mission</h3>
                        </div>
                        <p className="text-gray-600 mb-10 leading-relaxed text-lg">
                            We believe every Kenyan student deserves access to quality education that celebrates
                            our rich culture while preparing them for global success. Tusome bridges the gap
                            between traditional learning and modern educational technology.
                        </p>
                        <div className="space-y-6">
                            {[
                                {
                                    icon: BookOpen,
                                    text: 'CBC-aligned content for all educational levels',
                                    desc: 'Fully compliant with KICD curriculum standards'
                                },
                                {
                                    icon: Globe,
                                    text: 'Interactive lessons in English and Kiswahili',
                                    desc: 'Bilingual support for better understanding'
                                },
                                {
                                    icon: Heart,
                                    text: 'Culturally relevant examples and case studies',
                                    desc: 'Learning with Kenyan context and values'
                                },
                                {
                                    icon: Trophy,
                                    text: 'Progress tracking and competency development',
                                    desc: 'Personalized learning paths for every student'
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start group p-4 rounded-xl hover:bg-green-50/50 transition-all duration-300"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex-shrink-0 mr-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
                                            <feature.icon className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-gray-900 text-lg font-semibold leading-relaxed block mb-1">
                                            {feature.text}
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            {feature.desc}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Enhanced */}
                    <div className="transition-all duration-1000 delay-500">
                        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="text-center mb-8">
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Tusome?</h4>
                                    <p className="text-gray-600">Empowering Kenyan students with world-class education</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        {
                                            icon: Globe,
                                            title: 'All Counties',
                                            desc: 'Serving students across Kenya',
                                            color: 'text-green-600',
                                            bgColor: 'bg-green-100'
                                        },
                                        {
                                            icon: Clock,
                                            title: '24/7 Access',
                                            desc: 'Learn at your own pace',
                                            color: 'text-blue-600',
                                            bgColor: 'bg-blue-100'
                                        },
                                        {
                                            icon: Users,
                                            title: 'Expert Educators',
                                            desc: 'Created by Kenyan teachers',
                                            color: 'text-purple-600',
                                            bgColor: 'bg-purple-100'
                                        },
                                        {
                                            icon: Award,
                                            title: 'Proven Results',
                                            desc: 'Improved performance',
                                            color: 'text-orange-600',
                                            bgColor: 'bg-orange-100'
                                        },
                                    ].map((item, index) => (
                                        <Card
                                            key={index}
                                            className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-gray-50/50 hover:bg-white p-6"
                                        >
                                            <div className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`}>
                                                <item.icon
                                                    className={`h-8 w-8 ${item.color}`}
                                                />
                                            </div>
                                            <h4 className="font-bold mb-2 text-lg text-gray-900">{item.title}</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* New Values Section */}
                <div className="py-20">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h3>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            These principles guide everything we do at Tusome, ensuring quality education for every Kenyan student.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Heart,
                                title: "Ubuntu - Togetherness",
                                description: "We believe in the power of community learning and supporting each other's growth.",
                                color: "text-red-600",
                                bgColor: "bg-red-100"
                            },
                            {
                                icon: Star,
                                title: "Excellence - Ubora",
                                description: "We strive for the highest quality in everything we create and deliver.",
                                color: "text-yellow-600",
                                bgColor: "bg-yellow-100"
                            },
                            {
                                icon: Zap,
                                title: "Innovation - Uvumbuzi",
                                description: "We embrace new ideas and technologies to enhance the learning experience.",
                                color: "text-blue-600",
                                bgColor: "bg-blue-100"
                            }
                        ].map((value, index) => (
                            <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                                <CardContent className="p-8">
                                    <div className={`w-20 h-20 ${value.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110`}>
                                        <value.icon className={`h-10 w-10 ${value.color}`} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h4>
                                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Enhanced Call to Action */}
                <div className="py-20">
                    <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0 shadow-2xl overflow-hidden">
                        <CardContent className="p-12 text-center text-white">
                            <h3 className="text-3xl md:text-4xl font-bold mb-6">
                                Join the Tusome Community Today
                            </h3>
                            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                                Be part of Kenya's educational revolution. Start your learning journey with thousands of students across the country.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                                    Start Learning Now
                                </button>
                                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-green-600 transition-colors duration-300">
                                    Learn More About CBC
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default page