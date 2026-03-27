'use client'

import { BookOpen, Search, Plus, Minus, HelpCircle, Users, CreditCard, Smartphone, GraduationCap, MessageCircle, Mail, Phone, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface Faq {
    id: string;
    question: string;
    answer: string;
    category: string;
    display_order: number;
    is_published: boolean;
    created_at: string;
}

function FAQsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openFAQs, setOpenFAQs] = useState<string[]>([]);
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'All Questions', icon: HelpCircle },
        { id: 'getting-started', label: 'Getting Started', icon: GraduationCap },
        { id: 'payments', label: 'Payments & Pricing', icon: CreditCard },
        { id: 'technical', label: 'Technical Support', icon: Smartphone },
        { id: 'cbc-curriculum', label: 'CBC Curriculum', icon: BookOpen },
        { id: 'account', label: 'Account & Access', icon: Users },
    ];

    useEffect(() => {
        async function fetchFaqs() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/public/faqs`);
                if (!res.ok) throw new Error('Failed to load FAQs');
                const data: Faq[] = await res.json();
                setFaqs(data);
            } catch {
                setError('Could not load FAQs. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchFaqs();
    }, []);

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = !searchTerm ||
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (id: string) => {
        setOpenFAQs(prev =>
            prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
        );
    };

    // Top 6 FAQs (by display_order) shown as cards before the full list
    const popularFAQs = [...faqs]
        .sort((a, b) => a.display_order - b.display_order)
        .slice(0, 6);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            {/* Hero Section */}
            <section className="relative pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="relative">
                            <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600" />
                            <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75"></div>
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                        Frequently Asked <span className="text-green-600">Questions</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2">
                        Find answers to common questions about Tusome, CBC curriculum, payments, and technical support. Can't find what you're looking for? Contact our support team.
                    </p>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto px-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 sm:py-4 text-base sm:text-lg border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl shadow-sm"
                            />
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
                    {/* Popular FAQs */}
                    {!searchTerm && selectedCategory === 'all' && popularFAQs.length > 0 && (
                        <section className="py-12 sm:py-16 lg:py-20 px-4">
                            <div className="max-w-6xl mx-auto">
                                <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12 lg:mb-16">
                                    Most Asked Questions
                                </h2>

                                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {popularFAQs.map((faq) => (
                                        <Card key={faq.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm group cursor-pointer transform hover:-translate-y-1">
                                            <CardContent className="p-6 sm:p-8">
                                                <div className="flex items-start justify-between mb-4 sm:mb-6">
                                                    <Badge variant="outline" className="border-green-200 text-green-600 text-xs px-2 sm:px-3 py-1 text-center">
                                                        {categories.find(c => c.id === faq.category)?.label ?? faq.category}
                                                    </Badge>
                                                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                                                </div>

                                                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-green-600 transition-colors line-clamp-3 text-base sm:text-lg leading-tight">
                                                    {faq.question}
                                                </h3>

                                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 sm:mb-6">
                                                    {faq.answer}
                                                </p>

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 h-auto font-medium transition-all duration-200 text-sm"
                                                    onClick={() => toggleFAQ(faq.id)}
                                                >
                                                    Read Full Answer
                                                    <ChevronRight className="h-3 w-3 ml-1 sm:ml-2" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Category Filter */}
                    <section className="py-8 sm:py-12 px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 lg:mb-16">
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        variant={selectedCategory === category.id ? "default" : "outline"}
                                        className={`px-3 sm:px-6 py-2 sm:py-3 transition-all duration-300 text-xs sm:text-sm ${selectedCategory === category.id
                                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                                            : 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300'
                                        }`}
                                        size="sm"
                                    >
                                        <category.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-3" />
                                        <span className="hidden sm:inline">{category.label}</span>
                                        <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* FAQ List */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {searchTerm || selectedCategory !== 'all' ? 'Search Results' : 'All Questions'}
                                </h2>
                                <div className="text-sm sm:text-base text-gray-600 bg-green-50 px-3 sm:px-4 py-2 rounded-full border border-green-100 self-start sm:self-auto">
                                    {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                                </div>
                            </div>

                            {filteredFAQs.length > 0 ? (
                                <div className="space-y-4 sm:space-y-6">
                                    {filteredFAQs.map((faq) => (
                                        <Card key={faq.id} className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm">
                                            <Collapsible
                                                open={openFAQs.includes(faq.id)}
                                                onOpenChange={() => toggleFAQ(faq.id)}
                                            >
                                                <CollapsibleTrigger className="w-full">
                                                    <CardHeader className="cursor-pointer hover:bg-green-50/50 transition-colors duration-200 p-4 sm:p-6 lg:p-8">
                                                        <div className="flex items-start justify-between gap-3 sm:gap-6">
                                                            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 text-left flex-1">
                                                                <div className="flex-shrink-0 mb-2 sm:mb-0 sm:mt-1">
                                                                    <Badge variant="outline" className="border-green-200 text-green-600 px-2 sm:px-3 py-1 text-xs">
                                                                        {categories.find(c => c.id === faq.category)?.label ?? faq.category}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 leading-relaxed">
                                                                        {faq.question}
                                                                    </CardTitle>
                                                                </div>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                {openFAQs.includes(faq.id) ? (
                                                                    <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                                                ) : (
                                                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <CardContent className="pt-0 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
                                                        <div className="sm:pl-6 sm:border-l-4 sm:border-green-100 sm:ml-6">
                                                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 sm:py-20">
                                    <HelpCircle className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2 sm:mb-3">
                                        {faqs.length === 0 ? 'No FAQs published yet' : 'No questions found'}
                                    </h3>
                                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                                        {faqs.length === 0
                                            ? 'Check back soon for answers to common questions.'
                                            : 'Try adjusting your search terms or category filter'}
                                    </p>
                                    {faqs.length > 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                                            className="border-green-200 text-green-600 hover:bg-green-50 px-4 sm:px-6 py-2 sm:py-3"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

            {/* Contact Support */}
            <section className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
                        Still Have Questions?
                    </h2>
                    <p className="text-lg sm:text-xl text-green-100 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto px-2">
                        Our friendly support team is here to help you succeed. Get in touch and we'll respond within 2 hours during business hours.
                    </p>

                    <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                        {/* WhatsApp */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                            <CardContent className="p-6 sm:p-8 text-center">
                                <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-green-200" />
                                <h3 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">WhatsApp Support</h3>
                                <p className="text-green-100 text-sm mb-4 sm:mb-6 leading-relaxed">Get instant help via WhatsApp</p>
                                <Button
                                    variant="outline"
                                    className="border-white text-black hover:bg-white hover:text-green-600 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                                    size="sm"
                                >
                                    +254 797 233 957
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Email */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                            <CardContent className="p-6 sm:p-8 text-center">
                                <Mail className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-green-200" />
                                <h3 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Email Support</h3>
                                <p className="text-green-100 text-sm mb-4 sm:mb-6 leading-relaxed">Send us your detailed questions</p>
                                <Button
                                    variant="outline"
                                    className="border-white text-black hover:bg-white hover:text-green-600 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base break-all"
                                    size="sm"
                                >
                                    support@tusome.co.ke
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Phone */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 md:col-span-3 md:max-w-sm md:mx-auto lg:col-span-1 lg:max-w-none">
                            <CardContent className="p-6 sm:p-8 text-center">
                                <Phone className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-green-200" />
                                <h3 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Phone Support</h3>
                                <p className="text-green-100 text-sm mb-4 sm:mb-6 leading-relaxed">Speak directly with our team</p>
                                <Button
                                    variant="outline"
                                    className="border-white text-black hover:bg-white hover:text-green-600 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                                    size="sm"
                                >
                                    +254 797 233 957
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-green-500">
                        <p className="text-green-100 leading-relaxed text-sm sm:text-base px-2">
                            <strong>Support Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM (EAT)<br />
                            <strong>Emergency Support:</strong> Available 24/7 via WhatsApp
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FAQsPage;
