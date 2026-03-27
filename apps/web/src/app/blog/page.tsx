'use client'

import { BookOpen, Calendar, User, Eye, Clock, ArrowRight, Search, Filter, ChevronLeft, ChevronRight, BookMarked, GraduationCap, Users, Lightbulb, TrendingUp, Star, Loader2, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author_name: string;
    category: string;
    tags: string[] | null;
    cover_image_url: string | null;
    read_time_minutes: number;
    view_count: number;
    is_featured: boolean;
    created_at: string;
}

function BlogPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const blogsPerPage = 6;

    const categories = [
        { id: 'all', label: 'All Articles', icon: BookOpen },
        { id: 'study-tips', label: 'Study Tips', icon: Lightbulb },
        { id: 'cbc-guide', label: 'CBC Guide', icon: GraduationCap },
        { id: 'career-advice', label: 'Career Advice', icon: TrendingUp },
        { id: 'student-life', label: 'Student Life', icon: Users },
        { id: 'exam-prep', label: 'Exam Preparation', icon: BookMarked },
        { id: 'general', label: 'General', icon: BookOpen },
    ];

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ skip: '0', limit: '50' });
                if (selectedCategory !== 'all') params.set('category', selectedCategory);
                const res = await fetch(`${API_BASE}/public/blog?${params}`);
                if (!res.ok) throw new Error('Failed to load articles');
                const data = await res.json();
                setPosts(data.results ?? []);
            } catch {
                setError('Could not load articles. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
        setCurrentPage(1);
    }, [selectedCategory]);

    const filteredPosts = posts.filter(post => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            post.title.toLowerCase().includes(term) ||
            (post.excerpt ?? '').toLowerCase().includes(term) ||
            (post.tags ?? []).some(tag => tag.toLowerCase().includes(term))
        );
    });

    const totalPages = Math.ceil(filteredPosts.length / blogsPerPage);
    const startIndex = (currentPage - 1) * blogsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + blogsPerPage);
    const featuredPosts = posts.filter(p => p.is_featured);

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const categoryLabel = (id: string) =>
        categories.find(c => c.id === id)?.label ?? id;

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
                        Educational <span className="text-green-600">Insights</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                        Discover practical tips, expert advice, and inspiring stories to help Kenyan students excel in their educational journey.
                    </p>

                    {/* Search and Filter */}
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search articles, tips, and guides..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10 py-3 text-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div className="flex justify-center">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-64 border-green-200 text-green-600">
                                    <SelectValue>
                                        <div className="flex items-center">
                                            <Filter className="h-4 w-4 mr-2" />
                                            {categoryLabel(selectedCategory)}
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
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

            {!loading && !error && (
                <>
                    {/* Featured Articles */}
                    {featuredPosts.length > 0 && selectedCategory === 'all' && !searchTerm && (
                        <section className="py-16 px-4">
                            <div className="max-w-6xl mx-auto">
                                <div className="flex items-center mb-8">
                                    <Star className="h-6 w-6 text-green-600 mr-2" />
                                    <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    {featuredPosts.slice(0, 2).map((post) => (
                                        <Card key={post.id} className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                                            <div className="relative">
                                                {post.cover_image_url ? (
                                                    <img src={post.cover_image_url} alt={post.title} className="h-48 w-full object-cover" />
                                                ) : (
                                                    <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                                        <BookOpen className="h-16 w-16 text-white opacity-50" />
                                                    </div>
                                                )}
                                                <Badge className="absolute top-4 left-4 bg-green-600 text-white">Featured</Badge>
                                            </div>

                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge variant="outline" className="border-green-200 text-green-600">
                                                        {categoryLabel(post.category)}
                                                    </Badge>
                                                </div>

                                                <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                                                    {post.title}
                                                </CardTitle>

                                                <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                                                    {post.excerpt}
                                                </CardDescription>

                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center">
                                                            <User className="h-4 w-4 mr-1" />
                                                            {post.author_name}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            {formatDate(post.created_at)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            {post.read_time_minutes} min read
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            {post.view_count.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link href={`/blog/${post.slug}`}>
                                                    <Button className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors">
                                                        Read Full Article
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Blog Grid */}
                    <section className="py-16 px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {searchTerm || selectedCategory !== 'all' ? 'Search Results' : 'Latest Articles'}
                                </h2>
                                <div className="text-gray-600">
                                    {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                                </div>
                            </div>

                            {paginatedPosts.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {paginatedPosts.map((post) => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                                            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white/90 backdrop-blur-sm h-full cursor-pointer">
                                                <div className="relative">
                                                    {post.cover_image_url ? (
                                                        <img src={post.cover_image_url} alt={post.title} className="h-40 w-full object-cover" />
                                                    ) : (
                                                        <div className="h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                                            <BookOpen className="h-12 w-12 text-white opacity-50" />
                                                        </div>
                                                    )}
                                                    {post.is_featured && (
                                                        <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs">Featured</Badge>
                                                    )}
                                                </div>

                                                <CardContent className="p-5">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge variant="outline" className="border-green-200 text-green-600 text-xs">
                                                            {categoryLabel(post.category)}
                                                        </Badge>
                                                    </div>

                                                    <CardTitle className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                                                        {post.title}
                                                    </CardTitle>

                                                    <CardDescription className="text-gray-600 mb-4 line-clamp-3 text-sm">
                                                        {post.excerpt}
                                                    </CardDescription>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <User className="h-3 w-3 mr-1" />
                                                            <span className="font-medium">{post.author_name}</span>
                                                            <span className="mx-2">•</span>
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(post.created_at)}
                                                        </div>

                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex items-center">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    {post.read_time_minutes} min read
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                    {post.view_count.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors text-xs"
                                                        >
                                                            Read Article
                                                            <ArrowRight className="h-3 w-3 ml-1" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        {posts.length === 0 ? 'No articles published yet' : 'No articles found'}
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        {posts.length === 0
                                            ? 'Check back soon for educational articles and guides.'
                                            : 'Try adjusting your search terms or category filter'}
                                    </p>
                                    {posts.length > 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                                            className="border-green-200 text-green-600 hover:bg-green-50"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center space-x-2 mt-12">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="border-green-200 text-green-600 hover:bg-green-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className={
                                                    currentPage === page
                                                        ? "bg-green-600 text-white hover:bg-green-700"
                                                        : "border-green-200 text-green-600 hover:bg-green-50"
                                                }
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="border-green-200 text-green-600 hover:bg-green-50"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

            {/* Newsletter Signup */}
            <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Stay Updated with Educational Tips
                    </h2>
                    <p className="text-xl text-green-100 mb-8 leading-relaxed">
                        Get the latest study tips, exam guides, and career advice delivered to your inbox every week.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            className="bg-white text-gray-900 border-0 focus:ring-2 focus:ring-green-300"
                        />
                        <Button className="bg-white text-green-600 px-8 hover:bg-gray-100 transition-colors font-semibold">
                            Subscribe
                        </Button>
                    </div>
                    <p className="text-sm text-green-100 mt-4">
                        Join 2000+ Kenyan students already receiving our weekly newsletter
                    </p>
                </div>
            </section>
        </div>
    );
}

export default BlogPage;
