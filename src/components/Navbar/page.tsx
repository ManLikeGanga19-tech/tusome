'use client'

import { BookOpen, X, Menu, User, ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

function page() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Course', href: '/courses' },
        { name: 'Success Stories', href: '/success-stories' },
        { name: 'Blog', href: '/blog' },
        { name: 'About', href: '/about' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'FAQs', href: '/faqs' }
    ];

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100'
                : 'bg-white/90 backdrop-blur-sm'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Enhanced Logo */}
                    <div className="flex items-center">
                        <a href="/" className="flex-shrink-0 flex items-center group cursor-pointer">
                            <div className="relative">
                                <BookOpen className="h-10 w-10 text-green-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                                <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <span className="ml-3 text-2xl font-bold text-gray-900 tracking-tight group-hover:text-green-600 transition-colors duration-300">
                                Tusome
                            </span>
                        </a>
                    </div>

                    {/* Enhanced Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="relative px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-all duration-300 group inline-flex h-10 w-max items-center justify-center rounded-lg text-sm hover:bg-green-50"
                            >
                                {item.name}
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-3/4 rounded-full"></div>
                            </a>
                        ))}
                    </div>

                    {/* Enhanced Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <a href="/auth/signin">
                            <Button
                                variant="ghost"
                                className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-6 py-2 font-medium transition-all duration-300 group"
                            >
                                <User className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                                Log In
                            </Button>
                        </a>
                        <a href="/auth/signup">
                            <Button
                                className="bg-green-600 text-white px-8 py-3 hover:bg-green-700 transition-all duration-300 font-semibold relative overflow-hidden group shadow-lg hover:shadow-xl"
                                size="lg"
                            >
                                <span className="relative z-10 flex items-center">
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></div>
                            </Button>
                        </a>
                    </div>

                    {/* Enhanced Mobile Nav */}
                    <div className="lg:hidden flex items-center">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-700 hover:text-green-600 hover:bg-green-50 p-2 transition-all duration-300 rounded-lg"
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-white/95 backdrop-blur-md w-80">
                                <SheetHeader className="border-b border-green-100 pb-4">
                                    <SheetTitle className="flex items-center text-xl font-bold text-green-600">
                                        <BookOpen className="h-6 w-6 mr-2" />
                                        Tusome
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Enhanced Mobile Menu */}
                                <div className="mt-8 space-y-1 px-2">
                                    {navItems.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 font-medium border-l-4 border-transparent hover:border-green-600 rounded-lg group"
                                        >
                                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                                {item.name}
                                            </span>
                                        </a>
                                    ))}
                                </div>

                                {/* Enhanced Mobile Auth Buttons */}
                                <div className="mt-8 space-y-3 px-2">
                                    <a href="/auth/signin" className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 py-3 font-medium transition-all duration-300"
                                            size="lg"
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Log In
                                        </Button>
                                    </a>
                                    <a href="/auth/signup" className="block">
                                        <Button
                                            className="w-full bg-green-600 text-white py-3 hover:bg-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group"
                                            size="lg"
                                        >
                                            <span className="flex items-center justify-center">
                                                Get Started
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </Button>
                                    </a>
                                </div>

                                {/* Mobile Footer */}
                                <div className="mt-12 pt-6 border-t border-green-100 px-2">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-2">Join 25K+ Kenyan students</p>
                                        <div className="flex justify-center space-x-4 text-xs text-gray-400">
                                            <span>CBC Aligned</span>
                                            <span>•</span>
                                            <span>M-Pesa Ready</span>
                                            <span>•</span>
                                            <span>All Counties</span>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default page