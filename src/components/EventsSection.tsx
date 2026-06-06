'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, ChevronRight } from 'lucide-react'
import ClientOnly from './ClientOnly'

const EventsSection = () => {
  const [activeTab, setActiveTab] = useState('latest')

  const eventTabs = [
    { id: 'latest', label: 'Latest' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' }
  ]

  const events = {
    latest: [
      {
        id: 1,
        title: 'Inauguration of NIPER Ahmedabad New Building',
        date: 'Sep 30, 2023',
        time: '10:00 AM',
        location: 'Ahmedabad, Gujarat',
        type: 'Inauguration',
        attendees: '500+',
        description: 'Inaugurated the new building of National Institute of Pharmaceutical Education and Research, Ahmedabad.'
      },
      {
        id: 2,
        title: 'Development Projects of AMC and AUDA',
        date: 'Sep 30, 2023',
        time: '2:00 PM',
        location: 'Ahmedabad, Gujarat',
        type: 'Development',
        attendees: '1000+',
        description: 'Inaugurated various development projects of Ahmedabad Municipal Corporation and Ahmedabad Urban Development Authority.'
      }
    ],
    upcoming: [
      {
        id: 1,
        title: 'National Security Conference',
        date: 'Dec 15, 2024',
        time: '9:00 AM',
        location: 'New Delhi',
        type: 'Conference',
        attendees: '200+',
        description: 'Addressing national security challenges and future strategies.'
      },
      {
        id: 2,
        title: 'Cooperative Movement Summit',
        date: 'Dec 20, 2024',
        time: '10:30 AM',
        location: 'Mumbai, Maharashtra',
        type: 'Summit',
        attendees: '300+',
        description: 'Discussing the future of cooperative movement in India.'
      },
      {
        id: 3,
        title: 'Rural Development Initiative Launch',
        date: 'Jan 10, 2025',
        time: '11:00 AM',
        location: 'Bangalore, Karnataka',
        type: 'Launch',
        attendees: '400+',
        description: 'Launching new rural development initiatives and programs.'
      }
    ],
    past: [
      {
        id: 1,
        title: 'Bastar Dussehra Mahotsav Address',
        date: 'Oct 4, 2025',
        time: '6:00 PM',
        location: 'Bastar, Chhattisgarh',
        type: 'Cultural',
        attendees: '5000+',
        description: 'Addressed the Bastar Dussehra Mahotsav celebration.'
      },
      {
        id: 2,
        title: 'Khadi Kaarigar Mahotsav',
        date: 'Oct 3, 2025',
        time: '3:00 PM',
        location: 'Haryana',
        type: 'Cultural',
        attendees: '2000+',
        description: 'Participated in Khadi Kaarigar Mahotsav celebrations.'
      },
      {
        id: 3,
        title: 'Goa Development Projects Launch',
        date: 'Oct 4, 2025',
        time: '4:30 PM',
        location: 'Goa',
        type: 'Development',
        attendees: '1500+',
        description: 'Addressed the launch of Mhaje Ghar Yojana and various projects in Goa.'
      }
    ]
  }

  const currentEvents = events[activeTab as keyof typeof events] || []

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Inauguration':
        return 'bg-blue-100 text-blue-800'
      case 'Development':
        return 'bg-green-100 text-green-800'
      case 'Conference':
        return 'bg-purple-100 text-purple-800'
      case 'Summit':
        return 'bg-orange-100 text-orange-800'
      case 'Launch':
        return 'bg-red-100 text-red-800'
      case 'Cultural':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-orange mb-6">
            Events
          </h2>
          <div className="w-24 h-1 bg-brand-orange mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with latest events, upcoming engagements, and past activities
          </p>
        </motion.div>

        {/* Event Tabs */}
        <ClientOnly
          fallback={
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-lg p-2 shadow-lg">
                {eventTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="px-8 py-3 rounded-md font-medium text-gray-700"
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-2 shadow-lg">
              {eventTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-brand-orange text-white shadow-md'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ClientOnly>

        {/* Events Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {currentEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            >
              {/* Event Header */}
              <div className="bg-gradient-to-r from-navy-900 to-navy-700 p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-secondary-300 transition-colors duration-300">
                  {event.title}
                </h3>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.date}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <p className="text-sm text-gray-700">{event.location}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <p className="text-sm text-gray-700">{event.attendees} attendees</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="mt-6">
                  <button className="w-full bg-navy-900 text-white py-2 px-4 rounded-md hover:bg-navy-800 transition-colors duration-300 font-medium">
                    {activeTab === 'upcoming' ? 'Register Interest' : 'View Details'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Events State */}
        {currentEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No {activeTab} events at the moment
            </h3>
            <p className="text-gray-500">
              Check back later for updates on upcoming events and activities.
            </p>
          </motion.div>
        )}

        {/* Event Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <Calendar className="h-12 w-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-navy-900 mb-2">150+</h3>
            <p className="text-gray-600">Events Organized</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <Users className="h-12 w-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-navy-900 mb-2">500K+</h3>
            <p className="text-gray-600">Total Attendees</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <MapPin className="h-12 w-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-navy-900 mb-2">25+</h3>
            <p className="text-gray-600">Cities Covered</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default EventsSection

