'use client'

import { BookOpen, Search, Plus, Minus, HelpCircle, Users, CreditCard, Smartphone, Wifi, GraduationCap, MessageCircle, Mail, Phone, ChevronRight } from 'lucide-react';
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

function FAQsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openFAQs, setOpenFAQs] = useState<number[]>([]);

    const categories = [
        { id: 'all', label: 'All Questions', icon: HelpCircle },
        { id: 'getting-started', label: 'Getting Started', icon: GraduationCap },
        { id: 'payments', label: 'Payments & Pricing', icon: CreditCard },
        { id: 'technical', label: 'Technical Support', icon: Smartphone },
        { id: 'cbc-curriculum', label: 'CBC Curriculum', icon: BookOpen },
        { id: 'account', label: 'Account & Access', icon: Users }
    ];

    const faqs = [
        {
            id: 1,
            category: 'getting-started',
            question: "What is Tusome and how does it work?",
            answer: "Tusome is Kenya's leading educational platform designed specifically for the CBC curriculum. We provide interactive lessons, assessments, and learning materials for students from Grade 1 to Grade 12. Our platform works on any device - smartphones, tablets, or computers - and is optimized for Kenya's internet conditions. Simply sign up, choose your grade level, and start learning with content aligned to the CBC system.",
            tags: ["platform", "CBC", "how it works", "introduction"]
        },
        {
            id: 2,
            category: 'getting-started',
            question: "Which grades and subjects does Tusome cover?",
            answer: "Tusome covers all CBC levels: Primary (Grade 1-6), Junior Secondary (Grade 7-9), and Senior Secondary (Grade 10-12). We offer content for all 12 CBC learning areas including Mathematics, English, Kiswahili, Science & Technology, Social Studies, Creative Arts, Physical & Health Education, and more. Our content is continuously updated to match the latest CBC curriculum guidelines.",
            tags: ["grades", "subjects", "CBC learning areas", "curriculum"]
        },
        {
            id: 3,
            category: 'payments',
            question: "How much does Tusome cost and what payment methods do you accept?",
            answer: "Tusome offers affordable pricing starting from KES 299 per month for basic access, KES 599 for premium features, and KES 999 for our complete package with additional resources. We accept M-Pesa, Airtel Money, bank transfers, and debit/credit cards. You can also pay termly or annually for better value. We believe quality education should be accessible to all Kenyan families.",
            tags: ["pricing", "cost", "M-Pesa", "payment methods", "affordable"]
        },
        {
            id: 4,
            category: 'payments',
            question: "Can I pay using M-Pesa and how does it work?",
            answer: "Yes! M-Pesa is our most popular payment method. Simply go to your account settings, select M-Pesa payment, and follow the prompts. You'll receive an M-Pesa message on your phone to complete the payment. The process takes less than 2 minutes, and your account is activated immediately after successful payment. You can also set up automatic monthly payments for convenience.",
            tags: ["M-Pesa", "mobile money", "payment process", "automatic payments"]
        },
        {
            id: 5,
            category: 'technical',
            question: "Will Tusome work on my phone and with slow internet?",
            answer: "Absolutely! Tusome is designed specifically for Kenyan internet conditions. Our platform works on any smartphone (Android or iPhone), tablet, or computer. We've optimized our content to load quickly even on 2G/3G networks. Lessons use minimal data, and you can adjust video quality based on your connection speed. We recommend at least 1GB of data per month for regular use.",
            tags: ["mobile compatibility", "slow internet", "data usage", "2G 3G networks"]
        },
        {
            id: 6,
            category: 'technical',
            question: "What if I have no internet connection? Can I still use Tusome?",
            answer: "While Tusome is primarily an online platform, we understand connectivity challenges in Kenya. Once you've accessed lessons with internet, some content remains available for a short time. We also provide downloadable study materials and worksheets that you can access offline. For areas with very limited connectivity, we recommend accessing content when internet is available and taking notes for offline study.",
            tags: ["offline access", "no internet", "downloadable content", "connectivity issues"]
        },
        {
            id: 7,
            category: 'cbc-curriculum',
            question: "How does Tusome align with the CBC curriculum?",
            answer: "Tusome is 100% aligned with Kenya's CBC curriculum. Our content is developed by certified CBC educators and follows the official curriculum designs from KICD (Kenya Institute of Curriculum Development). We cover all competency areas, learning outcomes, and assessment criteria. Our lessons are structured according to CBC's learner-centered approach, emphasizing practical skills and real-world application.",
            tags: ["CBC alignment", "KICD", "curriculum compliance", "competency-based"]
        },
        {
            id: 8,
            category: 'cbc-curriculum',
            question: "How are assessments conducted on Tusome?",
            answer: "Our assessments follow the CBC continuous assessment model. Instead of traditional exams, we provide formative and summative assessments that test competencies and practical skills. Students complete projects, quizzes, and interactive tasks that mirror CBC evaluation methods. Parents and teachers can track progress through detailed reports showing competency development across all learning areas.",
            tags: ["CBC assessment", "continuous evaluation", "competency testing", "progress tracking"]
        },
        {
            id: 9,
            category: 'account',
            question: "Can multiple children use one Tusome account?",
            answer: "Yes! Our family plans allow up to 4 children to use one account. Each child gets their own profile with grade-appropriate content and individual progress tracking. Parents can easily switch between children's profiles and monitor each child's learning journey. This makes Tusome very cost-effective for families with multiple school-going children.",
            tags: ["family account", "multiple children", "individual profiles", "cost-effective"]
        },
        {
            id: 10,
            category: 'account',
            question: "How do I track my child's progress on Tusome?",
            answer: "Tusome provides comprehensive progress tracking through our parent dashboard. You can see detailed reports on your child's performance across all learning areas, time spent studying, completed assignments, and areas needing improvement. We send weekly progress summaries via SMS and email. Teachers can also access student progress if given permission by parents.",
            tags: ["progress tracking", "parent dashboard", "performance reports", "weekly summaries"]
        },
        {
            id: 11,
            category: 'getting-started',
            question: "Do you offer content in both English and Kiswahili?",
            answer: "Yes! Understanding Kenya's linguistic diversity, Tusome offers content in both English and Kiswahili. Lower primary content (Grade 1-3) includes more Kiswahili to support mother tongue learning as recommended by CBC. Upper grades focus more on English while maintaining Kiswahili language lessons. Students can also switch between languages for better understanding of concepts.",
            tags: ["bilingual content", "English", "Kiswahili", "mother tongue", "language switching"]
        },
        {
            id: 12,
            category: 'technical',
            question: "What technical requirements do I need to use Tusome?",
            answer: "Tusome has minimal technical requirements: any smartphone with Android 6.0+ or iOS 12+, or a computer with an internet browser. You need at least 1GB RAM and 500MB storage space. For internet, even basic 2G connections work, though 3G or 4G provides the best experience. No special software installation is required - everything works through your web browser.",
            tags: ["technical requirements", "device compatibility", "system requirements", "browser-based"]
        },
        {
            id: 13,
            category: 'payments',
            question: "Is there a free trial available?",
            answer: "Yes! Tusome offers a 7-day free trial for new users. During the trial, you get full access to all features and content for your selected grade level. No payment is required to start the trial - just sign up with your phone number. After the trial, you can choose a subscription plan that works for your family's budget and needs.",
            tags: ["free trial", "7 days", "no payment required", "full access"]
        },
        {
            id: 14,
            category: 'cbc-curriculum',
            question: "How do you handle students transitioning between grades?",
            answer: "Tusome makes grade transitions smooth and stress-free. For major transitions like Grade 6 to 7 (Primary to Junior Secondary), we provide special transition modules that prepare students for new learning areas and assessment methods. Students can access content from their previous grade for review and preview upcoming grade content. Our system automatically adjusts content as students progress.",
            tags: ["grade transition", "Grade 6 to 7", "transition modules", "content progression"]
        },
        {
            id: 15,
            category: 'account',
            question: "Can teachers use Tusome for classroom teaching?",
            answer: "Absolutely! Many teachers across Kenya use Tusome to enhance their classroom instruction. We offer special educator accounts with additional features like lesson planning tools, student management, and classroom presentation modes. Teachers can project lessons using smartphones and basic projectors. We also provide training resources to help teachers integrate digital content into their CBC teaching methods.",
            tags: ["teachers", "classroom use", "educator accounts", "lesson planning", "teacher training"]
        },
        {
            id: 16,
            category: 'technical',
            question: "What should I do if Tusome is not loading or working properly?",
            answer: "First, check your internet connection and try refreshing the page. Clear your browser cache or restart your app. If problems persist, try switching to a different network or reducing video quality in settings. For continued issues, contact our support team via WhatsApp (+254 700 123 456), email (support@tusome.co.ke), or the in-app help feature. Our technical team responds within 2 hours during business hours.",
            tags: ["troubleshooting", "technical issues", "support contact", "loading problems"]
        }
    ];

    // Filter FAQs based on search and category
    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (id: number) => {
        setOpenFAQs(prev =>
            prev.includes(id)
                ? prev.filter(faqId => faqId !== id)
                : [...prev, id]
        );
    };

    const popularFAQs = faqs.filter(faq => [1, 3, 5, 7, 9, 13].includes(faq.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <HelpCircle className="h-16 w-16 text-green-600" />
                            <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-75"></div>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Frequently Asked <span className="text-green-600">Questions</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                        Find answers to common questions about Tusome, CBC curriculum, payments, and technical support. Can't find what you're looking for? Contact our support team.
                    </p>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for answers to your questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-4 text-lg border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular FAQs */}
            {!searchTerm && selectedCategory === 'all' && (
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                            Most Asked Questions
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {popularFAQs.map((faq) => (
                                <Card key={faq.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm group cursor-pointer transform hover:-translate-y-1">
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <Badge variant="outline" className="border-green-200 text-green-600 text-xs px-3 py-1">
                                                {categories.find(cat => cat.id === faq.category)?.label}
                                            </Badge>
                                            <HelpCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-4 group-hover:text-green-600 transition-colors line-clamp-2 text-lg leading-tight">
                                            {faq.question}
                                        </h3>

                                        <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                                            {faq.answer}
                                        </p>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 h-auto font-medium transition-all duration-200"
                                            onClick={() => toggleFAQ(faq.id)}
                                        >
                                            Read Full Answer
                                            <ChevronRight className="h-3 w-3 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Category Filter */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                className={`px-6 py-3 transition-all duration-300 ${selectedCategory === category.id
                                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                                        : 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300'
                                    }`}
                            >
                                <category.icon className="h-4 w-4 mr-3" />
                                {category.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ List */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {searchTerm || selectedCategory !== 'all' ? 'Search Results' : 'All Questions'}
                        </h2>
                        <div className="text-gray-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                            {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                        </div>
                    </div>

                    {filteredFAQs.length > 0 ? (
                        <div className="space-y-6">
                            {filteredFAQs.map((faq) => (
                                <Card key={faq.id} className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm">
                                    <Collapsible
                                        open={openFAQs.includes(faq.id)}
                                        onOpenChange={() => toggleFAQ(faq.id)}
                                    >
                                        <CollapsibleTrigger className="w-full">
                                            <CardHeader className="cursor-pointer hover:bg-green-50/50 transition-colors duration-200 p-8">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start space-x-6 text-left">
                                                        <div className="flex-shrink-0 mt-1">
                                                            <Badge variant="outline" className="border-green-200 text-green-600 px-3 py-1">
                                                                {categories.find(cat => cat.id === faq.category)?.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex-1">
                                                            <CardTitle className="text-lg font-semibold text-gray-900 leading-relaxed">
                                                                {faq.question}
                                                            </CardTitle>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-6">
                                                        {openFAQs.includes(faq.id) ? (
                                                            <Minus className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <Plus className="h-5 w-5 text-green-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <CardContent className="pt-0 pb-8 px-8">
                                                <div className="pl-6 border-l-4 border-green-100 ml-6">
                                                    <p className="text-gray-700 leading-relaxed text-base mb-6">
                                                        {faq.answer}
                                                    </p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {faq.tags.map((tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <HelpCircle className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-3">No questions found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search terms or category filter</p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="border-green-200 text-green-600 hover:bg-green-50 px-6 py-3"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-24 px-4 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">
                        Still Have Questions?
                    </h2>
                    <p className="text-xl text-green-100 mb-12 leading-relaxed max-w-2xl mx-auto">
                        Our friendly support team is here to help you succeed. Get in touch and we'll respond within 2 hours during business hours.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* WhatsApp */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                            <CardContent className="p-8 text-center">
                                <MessageCircle className="h-16 w-16 mx-auto mb-6 text-green-200" />
                                <h3 className="font-semibold mb-3 text-lg">WhatsApp Support</h3>
                                <p className="text-green-100 text-sm mb-6 leading-relaxed">Get instant help via WhatsApp</p>
                                <Button
                                    variant="outline"
                                    className="border-white text-black hover:bg-white hover:text-green-600 px-6 py-3"
                                >
                                    +254 797 233 957
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Email */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                            <CardContent className="p-8 text-center">
                                <Mail className="h-16 w-16 mx-auto mb-6 text-green-200" />
                                <h3 className="font-semibold mb-3 text-lg">Email Support</h3>
                                <p className="text-green-100 text-sm mb-6 leading-relaxed">Send us your detailed questions</p>
                                <Button
                                    variant="outline"
                                    className="border-white text-black hover:bg-white hover:text-green-600 px-6 py-3"
                                >
                                    support@tusome.co.ke
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Phone */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                            <CardContent className="p-8 text-center">
                                <Phone className="h-16 w-16 mx-auto mb-6 text-green-200" />
                                <h3 className="font-semibold mb-3 text-lg">Phone Support</h3>
                                <p className="text-green-100 text-sm mb-6 leading-relaxed">Speak directly with our team</p>
                                <Button
                                    variant="outline"
                                    className="border-white text-black hover:bg-white hover:text-green-600 px-6 py-3"
                                >
                                    +254 20 123 4567
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-12 pt-8 border-t border-green-500">
                        <p className="text-green-100 leading-relaxed">
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