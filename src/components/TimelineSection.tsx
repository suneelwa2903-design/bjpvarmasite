'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Award, Users } from 'lucide-react'
import { useState } from 'react'

const TimelineSection = () => {
  const timelineEvents = [
    {
      year: "2024",
      title: "Reassumed charge as Union Minister",
      description: "Shri reassumed his role as Union Minister for the second consecutive tenure on June 11, 2024.",
      icon: Award,
      color: "bg-blue-500"
    },
    {
      year: "2024", 
      title: "Member of Parliament (Lok Sabha)",
      description: "Scored an even bigger victory in the Lok Sabha Election 2024 with a vast margin of 744,716 votes.",
      icon: Users,
      color: "bg-green-500"
    },
    {
      year: "2021",
      title: "Assume Charge as Minister of Cooperation",
      description: "When Prime Minister formed the Ministry of Cooperation on July 6, 2021, was given its charge.",
      icon: MapPin,
      color: "bg-purple-500"
    },
    {
      year: "2019",
      title: "Union Minister",
      description: "Took oath as Union Minister of Home, bringing revolutionary changes in governance and security.",
      icon: Award,
      color: "bg-orange-500"
    },
    {
      year: "2014",
      title: "National President",
      description: "Made the Party's National President after contributing decisively to the nationwide victory.",
      icon: Users,
      color: "bg-red-500"
    }
  ]

  // Use only curated milestone years (keep order as provided above)
  const milestones = timelineEvents

  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-orange mb-6">
            Timeline
          </h2>
          <div className="w-24 h-1 bg-brand-orange mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A journey of dedication, service, and transformative leadership spanning decades
          </p>
        </motion.div>

        {/* Horizontal timeline (curated milestones only) */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="relative min-w-max py-10">
              {/* line */}
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-brand-orange/60 to-brand-orange/20" />

              <div className="flex gap-10 px-6">
                {milestones.map((evt, idx) => {
                  const IconComp = evt.icon
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      key={`${evt.year}-${idx}`}
                      className="relative flex flex-col items-center min-w-[220px] focus:outline-none"
                    >
                      {/* marker */}
                      <div className={`z-10 w-3 h-3 rounded-full shadow ring-4 ring-white ${idx === activeIdx ? 'bg-brand-orange' : 'bg-gray-300'}`} />
                      <div className={`mt-3 text-sm font-semibold ${idx === activeIdx ? 'text-brand-orange' : 'text-gray-700'}`}>{evt.year}</div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: idx === activeIdx ? 1 : 0.6, y: 0, scale: idx === activeIdx ? 1 : 0.98 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className={`mt-5 rounded-lg p-4 w-[280px] border ${idx === activeIdx ? 'bg-white shadow-md border-brand-orange/40' : 'bg-white/90 border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 ${evt.color} rounded-full flex items-center justify-center`}>
                            <IconComp className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-brand-orange font-bold">{evt.year}</div>
                        </div>
                        <div className="text-base font-semibold text-gray-900 mb-1">{evt.title}</div>
                        <div className="text-sm text-gray-600 leading-relaxed">{evt.description}</div>
                      </motion.div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Achievement Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-navy-900 mb-2">40+ Years</h3>
            <p className="text-gray-600">Of dedicated public service</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Award className="h-12 w-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-navy-900 mb-2">25+ Elections</h3>
            <p className="text-gray-600">Undefeated electoral record</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-navy-900 mb-2">1M+ People</h3>
            <p className="text-gray-600">Served with dedication</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TimelineSection

