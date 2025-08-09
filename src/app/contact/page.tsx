'use client'

import { Phone, Mail, MapPin, Clock, MessageCircle, Send, User, FileText, Star, ArrowRight, CheckCircle, HeadphonesIcon, Globe, Users } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: 'general',
        message: ''
    });

    // Contact methods
    const contactMethods = [
        {
            icon: Phone,
            title: "Call Us",
            primary: "+254 700 123 456",
            secondary: "+254 720 987 654",
            description: "Available 24/7 for urgent support",
            color: "green",
            action: "Call Now"
        },
        {
            icon: Mail,
            title: "Email Us",
            primary: "support@tusome.co.ke",
            secondary: "hello@tusome.co.ke",
            description: "We respond within 2 hours",
            color: "blue",
            action: "Send Email"
        },
        {
            icon: MessageCircle,
            title: "WhatsApp",
            primary: "+254 700 123 456",
            secondary: "Quick chat support",
            description: "Instant messaging support",
            color: "green",
            action: "Chat Now"
        },
        {
            icon: MapPin,
            title: "Visit Us",
            primary: "Nairobi, Kenya",
            secondary: "CBD, Kimathi Street",
            description: "Mon-Fri, 8AM-6PM",
            color: "red",
            action: "Get Directions"
        }
    ];

    // Support categories
    const supportCategories = [
        { value: 'general', label: 'General Inquiry', icon: MessageCircle },
        { value: 'technical', label: 'Technical Support', icon: HeadphonesIcon },
        { value: 'billing', label: 'Billing & Payments', icon: FileText },
        { value: 'partnership', label: 'School Partnerships', icon: Users },
        { value: 'feedback', label: 'Feedback & Suggestions', icon: Star }
    ];

    // FAQ items
    const faqs = [
        {
            question: "How does Tusome work with slow or unstable internet connections?",
            answer: "Tusome is specifically optimized for Kenya's internet conditions. Our lessons load quickly even on 2G networks, and you can adjust video quality. We recommend at least 500MB per month for regular use."
        },
        {
            question: "Can I use Tusome without a smartphone or computer?",
            answer: "While we recommend smartphones or tablets for the best experience, Tusome works on any device with internet access, including basic phones with browsers and shared computers."
        },
        {
            question: "How do I pay using M-Pesa and is it secure?",
            answer: "Simply select M-Pesa during checkout and follow the prompts. Payment is instant and secure through Safaricom's encrypted system. We also accept Airtel Money and other mobile money services."
        },
        {
            question: "Is Tusome content truly aligned with CBC curriculum?",
            answer: "Yes! All content is created by certified Kenyan educators following KICD guidelines. We cover all 12 learning areas and competency-based assessments for Grades 4-12."
        },
        {
            question: "Can multiple children in my family use one account?",
            answer: "Yes! Our family plans allow up to 4 children, with each child getting their own individual profile and personalized learning experience. Each student has separate progress tracking and grade-appropriate content."
        },
        {
            question: "What if I live in a rural area with limited connectivity?",
            answer: "Tusome is designed for rural Kenya. Content loads quickly, uses minimal data, and key materials can be accessed during low-connectivity periods. We serve all 47 counties."
        },
        {
            question: "How does Tusome help with CBC's continuous assessment approach?",
            answer: "Our platform mirrors CBC's competency-based evaluation with interactive assessments, portfolio building, and progress tracking that aligns with your school's continuous assessment requirements."
        },
        {
            question: "Can teachers use Tusome in schools without computer labs?",
            answer: "Yes! Teachers can project lessons using smartphones and basic projectors. We provide special educator accounts with classroom management tools and teaching resources."
        }
    ];

    const handleInputChange = (e: { target: { name: any; value: any } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
    };

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 pt-20">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 transform rotate-45 animate-pulse"></div>
                <div className="absolute top-1/4 -left-40 w-60 h-60 bg-blue-200/20 transform rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-2/3 right-10 w-72 h-72 bg-red-200/20 transform -rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-yellow-200/20 transform rotate-45 animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12">

                {/* Header Section */}
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                        Get In
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1 sm:mt-2">
                            Touch
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl lg:max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
                        Have questions about our courses, need technical support, or want to discuss partnerships?
                        We're here to help 24/7 across all 47 counties in Kenya.
                    </p>
                </div>

                {/* Contact Methods Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
                    {contactMethods.map((method, index) => (
                        <Card
                            key={index}
                            className="group bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:scale-105"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardHeader className="text-center pb-3">
                                <method.icon className={`h-10 w-10 sm:h-12 sm:w-12 text-${method.color}-600 mx-auto mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110`} />
                                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{method.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center pt-0">
                                <p className="text-sm sm:text-base font-semibold text-gray-800 mb-1">{method.primary}</p>
                                <p className="text-xs sm:text-sm text-gray-600 mb-2">{method.secondary}</p>
                                <p className="text-xs text-gray-500 mb-4">{method.description}</p>
                                <Button
                                    size="sm"
                                    className={`w-full text-xs bg-${method.color}-600 hover:bg-${method.color}-700 text-white`}
                                >
                                    {method.action}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">

                    {/* Contact Form */}
                    <div>
                        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100">
                            <CardHeader>
                                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                                    <Send className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3" />
                                    Send Us a Message
                                </CardTitle>
                                <p className="text-sm sm:text-base text-gray-600">
                                    Fill out the form below and we'll get back to you within 2 hours during business hours.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <User className="inline h-4 w-4 mr-1" />
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Mail className="inline h-4 w-4 mr-1" />
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Phone className="inline h-4 w-4 mr-1" />
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                placeholder="+254 700 000 000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <FileText className="inline h-4 w-4 mr-1" />
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                required
                                            >
                                                {supportCategories.map(category => (
                                                    <option key={category.value} value={category.value}>
                                                        {category.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                            placeholder="Brief subject of your message"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={5}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base resize-none"
                                            placeholder="Please provide details about your inquiry..."
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm sm:text-base py-3 sm:py-4 flex items-center justify-center group"
                                    >
                                        Send Message
                                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* FAQ Section */}
                    <div>
                        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100 h-full">
                            <CardHeader>
                                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mr-3" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <p className="text-sm sm:text-base text-gray-600">
                                    Quick answers to common questions. Can't find what you're looking for? Contact us directly.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 sm:space-y-6">
                                    {faqs.map((faq, index) => (
                                        <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-start">
                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                {faq.question}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed ml-6 sm:ml-7">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Support Hours & Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100">
                        <CardContent className="p-4 sm:p-6 text-center">
                            <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Support Hours</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-1">Mon-Fri: 6AM - 10PM</p>
                            <p className="text-sm sm:text-base text-gray-600 mb-1">Sat-Sun: 8AM - 8PM</p>
                            <Badge className="bg-green-100 text-green-800 text-xs">24/7 Emergency Support</Badge>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100">
                        <CardContent className="p-4 sm:p-6 text-center">
                            <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Languages</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-1">English & Kiswahili</p>
                            <p className="text-sm sm:text-base text-gray-600 mb-1">Local languages available</p>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Multilingual Support</Badge>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100 sm:col-span-2 lg:col-span-1">
                        <CardContent className="p-4 sm:p-6 text-center">
                            <Star className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Response Time</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-1">Email: Within 2 hours</p>
                            <p className="text-sm sm:text-base text-gray-600 mb-1">Phone: Immediate</p>
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Fast Response Guaranteed</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Final CTA Section */}
                <div className="text-center">
                    <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 via-white to-red-600 border-0 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-gray-800/80 to-red-600/90"></div>
                        <CardContent className="relative z-10 p-6 sm:p-8 lg:p-12 text-center text-white">
                            <HeadphonesIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-yellow-300" />
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                                Need Immediate Help?
                            </h3>
                            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto">
                                Our dedicated support team is standing by to help you succeed.
                                Whether it's a technical issue or course guidance, we're here for you 24/7.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    size="lg"
                                    className="bg-white text-green-600 hover:bg-gray-100 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                                >
                                    Call Support Now
                                    <Phone className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto transition-all duration-300"
                                >
                                    Live Chat Support
                                    <MessageCircle className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                            </div>
                            <p className="text-xs sm:text-sm mt-4 sm:mt-6 opacity-75">
                                Available in English, Kiswahili & local languages • Serving all 47 counties
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

export default ContactUsPage;