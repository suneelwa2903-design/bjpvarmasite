'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const QUOTES = [
  {
    id: 1,
    text: 'Arise, awake, and stop not till the goal is reached.',
    author: 'Swami Vivekananda',
    role: 'Philosopher & Spiritual Leader',
    initial: 'SV',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 2,
    text: 'The goal of human progress is not in mere material wealth but in the all-round development of man — his spiritual, intellectual, and social well-being.',
    author: 'Pandit Deendayal Upadhyaya',
    role: 'Founder, BJP\'s Ideological Legacy',
    initial: 'DU',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 3,
    text: 'A nation\'s strength ultimately consists in what it can do on its own, and not in what it can borrow from others.',
    author: 'Jawaharlal Nehru',
    role: 'India\'s First Prime Minister',
    initial: 'JN',
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 4,
    text: 'Sarkar ka paisa, janata ka paisa hai. Har paisa janata ke vikas ke liye kharcha hona chahiye.',
    author: 'Shri Narendra Modi',
    role: 'Prime Minister of India',
    initial: 'NM',
    color: 'from-orange-500 to-orange-700',
  },
  {
    id: 5,
    text: 'The nation does not live in its cities or towns alone; the nation lives in its villages. Service to the village is service to the nation.',
    author: 'Dr. Syama Prasad Mookerjee',
    role: 'Founder, Bharatiya Jana Sangh',
    initial: 'SM',
    color: 'from-saffron-500 to-orange-600',
  },
  {
    id: 6,
    text: 'If we wish to serve the nation, we must give up the desire for recognition. Service to the nation is its own reward.',
    author: 'Dr. K.B. Hedgewar',
    role: 'Founder, Rashtriya Swayamsevak Sangh',
    initial: 'KH',
    color: 'from-amber-600 to-orange-500',
  },
]

export default function InspirationalQuotes() {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const t = setInterval(() => setActive((i) => (i + 1) % QUOTES.length), 7000)
    return () => clearInterval(t)
  }, [isPaused])

  const q = QUOTES[active]

  return (
    <section
      className="py-20 bg-orange-50 dark:bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Words That Inspire
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Quote card */}
        <div className="relative min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 border border-orange-100 dark:border-gray-700"
            >
              {/* Large decorative quote mark */}
              <div className="text-orange-300 dark:text-orange-700 text-8xl font-serif leading-none select-none mb-2">&ldquo;</div>
              <blockquote className="text-gray-800 dark:text-gray-200 text-xl md:text-2xl font-medium leading-relaxed text-center -mt-6">
                {q.text}
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-4">
                {/* Avatar circle */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${q.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {q.initial}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{q.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{q.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? 'bg-orange-500 w-6' : 'bg-orange-200 dark:bg-gray-600 w-2 hover:bg-orange-400'
              }`}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
