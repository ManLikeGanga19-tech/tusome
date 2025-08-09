import { ArrowRight, Award, Star, Users } from 'lucide-react'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function page() {
    return (
        <section
            id="home"
            className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 pt-20 flex items-center overflow-hidden"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 transform rotate-45 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200/30 transform rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                    <div className="transition-all duration-1000 opacity-100 translate-y-0">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
                            Learn, Grow, and Excel with
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1 sm:mt-2">
                                Tusome
                            </span>
                        </h1>
                    </div>

                    <div className="transition-all duration-1000 delay-300">
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
                            Empowering Kenyan students with world-class educational content,
                            personalized learning paths, and culturally relevant resources to achieve academic excellence.
                        </p>
                    </div>

                    <div className="transition-all duration-1000 delay-500">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
                            <Button
                                size="lg"
                                className="group bg-green-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 hover:bg-green-700 transition-all duration-300 font-semibold text-sm sm:text-base lg:text-lg flex items-center relative overflow-hidden w-full sm:w-auto"
                            >
                                <span className="relative z-10">Start Learning Today</span>
                                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></div>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="group border-2 border-red-600 text-red-600 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base lg:text-lg relative overflow-hidden w-full sm:w-auto"
                            >
                                <span className="relative z-10">Watch Demo</span>
                                <div className="absolute inset-0 bg-red-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"></div>
                            </Button>
                        </div>
                    </div>

                    {/* Enhanced stats section with shadcn/ui cards */}
                    <div className="transition-all duration-1000 delay-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
                            {[
                                { icon: Users, number: '100+', label: 'Active Students', color: 'green' },
                                { icon: Award, number: '8+', label: 'Course Modules', color: 'red' },
                                { icon: Star, number: '4.9/5', label: 'Student Rating', color: 'yellow' }
                            ].map((stat, index) => (
                                <Card
                                    key={index}
                                    className="group bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:scale-105 sm:col-span-1 last:col-span-1 sm:last:col-span-2 lg:last:col-span-1"
                                    style={{ animationDelay: `${index * 0.2}s` }}
                                >
                                    <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                                        <stat.icon className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-14 lg:w-14 text-${stat.color}-600 mx-auto mb-3 sm:mb-4 lg:mb-6 transition-transform duration-300 group-hover:scale-110`} />
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-1 sm:mb-2 lg:mb-3">{stat.number}</h3>
                                        <p className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>)
}

export default page