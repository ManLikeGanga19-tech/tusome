'use client'

import React from 'react'
import { Check, Globe, Clock, BookOpen, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

function page() {
    return (
        <section id="about" className="py-24 bg-background relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Title */}
                <div className="text-center mb-20 transition-all duration-1000">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        About Tusome
                    </h2>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        Tusome (Swahili for "Let's Learn") is Kenya's premier educational platform,
                        designed specifically for Kenyan students following the CBC curricula.
                    </p>
                </div>

                {/* Mission & Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                    {/* Left side */}
                    <div className="transition-all duration-1000 delay-300">
                        <h3 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                            We believe every Kenyan student deserves access to quality education that celebrates
                            our rich culture while preparing them for global success. Tusome bridges the gap
                            between traditional learning and modern educational technology.
                        </p>
                        <div className="space-y-4">
                            {[
                                'Curriculum-aligned content for all educational levels',
                                'Interactive lessons in English and Kiswahili',
                                'Culturally relevant examples and case studies',
                                'Progress tracking and personalized learning paths',
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start group"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Badge
                                        variant="default"
                                        className="mr-4 mt-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4 text-white" />
                                    </Badge>
                                    <span className="text-foreground text-lg leading-relaxed">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="transition-all duration-1000 delay-500">
                        <Card className="bg-gradient-to-br from-green-50 via-background to-red-50 shadow-xl border">
                            <CardContent className="p-8">
                                <div className="grid grid-cols-2 gap-8">
                                    {[
                                        { icon: Globe, title: 'All Counties', desc: 'Serving students across Kenya', color: 'text-green-600' },
                                        { icon: Clock, title: '24/7 Access', desc: 'Learn at your own pace', color: 'text-red-600' },
                                        { icon: BookOpen, title: 'Expert Content', desc: 'Created by Kenyan educators', color: 'text-yellow-600' },
                                        { icon: Trophy, title: 'Proven Results', desc: 'Improved academic performance', color: 'text-blue-600' },
                                    ].map((item, index) => (
                                        <Card
                                            key={index}
                                            className="text-center group hover:bg-background transition-all duration-300 hover:shadow-lg p-6"
                                        >
                                            <item.icon
                                                className={`h-12 w-12 ${item.color} mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`}
                                            />
                                            <h4 className="font-bold mb-2 text-lg">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default page
