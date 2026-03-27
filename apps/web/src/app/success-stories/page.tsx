'use client'

import { BookOpen, Star, Users, GraduationCap, Heart, Quote, MapPin, Calendar, TrendingUp, Award, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react'
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface Story {
    id: string;
    student_name: string;
    role: 'student' | 'teacher' | 'parent';
    grade_level: string | null;
    location: string | null;
    story_text: string;
    achievement: string | null;
    impact: string | null;
    is_featured: boolean;
    created_at: string;
}

function SuccessStoriesPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'All Stories', icon: Users },
        { id: 'student', label: 'Students', icon: GraduationCap },
        { id: 'teacher', label: 'Teachers', icon: BookOpen },
        { id: 'parent', label: 'Parents', icon: Heart },
    ];

    useEffect(() => {
        async function fetchStories() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/public/stories`);
                if (!res.ok) throw new Error('Failed to load stories');
                const data: Story[] = await res.json();
                setStories(data);
            } catch {
                setError('Could not load success stories. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchStories();
    }, []);

    const filteredStories = activeCategory === 'all'
        ? stories
        : stories.filter(s => s.role === activeCategory);

    const featuredStory = filteredStories[currentStoryIndex] ?? null;

    const nextStory = () => setCurrentStoryIndex(prev => (prev + 1) % filteredStories.length);
    const prevStory = () => setCurrentStoryIndex(prev => (prev - 1 + filteredStories.length) % filteredStories.length);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' });

    const initials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase();

    const roleBadge = (role: string) => {
        const map: Record<string, string> = {
            student: 'Academic Star',
            teacher: 'Educator Excellence',
            parent: 'Parent Champion',
        };
        return map[role] ?? 'Success Story';
    };

    const stats = [
        { number: '2000+', label: 'Students Impacted', icon: GraduationCap },
        { number: '28+', label: 'Teachers Supported', icon: BookOpen },
        { number: '380+', label: 'Families Helped', icon: Heart },
        { number: '15', label: 'Counties Reached', icon: MapPin },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Star className="h-16 w-16 text-green-600" />
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
                    {/* Desktop */}
                    <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                onClick={() => { setActiveCategory(category.id); setCurrentStoryIndex(0); }}
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

                    {/* Mobile */}
                    <div className="md:hidden mb-12">
                        <Select
                            value={activeCategory}
                            onValueChange={(value) => { setActiveCategory(value); setCurrentStoryIndex(0); }}
                        >
                            <SelectTrigger className="w-full border-green-200 text-green-600 hover:bg-green-50">
                                <SelectValue>
                                    <div className="flex items-center">
                                        {(() => {
                                            const cat = categories.find(c => c.id === activeCategory);
                                            if (cat) { const Icon = cat.icon; return <Icon className="h-4 w-4 mr-2" />; }
                                            return null;
                                        })()}
                                        {categories.find(c => c.id === activeCategory)?.label}
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id} className="cursor-pointer">
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

            {/* Loading / Error */}
            {loading && (
                <div className="flex justify-center items-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            )}

            {error && (
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {!loading && !error && filteredStories.length === 0 && (
                <div className="text-center py-20 px-4">
                    <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories yet</h3>
                    <p className="text-gray-500">
                        {stories.length === 0
                            ? 'Check back soon — we\'ll be sharing inspiring stories from our community.'
                            : 'No stories in this category yet.'}
                    </p>
                </div>
            )}

            {!loading && !error && featuredStory && (
                <>
                    {/* Featured Story */}
                    <section className="py-12 px-4">
                        <div className="max-w-6xl mx-auto">
                            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                                <div className="grid lg:grid-cols-2 gap-0">
                                    {/* Left: meta */}
                                    <CardContent className="p-8 lg:p-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <Badge className="bg-green-100 text-green-800 font-semibold">
                                                {roleBadge(featuredStory.role)}
                                            </Badge>
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(featuredStory.created_at)}
                                            </div>
                                        </div>

                                        <div className="flex items-center mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                                                {initials(featuredStory.student_name)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{featuredStory.student_name}</h3>
                                                <p className="text-green-600 font-medium capitalize">
                                                    {featuredStory.role}{featuredStory.grade_level ? ` · ${featuredStory.grade_level}` : ''}
                                                </p>
                                                {featuredStory.location && (
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {featuredStory.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {featuredStory.achievement && (
                                            <div className="mb-6">
                                                <div className="flex items-center mb-2">
                                                    <Award className="h-5 w-5 text-green-600 mr-2" />
                                                    <span className="font-semibold text-gray-900">Achievement:</span>
                                                </div>
                                                <p className="text-green-600 font-medium">{featuredStory.achievement}</p>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <Quote className="h-6 w-6 text-green-600 mb-3" />
                                            <blockquote className="text-lg italic text-gray-700">
                                                "{featuredStory.story_text.slice(0, 160)}{featuredStory.story_text.length > 160 ? '…' : ''}"
                                            </blockquote>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            {featuredStory.impact && (
                                                <div className="flex items-center">
                                                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">Impact: {featuredStory.impact}</span>
                                                </div>
                                            )}
                                            {filteredStories.length > 1 && (
                                                <div className="flex space-x-2 ml-auto">
                                                    <Button onClick={prevStory} size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <Button onClick={nextStory} size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    {/* Right: full story */}
                                    <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 lg:p-12 text-white">
                                        <h4 className="text-2xl font-bold mb-6">Full Story</h4>
                                        <p className="text-green-50 leading-relaxed text-lg">
                                            {featuredStory.story_text}
                                        </p>

                                        {filteredStories.length > 1 && (
                                            <div className="mt-8 pt-6 border-t border-green-500">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-green-100">Story {currentStoryIndex + 1} of {filteredStories.length}</span>
                                                    <div className="flex space-x-1">
                                                        {filteredStories.map((_, index) => (
                                                            <div
                                                                key={index}
                                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStoryIndex ? 'bg-white' : 'bg-green-400'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Story Grid */}
                    {filteredStories.length > 1 && (
                        <section className="py-16 px-4">
                            <div className="max-w-6xl mx-auto">
                                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                                    More Success Stories
                                </h2>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredStories
                                        .filter((_, index) => index !== currentStoryIndex)
                                        .map((story) => (
                                            <Card key={story.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white/90 backdrop-blur-sm group cursor-pointer">
                                                <CardHeader className="pb-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                                            {roleBadge(story.role)}
                                                        </Badge>
                                                        <div className="text-xs text-gray-500">{formatDate(story.created_at)}</div>
                                                    </div>

                                                    <div className="flex items-center mb-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                            {initials(story.student_name)}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                                                {story.student_name}
                                                            </CardTitle>
                                                            <CardDescription className="text-green-600 font-medium capitalize">
                                                                {story.role}{story.grade_level ? ` · ${story.grade_level}` : ''}
                                                            </CardDescription>
                                                            {story.location && (
                                                                <div className="flex items-center text-gray-500 text-xs">
                                                                    <MapPin className="h-3 w-3 mr-1" />
                                                                    {story.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent>
                                                    {story.achievement && (
                                                        <div className="mb-4">
                                                            <div className="flex items-center mb-2">
                                                                <Award className="h-4 w-4 text-green-600 mr-2" />
                                                                <span className="text-sm font-semibold text-gray-900">Achievement</span>
                                                            </div>
                                                            <p className="text-sm text-green-600 font-medium">{story.achievement}</p>
                                                        </div>
                                                    )}

                                                    <blockquote className="text-sm italic text-gray-600 mb-4 line-clamp-3">
                                                        "{story.story_text}"
                                                    </blockquote>

                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        {story.impact && (
                                                            <div className="flex items-center">
                                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                                <span>{story.impact}</span>
                                                            </div>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-green-600 hover:text-green-700 p-0 h-auto font-medium ml-auto"
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
                    )}
                </>
            )}

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
