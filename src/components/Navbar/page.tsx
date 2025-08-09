'use client'

import { BookOpen, X, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react'

function page() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  return (
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white/90'
          }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-20">
                  <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center group">
                          <div className="relative">
                              <BookOpen className="h-10 w-10 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-green-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <span className="ml-3 text-2xl font-bold text-gray-900 tracking-tight">Tusome</span>
                      </div>
                  </div>

                  <div className="hidden md:flex items-center space-x-1">
                      {['Home', 'About', 'Pricing'].map((item, index) => (
                          <a
                              key={item}
                              href={`#${item.toLowerCase()}`}
                              className="relative px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-300 group"
                          >
                              {item}
                              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
                          </a>
                      ))}
                      <button className="ml-6 bg-green-600 text-white px-8 py-3 hover:bg-green-700 transition-all duration-300 font-semibold relative overflow-hidden group">
                          <span className="relative z-10">Get Started</span>
                          <div className="absolute inset-0 bg-green-700 transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></div>
                      </button>
                  </div>

                  <div className="md:hidden flex items-center">
                      <button
                          onClick={() => setIsOpen(!isOpen)}
                          className="text-gray-700 hover:text-green-600 p-2 transition-colors duration-300"
                      >
                          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                      </button>
                  </div>
              </div>
          </div>

          {/* Mobile menu with enhanced animations */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden bg-white border-t border-gray-100`}>
              <div className="px-4 py-6 space-y-3">
                  {['Home', 'About', 'Pricing'].map((item, index) => (
                      <a
                          key={item}
                          href={`#${item.toLowerCase()}`}
                          className="block px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 font-medium border-l-4 border-transparent hover:border-green-600"
                          style={{ animationDelay: `${index * 0.1}s` }}
                      >
                          {item}
                      </a>
                  ))}
                  <button className="w-full mt-4 bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-all duration-300 font-semibold">
                      Get Started
                  </button>
              </div>
          </div>
      </nav>
  )
}

export default page