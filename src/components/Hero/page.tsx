import { ArrowRight, Award, Star, Users } from 'lucide-react'
import React from 'react'

function page() {
  return (
      <section
          id="home"
          className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 pt-20 flex items-center overflow-hidden"
      >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 transform rotate-45 animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200/30 transform rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                  <div
                      className="transition-all duration-1000  opacity-100 translate-y-0"
                  >
                      <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
                          Learn, Grow, and Excel with
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-2">
                              Tusome
                          </span>
                      </h1>
                  </div>

                  <div
                      className="transition-all duration-1000 delay-300 "
                  >
                      <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                          Empowering Kenyan students with world-class educational content,
                          personalized learning paths, and culturally relevant resources to achieve academic excellence.
                      </p>
                  </div>

                  <div
                      className="transition-all duration-1000 delay-500"
                  >
                      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                          <button className="group bg-green-600 text-white px-10 py-4 hover:bg-green-700 transition-all duration-300 font-semibold text-lg flex items-center relative overflow-hidden">
                              <span className="relative z-10">Start Learning Today</span>
                              <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                              <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 transform translate-x-full transition-transform duration-300 group-hover:translate-x-0"></div>
                          </button>
                          <button className="group border-2 border-red-600 text-red-600 px-10 py-4 hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold text-lg relative overflow-hidden">
                              <span className="relative z-10">Watch Demo</span>
                              <div className="absolute inset-0 bg-red-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"></div>
                          </button>
                      </div>
                  </div>

                  {/* Enhanced stats section */}
                  <div
                      className="transition-all duration-1000 delay-700"
                  >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                          {[
                              { icon: Users, number: '10,000+', label: 'Active Students', color: 'green' },
                              { icon: Award, number: '500+', label: 'Course Modules', color: 'red' },
                              { icon: Star, number: '4.9/5', label: 'Student Rating', color: 'yellow' }
                          ].map((stat, index) => (
                              <div
                                  key={index}
                                  className="group bg-white/80 backdrop-blur-sm p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:scale-105"
                                  style={{ animationDelay: `${index * 0.2}s` }}
                              >
                                  <stat.icon className={`h-14 w-14 text-${stat.color}-600 mx-auto mb-6 transition-transform duration-300 group-hover:scale-110`} />
                                  <h3 className="text-3xl font-black text-gray-900 mb-3">{stat.number}</h3>
                                  <p className="text-gray-600 font-medium">{stat.label}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>  )
}

export default page