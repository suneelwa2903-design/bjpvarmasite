'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowRight, type LucideIcon } from 'lucide-react'

interface Initiative {
  id: number
  title: string
  category: string
  date: string
  description: string
  icon: LucideIcon
  color: string
  achievements: string[]
}

interface InitiativeCardProps {
  initiative: Initiative
}

export default function InitiativeCard({ initiative }: InitiativeCardProps) {
  const Icon = initiative.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Color Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${initiative.color}`}></div>

      <div className="p-8">
        {/* Icon and Category */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${initiative.color} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {initiative.category}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Calendar className="h-3 w-3" />
              <span>{initiative.date}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
          {initiative.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 line-clamp-2">
          {initiative.description}
        </p>

        {/* Achievements */}
        <div className="space-y-2 mb-6">
          {initiative.achievements.slice(0, 3).map((achievement, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${initiative.color}`}></div>
              <span>{achievement}</span>
            </div>
          ))}
        </div>

        {/* View Details Link */}
        <div className="flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-4 transition-all cursor-pointer">
          <span>View Details</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${initiative.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
    </motion.div>
  )
}

