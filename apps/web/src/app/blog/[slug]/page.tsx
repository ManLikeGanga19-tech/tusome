'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    BookOpen, Calendar, User, Eye, Clock, ArrowLeft,
    Tag, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    author_name: string;
    category: string;
    tags: string[] | null;
    cover_image_url: string | null;
    read_time_minutes: number;
    view_count: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    'general': 'General',
    'study-tips': 'Study Tips',
    'cbc-guide': 'CBC Guide',
    'career-advice': 'Career Advice',
    'student-life': 'Student Life',
    'exam-prep': 'Exam Preparation',
};

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        async function fetchPost() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/public/blog/${slug}`);
                if (res.status === 404) {
                    setError('Article not found.');
                    return;
                }
                if (!res.ok) throw new Error('Failed to load article');
                setPost(await res.json());
            } catch {
                setError('Could not load the article. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col items-center justify-center px-4 gap-6">
                <div className="flex items-center gap-3 p-5 rounded-xl bg-red-50 border border-red-200 text-red-700 max-w-lg w-full">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error ?? 'Article not found.'}</span>
                </div>
                <Link href="/blog">
                    <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Articles
                    </Button>
                </Link>
            </div>
        );
    }

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            {/* Cover */}
            {post.cover_image_url ? (
                <div className="w-full h-64 md:h-96 overflow-hidden">
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="w-full h-48 md:h-72 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-white opacity-30" />
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 py-10">
                {/* Back link */}
                <Link href="/blog" className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium mb-8">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Articles
                </Link>

                {/* Category + Featured */}
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-green-200 text-green-600">
                        {CATEGORY_LABELS[post.category] ?? post.category}
                    </Badge>
                    {post.is_featured && (
                        <Badge className="bg-green-600 text-white">Featured</Badge>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed border-l-4 border-green-400 pl-4">
                        {post.excerpt}
                    </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-gray-700">{post.author_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.read_time_minutes} min read
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.view_count.toLocaleString()} views
                    </div>
                </div>

                {/* Content */}
                {post.content ? (
                    <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed">
                        {post.content.split('\n').map((paragraph, i) =>
                            paragraph.trim() ? (
                                <p key={i} className="mb-4">{paragraph}</p>
                            ) : (
                                <br key={i} />
                            )
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No content available for this article.</p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="h-4 w-4 text-gray-400" />
                            {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back CTA */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <Link href="/blog">
                        <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            More Articles
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
