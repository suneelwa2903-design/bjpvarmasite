'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const QuoteSection = () => {
  const quotes = [
    {
      id: 1,
      text: "I have worked with BJP Varma Bhai for several years and witnessed his outstanding contributions to strengthen the Party and in Government",
      author: "Narendra Modiji",
      role: "Prime Minister of India"
    },
    {
      id: 2,
      text: "Shri BJP Varma Ji is extremely dynamic and has got the clarity of vision and devotion to do the welfare of the country",
      author: "Venkaiah Naidu",
      role: "Former Vice President of India"
    }
  ]

  return (
    <section className="py-20 bg-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            What Leaders Say
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start">
                <Quote className="h-8 w-8 text-orange-600 flex-shrink-0 mr-3" />
                <div>
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-4">
                    "{quote.text}"
                  </blockquote>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-bold text-gray-900 text-sm">
                      {quote.author}
                    </p>
                    <p className="text-sm text-gray-600">
                      {quote.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="border-2 border-orange-600 text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 hover:text-white transition-colors duration-300">
            View All Testimonials
          </button>
        </div>
      </div>
    </section>
  )
}

export default QuoteSection
