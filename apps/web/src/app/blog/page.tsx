'use client'

import { BookOpen, Calendar, User, Eye, Clock, ArrowRight, Search, Filter, ChevronLeft, ChevronRight, Heart, Share2, BookMarked, GraduationCap, Users, Lightbulb, TrendingUp, Star } from 'lucide-react';
import React, { useState } from 'react'
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

function BlogPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;

    const categories = [
        { id: 'all', label: 'All Articles', icon: BookOpen },
        { id: 'study-tips', label: 'Study Tips', icon: Lightbulb },
        { id: 'cbc-guide', label: 'CBC Guide', icon: GraduationCap },
        { id: 'career-advice', label: 'Career Advice', icon: TrendingUp },
        { id: 'student-life', label: 'Student Life', icon: Users },
        { id: 'exam-prep', label: 'Exam Preparation', icon: BookMarked }
    ];

    const blogPosts = [
        {
            id: 1,
            title: "Mastering Senior Secondary Assessments: A Guide for Grade 10-12 Students",
            excerpt: "Excel in your senior secondary assessments with proven strategies. Learn effective study techniques, portfolio development, and competency-based evaluation methods.",
            content: "Senior secondary assessments in the CBC system focus on competency development. Here's how to approach these evaluations strategically...",
            author: "Dr. James Kimani",
            authorRole: "Senior Secondary Specialist",
            date: "2024-08-05",
            readTime: "8 min read",
            views: 2840,
            category: "exam-prep",
            featured: true,
            image: "/api/placeholder/600/300",
            tags: ["Senior Secondary", "CBC Assessment", "Study Tips", "Grade 10-12"]
        },
        {
            id: 2,
            title: "Understanding the CBC Curriculum: What Grade 7 Students Need to Know",
            excerpt: "Navigate the transition to junior secondary school with confidence. Learn about new subjects, assessment methods, and how to succeed in the CBC system.",
            content: "The Competency-Based Curriculum has transformed education in Kenya. As students transition to Grade 7, understanding the new system is crucial for success...",
            author: "Mary Wanjiku",
            authorRole: "CBC Specialist",
            date: "2024-08-02",
            readTime: "6 min read",
            views: 1950,
            category: "cbc-guide",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["CBC", "Grade 7", "Junior Secondary", "Education"]
        },
        {
            id: 3,
            title: "Effective Study Techniques for Kenyan Students with Limited Resources",
            excerpt: "Maximize your learning potential even with limited access to books and internet. Discover creative study methods that work in any environment.",
            content: "Many Kenyan students face challenges with limited study resources. This guide shows how to excel academically regardless of your circumstances...",
            author: "Peter Ochieng",
            authorRole: "Educational Consultant",
            date: "2024-07-28",
            readTime: "10 min read",
            views: 3200,
            category: "study-tips",
            featured: true,
            image: "/api/placeholder/600/300",
            tags: ["Study Methods", "Resource Management", "Academic Success"]
        },
        {
            id: 4,
            title: "Career Pathways After Senior Secondary: Technical Training and University Options",
            excerpt: "Explore diverse career paths available to Grade 12 graduates. Learn about technical training, university education, and entrepreneurship opportunities.",
            content: "After completing senior secondary education, Kenyan students have numerous pathways to success through various educational and career routes...",
            author: "Grace Nyambura",
            authorRole: "Career Counselor",
            date: "2024-07-25",
            readTime: "12 min read",
            views: 2100,
            category: "career-advice",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["Career Guidance", "Grade 12", "Technical Training", "University"]
        },
        {
            id: 5,
            title: "Balancing School and Family Responsibilities: A Guide for Kenyan Students",
            excerpt: "Learn how to manage academic demands while helping with family responsibilities. Practical tips for students juggling multiple commitments.",
            content: "Many Kenyan students must balance schoolwork with family responsibilities. Here's how to excel academically while fulfilling your duties at home...",
            author: "Samuel Kiprotich",
            authorRole: "Student Counselor",
            date: "2024-07-20",
            readTime: "7 min read",
            views: 1650,
            category: "student-life",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["Work-Life Balance", "Family", "Time Management", "Student Support"]
        },
        {
            id: 6,
            title: "Making the Most of Limited Internet Access for Online Learning",
            excerpt: "Optimize your online learning experience with slow or limited internet. Smart strategies for downloading content and managing data usage.",
            content: "Slow internet doesn't have to hinder your education. Learn how to make the most of limited connectivity for effective online learning...",
            author: "Faith Wanjiku",
            authorRole: "Digital Learning Specialist",
            date: "2024-07-15",
            readTime: "9 min read",
            views: 2800,
            category: "study-tips",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["Online Learning", "Internet Optimization", "Digital Education", "Connectivity"]
        },
        {
            id: 7,
            title: "Mastering Grade 6 Assessment: Understanding CBC Continuous Evaluation",
            excerpt: "Navigate Grade 6 assessments with confidence. Learn about competency-based evaluation, portfolio development, and how to showcase your learning progress.",
            content: "Grade 6 marks an important milestone in the CBC system. Understanding how continuous assessments work and how to prepare effectively is crucial for success...",
            author: "John Mwangi",
            authorRole: "CBC Assessment Expert",
            date: "2024-07-10",
            readTime: "11 min read",
            views: 3500,
            category: "exam-prep",
            featured: true,
            image: "/api/placeholder/600/300",
            tags: ["Grade 6", "CBC Assessment", "Competency-Based", "Portfolio"]
        },
        {
            id: 8,
            title: "Building Confidence in Science Subjects: Overcoming the Fear Factor",
            excerpt: "Transform your relationship with science subjects. Practical approaches to understanding Physics, Chemistry, and Biology concepts in the CBC system.",
            content: "Many students struggle with science subjects due to fear and misconceptions. Learn how to build confidence and excel in scientific studies using CBC methods...",
            author: "Dr. Anne Mutiso",
            authorRole: "Science Educator",
            date: "2024-07-05",
            readTime: "8 min read",
            views: 2300,
            category: "study-tips",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["Science Education", "Confidence Building", "STEM", "CBC Sciences"]
        },
        {
            id: 9,
            title: "Transitioning from Primary to Junior Secondary: What Grade 7 Students Should Expect",
            excerpt: "Prepare for the exciting journey into junior secondary school. Learn about new learning areas, assessment methods, and how to adapt to the CBC system.",
            content: "Moving from Grade 6 to Grade 7 is a significant transition in the CBC system. Here's everything you need to know to make this transition smooth and successful...",
            author: "Elizabeth Njeri",
            authorRole: "Junior Secondary Coordinator",
            date: "2024-06-28",
            readTime: "9 min read",
            views: 4100,
            category: "cbc-guide",
            featured: true,
            image: "/api/placeholder/600/300",
            tags: ["Grade 7", "Junior Secondary", "CBC Transition", "Learning Areas"]
        },
        {
            id: 10,
            title: "Understanding CBC Learning Areas: A Guide for Parents and Students",
            excerpt: "Explore the 12 learning areas in the CBC curriculum. Understand how they develop 21st-century skills and prepare students for the modern world.",
            content: "The CBC curriculum introduces 12 comprehensive learning areas designed to develop well-rounded learners. Understanding these areas helps students and parents navigate the system effectively...",
            author: "Michael Otieno",
            authorRole: "Curriculum Development Specialist",
            date: "2024-06-20",
            readTime: "10 min read",
            views: 2900,
            category: "cbc-guide",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["CBC", "Learning Areas", "21st Century Skills", "Curriculum"]
        },
        {
            id: 11,
            title: "Junior Secondary Assessment Strategies: Succeeding in Grade 7-9 Evaluations",
            excerpt: "Master junior secondary assessments with practical tips. Learn about continuous assessment, project-based learning, and competency demonstration.",
            content: "Junior secondary assessments in the CBC system emphasize practical skills and competency development. Here's how to excel in this new evaluation approach...",
            author: "Rose Wawira",
            authorRole: "Junior Secondary Assessment Coordinator",
            date: "2024-06-15",
            readTime: "9 min read",
            views: 3100,
            category: "exam-prep",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["Junior Secondary", "Grade 7-9", "Continuous Assessment", "CBC Evaluation"]
        },
        {
            id: 12,
            title: "Developing 21st Century Skills Through CBC: Critical Thinking and Problem Solving",
            excerpt: "Build essential skills for the modern world. Learn how the CBC curriculum develops critical thinking, creativity, and problem-solving abilities.",
            content: "The CBC system focuses on developing 21st-century skills that prepare students for future success. Here's how to maximize your skill development...",
            author: "David Maina",
            authorRole: "Skills Development Specialist",
            date: "2024-06-10",
            readTime: "11 min read",
            views: 2600,
            category: "cbc-guide",
            featured: false,
            image: "/api/placeholder/600/300",
            tags: ["21st Century Skills", "Critical Thinking", "Problem Solving", "CBC Skills"]
        }
    ];

    // Filter blogs based on search and category
    const filteredBlogs = blogPosts.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    const startIndex = (currentPage - 1) * blogsPerPage;
    const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + blogsPerPage);
    const featuredBlogs = blogPosts.filter(blog => blog.featured);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 py-3 text-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div className="flex justify-center">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-64 border-green-200 text-green-600">
                                    <SelectValue>
                                        <div className="flex items-center">
                                            <Filter className="h-4 w-4 mr-2" />
                                            {categories.find(cat => cat.id === selectedCategory)?.label}
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

            {/* Featured Articles */}
            {featuredBlogs.length > 0 && selectedCategory === 'all' && !searchTerm && (
                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center mb-8">
                            <Star className="h-6 w-6 text-green-600 mr-2" />
                            <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {featuredBlogs.slice(0, 2).map((blog) => (
                                <Card key={blog.id} className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                                    <div className="relative">
                                        <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                            <BookOpen className="h-16 w-16 text-white opacity-50" />
                                        </div>
                                        <Badge className="absolute top-4 left-4 bg-green-600 text-white">
                                            Featured
                                        </Badge>
                                    </div>

                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="outline" className="border-green-200 text-green-600">
                                                {categories.find(cat => cat.id === blog.category)?.label}
                                            </Badge>
                                        </div>

                                        <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                                            {blog.title}
                                        </CardTitle>

                                        <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                                            {blog.excerpt}
                                        </CardDescription>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {blog.author}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(blog.date)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {blog.readTime}
                                                </div>
                                                <div className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    {blog.views.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors">
                                            Read Full Article
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
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
                            {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''} found
                        </div>
                    </div>

                    {paginatedBlogs.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedBlogs.map((blog) => (
                                <Card key={blog.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white/90 backdrop-blur-sm group cursor-pointer">
                                    <div className="relative">
                                        <div className="h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-white opacity-50" />
                                        </div>
                                        {blog.featured && (
                                            <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs">
                                                Featured
                                            </Badge>
                                        )}
                                    </div>

                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="outline" className="border-green-200 text-green-600 text-xs">
                                                {categories.find(cat => cat.id === blog.category)?.label}
                                            </Badge>
                                        </div>

                                        <CardTitle className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                                            {blog.title}
                                        </CardTitle>

                                        <CardDescription className="text-gray-600 mb-4 line-clamp-3 text-sm">
                                            {blog.excerpt}
                                        </CardDescription>

                                        <div className="space-y-3">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <User className="h-3 w-3 mr-1" />
                                                <span className="font-medium">{blog.author}</span>
                                                <span className="mx-2">•</span>
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {formatDate(blog.date)}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {blog.readTime}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        {blog.views.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="ghost" className="p-1 h-6 w-6 text-gray-400 hover:text-green-600">
                                                        <Heart className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="p-1 h-6 w-6 text-gray-400 hover:text-green-600">
                                                        <Share2 className="h-3 w-3" />
                                                    </Button>
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
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your search terms or category filter</p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="border-green-200 text-green-600 hover:bg-green-50"
                            >
                                Clear Filters
                            </Button>
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