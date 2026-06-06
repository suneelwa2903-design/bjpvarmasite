'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Mic, Briefcase, Globe } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

const ActivitiesSection = () => {
  const activities = [
    {
      id: 1,
      title: 'Addressing the Nation on Indigenous Products',
      date: 'Oct 15, 2025',
      time: '11:00 AM',
      location: 'New Delhi',
      type: 'Speech',
      description: 'An important address on the significance of स्वदेशी and supporting local businesses.',
      image: '/images/slide1.jpg'
    },
    {
      id: 2,
      title: 'Ethanol Blending Initiative Launch',
      date: 'Oct 10, 2025',
      time: '2:00 PM',
      location: 'Maharashtra',
      type: 'Event',
      description: 'Launching a transformative ethanol blending program for sugar sector.',
      image: '/images/slide2.jpg'
    },
    {
      id: 3,
      title: 'Rural Development Meeting',
      date: 'Oct 5, 2025',
      time: '10:00 AM',
      location: 'Chhattisgarh',
      type: 'Meeting',
      description: 'Discussing cooperative movement strategies for rural empowerment.',
      image: '/images/slide3.jpg'
    },
    {
      id: 4,
      title: 'Public Rally - Connecting with Citizens',
      date: 'Oct 1, 2025',
      time: '4:00 PM',
      location: 'Gujarat',
      type: 'Rally',
      description: 'Connecting with the people and sharing vision for development.',
      image: '/images/slide4.jpg'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Activities & Events
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="md:flex">
                {/* Image - Left side */}
                <div className="relative md:w-72 h-64 bg-gray-200 flex-shrink-0">
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 288px"
                  />
                </div>

                {/* Content - Right side */}
                <div className="flex-1 p-6">
                  {/* Header with Date and Type */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{activity.date}</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {activity.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {activity.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">
                    {activity.description}
                  </p>

                  {/* Location and Time */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {activity.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {activity.time}
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="mt-6">
                    <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-300">
            View All Activities
          </button>
        </div>
      </div>
    </section>
  )
}

export default ActivitiesSection
