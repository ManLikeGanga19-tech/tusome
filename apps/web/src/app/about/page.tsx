import { Heart, Target, Users, Award, BookOpen, Globe, Lightbulb, Shield, Star, ArrowRight, CheckCircle, Zap, Trophy } from 'lucide-react'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function AboutUsPage() {
    // Our core values
    const values = [
        {
            icon: Heart,
            title: "Student-Centered",
            description: "Every decision we make puts Kenyan students first, ensuring accessible and relevant education for all.",
            color: "red"
        },
        {
            icon: Target,
            title: "Excellence Focused",
            description: "We maintain the highest standards in educational content, aligned with CBC curriculum requirements.",
            color: "green"
        },
        {
            icon: Globe,
            title: "Culturally Relevant",
            description: "Our content reflects Kenyan culture, values, and context while meeting international standards.",
            color: "blue"
        },
        {
            icon: Lightbulb,
            title: "Innovation Driven",
            description: "We leverage technology to create engaging, interactive learning experiences for the digital generation.",
            color: "yellow"
        }
    ];

    // Our team stats
    const teamStats = [
        {
            icon: Users,
            number: "50+",
            label: "Education Experts",
            description: "Certified teachers and curriculum specialists"
        },
        {
            icon: BookOpen,
            number: "15+",
            label: "Subject Areas",
            description: "Comprehensive CBC coverage"
        },
        {
            icon: Award,
            number: "5+",
            label: "Years Experience",
            description: "Serving Kenyan students"
        },
        {
            icon: Star,
            number: "98%",
            label: "Success Rate",
            description: "Students improving grades"
        }
    ];

    // Our milestones
    const milestones = [
        {
            year: "2019",
            title: "Foundation",
            description: "Tusome was founded with a vision to revolutionize education in Kenya through technology.",
            icon: Lightbulb,
            color: "green"
        },
        {
            year: "2020",
            title: "CBC Alignment",
            description: "Became the first platform to fully align with Kenya's Competency-Based Curriculum.",
            icon: BookOpen,
            color: "blue"
        },
        {
            year: "2021",
            title: "10,000 Students",
            description: "Reached our first major milestone of serving 10,000 Kenyan students nationwide.",
            icon: Users,
            color: "red"
        },
        {
            year: "2022",
            title: "National Recognition",
            description: "Received recognition from the Ministry of Education for educational innovation.",
            icon: Award,
            color: "yellow"
        },
        {
            year: "2023",
            title: "Mobile Excellence",
            description: "Launched our award-winning mobile app, making learning accessible anywhere.",
            icon: Zap,
            color: "green"
        },
        {
            year: "2024",
            title: "25,000+ Students",
            description: "Now proudly serving over 25,000 students across all 47 counties in Kenya.",
            icon: Trophy,
            color: "red"
        }
    ];

    // Why choose us
    const whyChooseUs = [
        "100% aligned with Kenya's CBC curriculum",
        "Content created by certified Kenyan teachers",
        "Affordable pricing for all economic backgrounds",
        "Multi-language support (English, Kiswahili)",
        "Offline learning capabilities",
        "Regular content updates and improvements",
        "24/7 student support in multiple languages",
        "Parent and teacher dashboard integration"
    ];

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 pt-20">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 transform rotate-45 animate-pulse"></div>
                <div className="absolute top-1/3 -left-40 w-60 h-60 bg-blue-200/20 transform rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-2/3 -right-20 w-96 h-96 bg-red-200/20 transform -rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-40 -left-20 w-72 h-72 bg-yellow-200/20 transform rotate-45 animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12">

                {/* Hero Section */}
                <div className="text-center mb-16 sm:mb-20">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                        Empowering Kenya's
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1 sm:mt-2">
                            Future Leaders
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl lg:max-w-4xl mx-auto leading-relaxed px-4 sm:px-0 mb-8 sm:mb-12">
                        At Tusome, we believe every Kenyan student deserves access to world-class education.
                        We're on a mission to bridge the educational gap through innovative technology and culturally relevant content.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16">
                        <Button
                            size="lg"
                            className="group bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 hover:bg-green-700 transition-all duration-300 font-semibold text-sm sm:text-base flex items-center w-full sm:w-auto"
                        >
                            Join Our Mission
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 font-semibold text-sm sm:text-base w-full sm:w-auto"
                        >
                            Our Impact Story
                        </Button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mb-16 sm:mb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {teamStats.map((stat, index) => (
                            <Card
                                key={index}
                                className="group bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:scale-105"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-4 sm:p-6 text-center">
                                    <stat.icon className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110" />
                                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 sm:mb-2">{stat.number}</h3>
                                    <p className="text-sm sm:text-base font-semibold text-gray-700 mb-1">{stat.label}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{stat.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Our Values Section */}
                <div className="mb-16 sm:mb-20">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
                            Our Core
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1">
                                Values
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                            These principles guide everything we do at Tusome, from content creation to student support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {values.map((value, index) => (
                            <Card
                                key={index}
                                className="group bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:scale-105"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardHeader className="text-center pb-3">
                                    <value.icon className={`h-10 w-10 sm:h-12 sm:w-12 text-${value.color}-600 mx-auto mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110`} />
                                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{value.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 text-center">
                                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Our Journey Timeline */}
                <div className="mb-16 sm:mb-20">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
                            Our
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1">
                                Journey
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                            From a small idea to Kenya's leading educational platform - here's how we've grown.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {milestones.map((milestone, index) => (
                            <Card
                                key={index}
                                className="group bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:scale-105 relative overflow-hidden"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 to-red-600"></div>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge className={`bg-${milestone.color}-100 text-${milestone.color}-800 font-bold`}>
                                            {milestone.year}
                                        </Badge>
                                        <milestone.icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${milestone.color}-600 transition-transform duration-300 group-hover:scale-110`} />
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{milestone.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{milestone.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="mb-16 sm:mb-20">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
                            Why Choose
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1">
                                Tusome?
                            </span>
                        </h2>
                    </div>

                    <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100">
                        <CardContent className="p-6 sm:p-8 lg:p-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {whyChooseUs.map((reason, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start group"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3 sm:mr-4 mt-0.5 transition-transform duration-300 group-hover:scale-110" />
                                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Final CTA Section */}
                <div className="text-center">
                    <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 via-white to-red-600 border-0 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-gray-800/80 to-red-600/90"></div>
                        <CardContent className="relative z-10 p-6 sm:p-8 lg:p-12 text-center text-white">
                            <Heart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-red-300" />
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                                Join the Tusome Family
                            </h3>
                            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto">
                                Be part of Kenya's educational revolution. Together, we're building a brighter future
                                for every Kenyan student, one lesson at a time.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    size="lg"
                                    className="bg-white text-green-600 hover:bg-gray-100 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                                >
                                    Start Learning Today
                                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto transition-all duration-300"
                                >
                                    Contact Our Team
                                </Button>
                            </div>
                            <p className="text-xs sm:text-sm mt-4 sm:mt-6 opacity-75">
                                Trusted by 25,000+ students • Available in all 47 counties
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

export default AboutUsPage;