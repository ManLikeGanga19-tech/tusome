'use client'

import { BookOpen, Lock, Star, Clock, Users, Globe, Beaker, Calculator, Palette, Book, Languages, Wrench, Crown, Play, ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Course categories with subjects
  const courseCategories = [
    {
      id: 'core',
      name: 'Core Subjects',
      icon: BookOpen,
      color: 'green',
      subjects: [
        { name: 'Mathematics', icon: Calculator, difficulty: 'Advanced', students: '800+', duration: '12 weeks', premium: true, description: 'Master algebra, calculus, and advanced mathematical concepts' },
        { name: 'English', icon: Book, difficulty: 'Intermediate', students: '120+', duration: '10 weeks', premium: true, description: 'Develop exceptional reading, writing, and communication skills' },
        { name: 'Kiswahili', icon: Globe, difficulty: 'Intermediate', students: '900+', duration: '8 weeks', premium: true, description: 'Master Kenya\'s national language with cultural context' },
        { name: 'Science and Technology', icon: Beaker, difficulty: 'Advanced', students: '700+', duration: '14 weeks', premium: true, description: 'Explore physics, chemistry, and modern technology applications' }
      ]
    },
    {
      id: 'languages',
      name: 'Languages',
      icon: Languages,
      color: 'blue',
      subjects: [
        { name: 'Arabic', icon: Globe, difficulty: 'Beginner', students: '100+', duration: '12 weeks', premium: false, description: 'Learn Arabic language and cultural foundations' },
        { name: 'French', icon: Globe, difficulty: 'Intermediate', students: '200+', duration: '10 weeks', premium: false, description: 'Master French conversation and grammar' },
        { name: 'German', icon: Globe, difficulty: 'Intermediate', students: '800+', duration: '12 weeks', premium: false, description: 'Comprehensive German language program' },
        { name: 'Mandarin', icon: Globe, difficulty: 'Beginner', students: '600+', duration: '14 weeks', premium: false, description: 'Introduction to Chinese language and culture' },
        { name: 'Indigenous Language', icon: Globe, difficulty: 'Beginner', students: '100+', duration: '8 weeks', premium: false, description: 'Preserve and learn local Kenyan languages' },
        { name: 'Foreign Languages', icon: Languages, difficulty: 'Various', students: '300+', duration: 'Flexible', premium: false, description: 'Multiple international language options' }
      ]
    },
    {
      id: 'religion',
      name: 'Religious Education',
      icon: Book,
      color: 'purple',
      subjects: [
        { name: 'Christian Religious Education', icon: Book, difficulty: 'Beginner', students: '400+', duration: '6 weeks', premium: false, description: 'Christian values, history, and teachings' },
        { name: 'Islamic Religious Education', icon: Book, difficulty: 'Beginner', students: '200+', duration: '6 weeks', premium: false, description: 'Islamic principles, history, and practices' },
        { name: 'Hindu Religious Education', icon: Book, difficulty: 'Beginner', students: '450+', duration: '6 weeks', premium: false, description: 'Hindu philosophy, traditions, and values' }
      ]
    },
    {
      id: 'technical',
      name: 'Technical Studies',
      icon: Wrench,
      color: 'orange',
      subjects: [
        { name: 'Pre-technical Studies', icon: Wrench, difficulty: 'Beginner', students: '300+', duration: '8 weeks', premium: false, description: 'Foundation for technical and engineering careers' },
        { name: 'Applied Sciences', icon: Beaker, difficulty: 'Advanced', students: '200+', duration: '12 weeks', premium: true, description: 'Practical application of scientific principles' },
        { name: 'Technical Studies', icon: Wrench, difficulty: 'Advanced', students: '100+', duration: '16 weeks', premium: true, description: 'Advanced technical skills and engineering concepts' }
      ]
    },
    {
      id: 'specialized',
      name: 'Specialized',
      icon: Star,
      color: 'red',
      subjects: [
        { name: 'Creative Arts', icon: Palette, difficulty: 'Intermediate', students: '200+', duration: '10 weeks', premium: false, description: 'Visual arts, music, and creative expression' },
        { name: 'Agriculture', icon: BookOpen, difficulty: 'Intermediate', students: '300+', duration: '12 weeks', premium: false, description: 'Modern farming techniques and agricultural science' },
        { name: 'Pure Sciences', icon: Beaker, difficulty: 'Advanced', students: '100+', duration: '14 weeks', premium: true, description: 'Advanced physics, chemistry, and biology' },
        { name: 'Humanities', icon: Book, difficulty: 'Intermediate', students: '200+', duration: '10 weeks', premium: false, description: 'History, geography, and social studies' },
        { name: 'Fasihi ya Kiswahili', icon: Book, difficulty: 'Advanced', students: '100+', duration: '8 weeks', premium: true, description: 'Advanced Kiswahili literature and poetry' },
        { name: 'English Literature', icon: Book, difficulty: 'Advanced', students: '100+', duration: '10 weeks', premium: true, description: 'Classic and contemporary English literary works' }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'core', name: 'Core Subjects' },
    { id: 'languages', name: 'Languages' },
    { id: 'religion', name: 'Religious Ed.' },
    { id: 'technical', name: 'Technical' },
    { id: 'specialized', name: 'Specialized' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCourses = selectedCategory === 'all'
    ? courseCategories
    : courseCategories.filter(category => category.id === selectedCategory);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-blue-200/20 transform rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-red-200/20 transform -rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
            Explore Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-600 mt-1 sm:mt-2">
              Course Catalog
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl lg:max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
            Discover comprehensive courses designed for Kenyan students. From core subjects to specialized fields,
            unlock your potential with our expertly crafted curriculum.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`transition-all duration-300 text-xs sm:text-sm ${selectedCategory === category.id
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-green-200 text-green-700 hover:bg-green-50'
                }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="space-y-8 sm:space-y-12">
          {filteredCourses.map((category, categoryIndex) => (
            <div key={category.id} className="transition-all duration-500" style={{ animationDelay: `${categoryIndex * 0.2}s` }}>
              {/* Category Header */}
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-gray-100">
                  <category.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${category.color}-600 mr-2 sm:mr-3`} />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{category.name}</h2>
                  <Badge variant="secondary" className="ml-2 sm:ml-3 text-xs">
                    {category.subjects.length} courses
                  </Badge>
                </div>
              </div>

              {/* Subject Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {category.subjects.map((subject, index) => (
                  <Card
                    key={subject.name}
                    className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl transform hover:scale-105 ${subject.premium ? 'border-2 border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-white' : 'bg-white/80 backdrop-blur-sm'
                      }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {subject.premium && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <subject.icon className={`h-8 w-8 sm:h-10 sm:w-10 text-${category.color}-600 transition-transform duration-300 group-hover:scale-110`} />
                        <Badge className={getDifficultyColor(subject.difficulty)} variant="secondary">
                          {subject.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {subject.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                        {subject.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {subject.students} students
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {subject.duration}
                        </div>
                      </div>

                      {subject.premium ? (
                        <Button
                          disabled
                          className="w-full bg-gray-300 text-gray-500 cursor-not-allowed text-xs sm:text-sm flex items-center justify-center gap-2"
                        >
                          <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                          Unlock with Premium
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex items-center justify-center gap-2 group"
                        >
                          <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                          Start Course
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      )}
                    </CardContent>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Premium CTA Section */}
        <div className="mt-16 sm:mt-20 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 via-white to-red-600 text-white border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-gray-800/80 to-red-600/90"></div>
            <CardContent className="relative z-10 p-6 sm:p-8 lg:p-12">
              <Crown className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-yellow-300" />
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                Unlock Premium Content
              </h3>
              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
                Get access to advanced courses in Mathematics, Sciences, Literature and more.
                Take your learning to the next level with expert-designed premium content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                >
                  View Pricing Plans
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto transition-all duration-300"
                >
                  Start Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default CoursesPage;