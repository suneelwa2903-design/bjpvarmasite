'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, Target } from 'lucide-react'

const ImpactSection = () => {
  const [counters, setCounters] = useState({
    years: 0,
    elections: 0,
    people: 0,
    achievements: 0
  })

  const targetValues = {
    years: 40,
    elections: 25,
    people: 1000000,
    achievements: 500
  }

  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps

        setCounters({
          years: Math.floor(targetValues.years * progress),
          elections: Math.floor(targetValues.elections * progress),
          people: Math.floor(targetValues.people * progress),
          achievements: Math.floor(targetValues.achievements * progress)
        })

        if (step >= steps) {
          clearInterval(timer)
          setCounters(targetValues)
        }
      }, stepDuration)
    }

    animateCounters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // targetValues is a constant, no need to include it

  const impactData = [
    {
      icon: TrendingUp,
      value: counters.years,
      label: "Years in Public Life",
      description: "Journey from a polling booth worker to Union Minister",
      color: "text-brand-orange",
      bgColor: "bg-orange-50"
    },
    {
      icon: Users,
      value: counters.people.toLocaleString(),
      label: "People's Person",
      description: "25 years as elected representatives serving people",
      color: "text-brand-orange",
      bgColor: "bg-orange-50"
    },
    {
      icon: Award,
      value: counters.elections,
      label: "Election Victories",
      description: "Undefeated record with increasing margins",
      color: "text-brand-orange",
      bgColor: "bg-orange-50"
    },
    {
      icon: Target,
      value: counters.achievements,
      label: "Key Achievements",
      description: "Transforming governance and public service",
      color: "text-brand-orange",
      bgColor: "bg-orange-50"
    }
  ]

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
            IMPACT
          </h2>
          <div className="w-24 h-1 bg-brand-orange mx-auto mb-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {impactData.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-20 h-20 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-10 w-10 ${item.color}`} />
                </div>
                
                <div className="space-y-4">
                  <div className="text-4xl md:text-5xl font-bold text-navy-900">
                    {typeof item.value === 'string' ? item.value : item.value}
                    {typeof item.value === 'number' && (
                      <span className="text-secondary-500">+</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-navy-900">
                    {item.label}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Detailed Achievement Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-navy-900 mb-4">
              A Journey from Booth Karyakarta to Union Minister
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              A sift through the pages of history may lead one to the fact that 
              the party rewards its loyal and hardworking karyakartas. In this 
              journey, dedication and tireless service for the party and its 
              ideology has been the cornerstone.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                <span className="text-gray-700">Started service at age 13 in 1977</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                <span className="text-gray-700">Managed election campaigns for senior leaders</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                <span className="text-gray-700">Undefeated electoral record with increasing margins</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-navy-900 mb-4">
              Key Achievements & Transformations
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Revolutionary changes in governance, ensuring peace and stability 
              across regions, and implementing comprehensive reforms in various 
              sectors.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                <span className="text-gray-700">Peace and stability in Jammu & Kashmir</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                <span className="text-gray-700">Resolution of Northeast border disputes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                <span className="text-gray-700">Modernization of criminal justice system</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ImpactSection

