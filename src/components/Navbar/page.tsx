'use client'

import { BookOpen, X, Menu } from 'lucide-react';
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

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/95 backdrop-blur-sm shadow-lg'
                    : 'bg-white/90'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center group">
                            <div className="relative">
                                <BookOpen className="h-10 w-10 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <span className="ml-3 text-2xl font-bold text-gray-900 tracking-tight">Tusome</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-1">
                        {['Home', 'About', 'Pricing'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="relative px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 group inline-flex h-10 w-max items-center justify-center rounded-md text-sm disabled:pointer-events-none disabled:opacity-50"
                            >
                                {item}
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
                            </a>
                        ))}
                        <Button
                            className="ml-6 bg-green-600 text-white px-8 py-3 hover:bg-green-700 transition-all duration-300 font-semibold relative overflow-hidden group"
                            size="lg"
                        >
                            <span className="relative z-10">Get Started</span>
                            <div className="absolute inset-0 bg-green-700 transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></div>
                        </Button>
                    </div>

                    {/* Mobile Nav (Sheet) */}
                    <div className="md:hidden flex items-center">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-700 hover:text-green-600 p-2 transition-colors duration-300"
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-white">
                                <SheetHeader>
                                    <SheetTitle className="text-xl font-bold text-green-600">Tusome</SheetTitle>
                                </SheetHeader>

                                {/* Added padding here */}
                                <div className="mt-6 space-y-3 px-4">
                                    {['Home', 'About', 'Pricing'].map((item) => (
                                        <a
                                            key={item}
                                            href={`#${item.toLowerCase()}`}
                                            className="block px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 font-medium border-l-4 border-transparent hover:border-green-600 rounded-md"
                                        >
                                            {item}
                                        </a>
                                    ))}
                                    <Button
                                        className="w-full mt-4 bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-all duration-300 font-semibold"
                                        size="lg"
                                    >
                                        Get Started
                                    </Button>
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
