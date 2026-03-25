'use client'

import { BookOpen, Star, Users, GraduationCap, Heart, Quote, MapPin, Calendar, TrendingUp, Award, ChevronLeft, ChevronRight, Menu, ChevronDown } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function SuccessStoriesPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

    const categories = [
        { id: 'all', label: 'All Stories', icon: Users },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'teachers', label: 'Teachers', icon: BookOpen },
        { id: 'parents', label: 'Parents', icon: Heart }
    ];

    const successStories = [
        {
            id: 1,
            category: 'students',
            name: 'Faith Wanjiku',
            role: 'Form 4 Student',
            location: 'Nyeri County',
            image: '/api/placeholder/120/120',
            achievement: 'KCSE Grade A- (2023)',
            story: "I come from a single-parent family and my mother is a small-scale farmer. When schools closed during COVID, I was worried about falling behind. Tusome became my lifeline. The CBC-aligned content helped me understand Mathematics and Sciences better. The lessons are in simple English and some concepts are explained in Kiswahili, which really helped. I scored an A- in my KCSE and got admission to study Engineering at University of Nairobi. My village is so proud!",
            impact: "Improved from C+ to A- grade",
            quote: "Tusome made university education possible for a girl from a humble background like mine.",
            date: "March 2024",
            badge: "Top Performer"
        },
        {
            id: 2,
            category: 'teachers',
            name: 'Samuel Kiprotich',
            role: 'Mathematics Teacher',
            location: 'Uasin Gishu County',
            image: '/api/placeholder/120/120',
            achievement: 'School Performance Improved by 40%',
            story: "I teach at a rural secondary school where resources are limited. Many of my students struggled with Mathematics because I didn't have enough textbooks or teaching aids. When I discovered Tusome, everything changed. The platform has interactive lessons that I can project using my phone and the school's small projector. The step-by-step explanations help me teach complex topics more effectively. My students now look forward to Math lessons!",
            impact: "Student pass rate increased from 45% to 85%",
            quote: "Tusome has made me a better teacher and given my students hope for their future.",
            date: "January 2024",
            badge: "Educator Excellence"
        },
        {
            id: 3,
            category: 'parents',
            name: 'Mary Achieng',
            role: 'Mother of 3',
            location: 'Kisumu County',
            image: '/api/placeholder/120/120',
            achievement: 'Supporting Children\'s Education',
            story: "As a fish vendor in the market, I never went beyond primary school. When the new CBC curriculum came, I felt helpless because I couldn't help my children with homework. My neighbor told me about Tusome. Now I use my smartphone to learn alongside my children. The Parent Support section explains how to help kids with different subjects. My Grade 6 son's performance has improved so much, and I feel confident helping him study.",
            impact: "All 3 children improved their grades",
            quote: "Tusome taught me that learning never stops. Now I can support my children's dreams.",
            date: "February 2024",
            badge: "Parent Champion"
        },
        {
            id: 4,
            category: 'students',
            name: 'John Mwangi',
            role: 'Grade 8 Student',
            location: 'Machakos County',
            image: '/api/placeholder/120/120',
            achievement: 'CBC Junior Secondary Top Student',
            story: "My school doesn't have a computer lab or science laboratory. Through Tusome, I've been able to see virtual science experiments and learn computer skills. The Integrated Science lessons with videos made me understand photosynthesis and chemical reactions. I'm now the top student in my class and I dream of becoming a doctor. The platform works well on my father's old smartphone, and we only need to buy a small data bundle each week.",
            impact: "Moved from position 15 to position 1 in class",
            quote: "Tusome showed me that rural students can compete with anyone if given the right tools.",
            date: "April 2024",
            badge: "Academic Star"
        },
        {
            id: 5,
            category: 'teachers',
            name: 'Grace Nyambura',
            role: 'English Teacher',
            location: 'Murang\'a County',
            image: '/api/placeholder/120/120',
            achievement: 'Improved Student Writing Skills',
            story: "Teaching creative writing to students who primarily speak Kikuyu at home was challenging. Tusome's English lessons include creative writing prompts that relate to our local culture - stories about farmers, markets, and community life. My students now write beautiful compositions about their experiences. Three of my students won county-level writing competitions this year. The platform helped me connect English lessons to their daily lives.",
            impact: "90% of students now pass English composition",
            quote: "Tusome helped me bridge the gap between mother tongue and English in a natural way.",
            date: "May 2024",
            badge: "Language Leader"
        },
        {
            id: 6,
            category: 'parents',
            name: 'Peter Ochieng',
            role: 'Boda Boda Operator & Father',
            location: 'Siaya County',
            image: '/api/placeholder/120/120',
            achievement: 'Family Education Success',
            story: "I drive a motorcycle taxi and my wife sells vegetables. We were worried we couldn't afford quality education for our children. Tusome's affordable monthly subscription costs less than what we spend on tea in a week. Our daughter is in Form 2 and our son is in Grade 7. Both are excelling because they can access the same quality content as children in Nairobi private schools. We pay using M-Pesa, which is very convenient.",
            impact: "Saved over 80% on education costs",
            quote: "Education is the only inheritance we can give our children. Tusome makes it affordable.",
            date: "March 2024",
            badge: "Community Hero"
        }
    ];

    const stats = [
        { number: '2000+', label: 'Students Impacted', icon: GraduationCap },
        { number: '28+', label: 'Teachers Supported', icon: BookOpen },
        { number: '380+', label: 'Families Helped', icon: Heart },
        { number: '15', label: 'Counties Reached', icon: MapPin }
    ];

    const filteredStories = activeCategory === 'all'
        ? successStories
        : successStories.filter(story => story.category === activeCategory);

    const featuredStory = filteredStories[currentStoryIndex];

    const nextStory = () => {
        setCurrentStoryIndex((prev) => (prev + 1) % filteredStories.length);
    };

    const prevStory = () => {
        setCurrentStoryIndex((prev) => (prev - 1 + filteredStories.length) % filteredStories.length);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <BookOpen className="h-16 w-16 text-green-600" />
                            <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75"></div>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Stories of <span className="text-green-600">Transformation</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                        Real stories from Kenyan students, teachers, and parents whose lives have been changed through accessible, quality education with Tusome.
                    </p>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="flex justify-center mb-2">
                                    <stat.icon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="text-3xl font-bold text-green-600 mb-1">{stat.number}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <section className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Desktop Category Buttons */}
                    <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    setCurrentStoryIndex(0);
                                }}
                                variant={activeCategory === category.id ? "default" : "outline"}
                                className={`px-6 py-3 font-medium transition-all duration-300 ${activeCategory === category.id
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                    }`}
                            >
                                <category.icon className="h-4 w-4 mr-2" />
                                {category.label}
                            </Button>
                        ))}
                    </div>

                    {/* Mobile Category Select */}
                    <div className="md:hidden mb-12">
                        <Select
                            value={activeCategory}
                            onValueChange={(value) => {
                                setActiveCategory(value);
                                setCurrentStoryIndex(0);
                            }}
                        >
                            <SelectTrigger className="w-full border-green-200 text-green-600 hover:bg-green-50">
                                <SelectValue>
                                    <div className="flex items-center">
                                        {(() => {
                                            const activeCategory_ = categories.find(cat => cat.id === activeCategory);
                                            if (activeCategory_) {
                                                const IconComponent = activeCategory_.icon;
                                                return <IconComponent className="h-4 w-4 mr-2" />;
                                            }
                                            return null;
                                        })()}
                                        {categories.find(cat => cat.id === activeCategory)?.label}
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center">
                                            <category.icon className="h-4 w-4 mr-2" />
                                            {category.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* Featured Story */}
            {featuredStory && (
                <section className="py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                            <div className="grid lg:grid-cols-2 gap-0">
                                {/* Story Content */}
                                <CardContent className="p-8 lg:p-12">
                                    <div className="flex items-center justify-between mb-6">
                                        <Badge className="bg-green-100 text-green-800 font-semibold">
                                            {featuredStory.badge}
                                        </Badge>
                                        <div className="flex items-center text-gray-500">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {featuredStory.date}
                                        </div>
                                    </div>

                                    <div className="flex items-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                                            {featuredStory.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{featuredStory.name}</h3>
                                            <p className="text-green-600 font-medium">{featuredStory.role}</p>
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {featuredStory.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center mb-2">
                                            <Award className="h-5 w-5 text-green-600 mr-2" />
                                            <span className="font-semibold text-gray-900">Achievement:</span>
                                        </div>
                                        <p className="text-green-600 font-medium">{featuredStory.achievement}</p>
                                    </div>

                                    <div className="mb-6">
                                        <Quote className="h-6 w-6 text-green-600 mb-3" />
                                        <blockquote className="text-lg italic text-gray-700 mb-4">
                                            "{featuredStory.quote}"
                                        </blockquote>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">Impact: {featuredStory.impact}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={prevStory}
                                                size="sm"
                                                variant="outline"
                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={nextStory}
                                                size="sm"
                                                variant="outline"
                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Story Details */}
                                <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 lg:p-12 text-white">
                                    <h4 className="text-2xl font-bold mb-6">Full Story</h4>
                                    <p className="text-green-50 leading-relaxed text-lg">
                                        {featuredStory.story}
                                    </p>

                                    <div className="mt-8 pt-6 border-t border-green-500">
                                        <div className="flex items-center justify-between">
                                            <span className="text-green-100">Story {currentStoryIndex + 1} of {filteredStories.length}</span>
                                            <div className="flex space-x-1">
                                                {filteredStories.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStoryIndex ? 'bg-white' : 'bg-green-400'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>
            )}

            {/* Story Grid */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        More Success Stories
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredStories.filter((_, index) => index !== currentStoryIndex).map((story) => (
                            <Card key={story.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white/90 backdrop-blur-sm group cursor-pointer">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                            {story.badge}
                                        </Badge>
                                        <div className="text-xs text-gray-500">{story.date}</div>
                                    </div>

                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                            {story.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                                {story.name}
                                            </CardTitle>
                                            <CardDescription className="text-green-600 font-medium">
                                                {story.role}
                                            </CardDescription>
                                            <div className="flex items-center text-gray-500 text-xs">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {story.location}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="mb-4">
                                        <div className="flex items-center mb-2">
                                            <Award className="h-4 w-4 text-green-600 mr-2" />
                                            <span className="text-sm font-semibold text-gray-900">Achievement</span>
                                        </div>
                                        <p className="text-sm text-green-600 font-medium">{story.achievement}</p>
                                    </div>

                                    <blockquote className="text-sm italic text-gray-600 mb-4 line-clamp-3">
                                        "{story.quote}"
                                    </blockquote>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            <span>{story.impact}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-green-600 hover:text-green-700 p-0 h-auto font-medium"
                                            onClick={() => setCurrentStoryIndex(filteredStories.findIndex(s => s.id === story.id))}
                                        >
                                            Read Full Story →
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Write Your Own Success Story?
                    </h2>
                    <p className="text-xl text-green-100 mb-8 leading-relaxed">
                        Join thousands of Kenyan students, teachers, and families who are transforming their educational journey with Tusome.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-green-600 px-8 py-4 hover:bg-gray-100 transition-colors font-semibold"
                        >
                            Start Learning Today
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-green-400 px-8 py-4 hover:bg-white hover:text-green-600 transition-colors font-semibold"
                        >
                            Share Your Story
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default SuccessStoriesPage;