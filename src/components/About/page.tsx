'use client'

import React from 'react'
import { Check, Globe, Clock, BookOpen, Trophy } from 'lucide-react'

function page() {
  return (
      <section id="about" className="py-24 bg-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div
                  className="text-center mb-20 transition-all duration-1000 "
              >
                  <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
                      About Tusome
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                      Tusome (Swahili for "Let's Learn") is Kenya's premier educational platform,
                      designed specifically for Kenyan students following the CBC and 8-4-4 curricula.
                  </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                  <div
                      className="transition-all duration-1000 delay-300 "
                  >
                      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Mission</h3>
                      <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                          We believe every Kenyan student deserves access to quality education that celebrates
                          our rich culture while preparing them for global success. Tusome bridges the gap
                          between traditional learning and modern educational technology.
                      </p>
                      <div className="space-y-6">
                          {[
                              'Curriculum-aligned content for all educational levels',
                              'Interactive lessons in English and Kiswahili',
                              'Culturally relevant examples and case studies',
                              'Progress tracking and personalized learning paths'
                          ].map((feature, index) => (
                              <div
                                  key={index}
                                  className="flex items-start group"
                                  style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 mr-4 mt-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                      <Check className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="text-gray-700 text-lg leading-relaxed">{feature}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div
                      className="transition-all duration-1000 delay-500 "
                  >
                      <div className="bg-gradient-to-br from-green-100 via-white to-red-100 p-10 shadow-xl border border-gray-100">
                          <div className="grid grid-cols-2 gap-8">
                              {[
                                  { icon: Globe, title: 'All Counties', desc: 'Serving students across Kenya', color: 'green' },
                                  { icon: Clock, title: '24/7 Access', desc: 'Learn at your own pace', color: 'red' },
                                  { icon: BookOpen, title: 'Expert Content', desc: 'Created by Kenyan educators', color: 'yellow' },
                                  { icon: Trophy, title: 'Proven Results', desc: 'Improved academic performance', color: 'blue' }
                              ].map((item, index) => (
                                  <div
                                      key={index}
                                      className="text-center group hover:bg-white p-6 transition-all duration-300 hover:shadow-lg"
                                  >
                                      <item.icon className={`h-12 w-12 text-${item.color}-600 mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`} />
                                      <h4 className="font-bold text-gray-900 mb-3 text-lg">{item.title}</h4>
                                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>  )
}

export default page