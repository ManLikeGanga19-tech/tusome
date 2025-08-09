'use client'
import React from 'react'
import { BookOpen, ChevronRight, Globe } from 'lucide-react'

function page() {
  return (
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-20 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' fill-opacity='0.1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div
                  className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 transition-all duration-1000 "
              >
                  <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center mb-6 group">
                          <div className="relative">
                              <BookOpen className="h-10 w-10 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-green-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <span className="ml-3 text-3xl font-black tracking-tight">Tusome</span>
                      </div>
                      <p className="text-gray-400 mb-8 max-w-md leading-relaxed text-lg">
                          Empowering Kenyan students with world-class education.
                          Join thousands of learners achieving academic excellence with Tusome.
                      </p>
                      <div className="flex space-x-6">
                          {['Facebook', 'Twitter', 'LinkedIn'].map((social, index) => (
                              <div
                                  key={social}
                                  className="w-12 h-12 bg-green-600 flex items-center justify-center hover:bg-green-700 transition-all duration-300 cursor-pointer group transform hover:scale-110"
                                  style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                  <span className="text-sm font-bold transition-transform duration-300 group-hover:scale-110">
                                      {social.charAt(0).toLowerCase()}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div
                      className="transition-all duration-1000 delay-200"
                  >
                      <h4 className="text-xl font-bold mb-6 text-green-400">Quick Links</h4>
                      <ul className="space-y-4">
                          {['About Us', 'Courses', 'Pricing', 'Success Stories', 'Blog'].map((link, index) => (
                              <li key={link}>
                                  <a
                                      href="#"
                                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                                      style={{ animationDelay: `${index * 0.1}s` }}
                                  >
                                      <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                                      {link}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>

                  <div
                      className="transition-all duration-1000 delay-400 "
                  >
                      <h4 className="text-xl font-bold mb-6 text-red-400">Support</h4>
                      <ul className="space-y-4">
                          {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'FAQs'].map((link, index) => (
                              <li key={link}>
                                  <a
                                      href="#"
                                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                                      style={{ animationDelay: `${index * 0.1}s` }}
                                  >
                                      <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                                      {link}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>

              <div className="border-t border-gray-800 pt-12">
                  <div
                      className="flex flex-col md:flex-row justify-between items-center transition-all duration-1000 delay-600 "
                  >
                      <p className="text-gray-400 text-lg mb-6 md:mb-0">
                          Copyright 2025 Tusome. All rights reserved. Made with passion for Kenyan students.
                      </p>
                      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                          <div className="flex items-center text-green-400 font-semibold">
                              <Globe className="h-5 w-5 mr-2" />
                              <span>Proudly Kenyan</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                              <span className="mr-2">Call:</span>
                              <span className="font-semibold">+254 700 123 456</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </footer>  )
}

export default page