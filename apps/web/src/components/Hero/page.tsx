import { ArrowRight, Award, Star, Users, BookOpen, Globe, TrendingUp, CheckCircle, Play, Zap, Heart } from 'lucide-react'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function page() {
    return (
        <section
            id="home"
            className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-20 flex items-center overflow-hidden"
        >
            {/* Enhanced animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full transform animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300/10 rounded-full transform animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-400/5 rounded-full transform animate-bounce" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-green-400/30 rounded-full animate-ping"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                    {/* Enhanced header with trust badge */}
                    <div className="transition-all duration-1000 opacity-100 translate-y-0 mb-8">
                        <Badge className="bg-green-100 text-green-700 border border-green-200 px-4 py-2 mb-6 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            100% CBC Curriculum Aligned
                        </Badge>

                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <BookOpen className="h-16 w-16 text-green-600" />
                                <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75"></div>
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
                            Learn, Grow, and Excel with
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700 mt-1 sm:mt-2 font-black">
                                Tusome
                            </span>
                        </h1>
                    </div>

                    <div className="transition-all duration-1000 delay-300">
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
                            Empowering Kenyan students with world-class educational content,
                            personalized learning paths, and culturally relevant resources to achieve academic excellence.
                        </p>

                        {/* New feature highlights */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8 sm:mb-10 lg:mb-12">
                            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-green-100">
                                <Zap className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-sm text-gray-700 font-medium">Fast Loading</span>
                            </div>
                            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-green-100">
                                <Globe className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-sm text-gray-700 font-medium">All Counties</span>
                            </div>
                            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-green-100">
                                <Heart className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-sm text-gray-700 font-medium">M-Pesa Friendly</span>
                            </div>
                        </div>
                    </div>

                    <div className="transition-all duration-1000 delay-500">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
                            <Button
                                size="lg"
                                className="group bg-green-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 hover:bg-green-700 transition-all duration-300 font-semibold text-sm sm:text-base lg:text-lg flex items-center relative overflow-hidden w-full sm:w-auto shadow-lg hover:shadow-xl"
                            >
                                <span className="relative z-10">Start Learning Today</span>
                                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></div>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="group border-2 border-green-600 text-green-600 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 hover:bg-green-600 hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base lg:text-lg relative overflow-hidden w-full sm:w-auto shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm"
                            >
                                <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />
                                <span className="relative z-10">Watch Demo</span>
                                <div className="absolute inset-0 bg-green-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"></div>
                            </Button>
                        </div>
                    </div>

                    {/* Enhanced stats section with improved cards */}
                    <div className="transition-all duration-1000 delay-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
                            {[
                                {
                                    icon: Users,
                                    number: '2K+',
                                    label: 'Active Students',
                                    color: 'green',
                                    bgColor: 'bg-green-100',
                                    description: 'Across 47 counties'
                                },
                                {
                                    icon: BookOpen,
                                    number: '12',
                                    label: 'Learning Areas',
                                    color: 'blue',
                                    bgColor: 'bg-blue-100',
                                    description: 'Complete CBC coverage'
                                },
                                {
                                    icon: Award,
                                    number: '20+',
                                    label: 'Teachers Supported',
                                    color: 'purple',
                                    bgColor: 'bg-purple-100',
                                    description: 'Empowering educators'
                                },
                                {
                                    icon: TrendingUp,
                                    number: '95%',
                                    label: 'Success Rate',
                                    color: 'orange',
                                    bgColor: 'bg-orange-100',
                                    description: 'Improved performance'
                                }
                            ].map((stat, index) => (
                                <Card
                                    key={index}
                                    className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border-0 transform hover:scale-105 hover:-translate-y-2"
                                    style={{ animationDelay: `${index * 0.2}s` }}
                                >
                                    <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                                        <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                            <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                                        <p className="text-sm sm:text-base text-gray-800 font-semibold mb-1">{stat.label}</p>
                                        <p className="text-xs sm:text-sm text-gray-500">{stat.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* New testimonial preview */}
                    <div className="transition-all duration-1000 delay-900 mt-16 sm:mt-20 lg:mt-24">
                        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 max-w-2xl mx-auto">
                            <CardContent className="p-6 sm:p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <blockquote className="text-gray-700 italic mb-4 text-sm sm:text-base leading-relaxed">
                                    "Tusome helped me excel in my assessments even with slow internet in my area.
                                    The lessons load quickly and I can pay with M-Pesa!"
                                </blockquote>
                                <div className="flex items-center justify-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                        G
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900 text-sm">Grace M.</div>
                                        <div className="text-gray-500 text-xs">Grade 10 Student, Kakamega</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trust indicators */}
                    <div className="transition-all duration-1000 delay-1000 mt-12 sm:mt-16">
                        <p className="text-sm text-gray-500 mb-4">Trusted by families across Kenya</p>
                        <div className="flex justify-center items-center space-x-8 opacity-60">
                            <div className="text-xs font-medium text-gray-400">KICD APPROVED</div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="text-xs font-medium text-gray-400">CBC ALIGNED</div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="text-xs font-medium text-gray-400">M-PESA ENABLED</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>)
}

export default page