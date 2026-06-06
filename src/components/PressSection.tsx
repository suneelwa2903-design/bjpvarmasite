'use client'

import { motion } from 'framer-motion'
import { Newspaper, Mic, Edit, MessageSquare, ExternalLink } from 'lucide-react'

const PressSection = () => {
  const pressCategories = [
    {
      icon: Newspaper,
      title: 'News',
      count: 45,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Mic,
      title: 'Interviews',
      count: 23,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Edit,
      title: 'Editorials',
      count: 18,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: MessageSquare,
      title: 'Press Releases',
      count: 67,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const latestPress = [
    {
      title: 'Ethanol blending key to sugar sector turnaround',
      date: 'Oct 05, 2025',
      category: 'News',
      excerpt: 'Highlighting the importance of ethanol blending in transforming the sugar sector and supporting farmers.'
    },
    {
      title: 'Modi govt ensuring farmers welfare by strengthening sugar mills',
      date: 'Oct 05, 2025',
      category: 'Press Release',
      excerpt: 'Government initiatives focused on farmer welfare through comprehensive sugar mill strengthening programs.'
    },
    {
      title: 'स्वदेशी अपनाते हुए दिवाली मनाएं - देश की जनता से अपील',
      date: 'Oct 05, 2025',
      category: 'Message',
      excerpt: 'An appeal to celebrate Diwali by embracing indigenous products and supporting local businesses.'
    },
    {
      title: 'Rahul Gandhi, Lalu Prasad Yadav keen to secure voting rights for infiltrators',
      date: 'Sep 27, 2025',
      category: 'Statement',
      excerpt: 'Addressing concerns about voting rights and national security in the political discourse.'
    },
    {
      title: 'Cong, RJD want voting rights for infiltrators, NDA will expel them',
      date: 'Sep 27, 2025',
      category: 'Response',
      excerpt: 'Clear stance on national security and immigration policies.'
    },
    {
      title: 'Mahila, Modi, Mandir: Ready for Bihar poll plank',
      date: 'Sep 27, 2025',
      category: 'Election Strategy',
      excerpt: 'Strategic approach for upcoming elections focusing on key themes and voter engagement.'
    }
  ]

  const popularPress = [
    {
      title: 'NEP\'s roots in Santiniketan education model',
      date: 'May 10, 2023',
      category: 'Education'
    },
    {
      title: 'Democracy reached to grassroots level in India',
      date: 'Mar 02, 2023',
      category: 'Governance'
    },
    {
      title: 'Use tech to maintain maximum reach, speed in governance',
      date: 'Mar 04, 2023',
      category: 'Technology'
    },
    {
      title: 'गृहमंत्री ने गुरुदेव को दी श्रद्धांजलि',
      date: 'May 09, 2023',
      category: 'Tribute'
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
            Press
          </h2>
          <div className="w-24 h-1 bg-brand-orange mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest news, interviews, and official statements
          </p>
        </motion.div>

        {/* Press Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {pressCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-16 h-16 ${category.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${category.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{category.title}</h3>
                <p className="text-2xl font-bold text-secondary-500">{category.count}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Latest Press */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-navy-900 mb-8">Latest Press</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPress.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-secondary-500 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {item.category}
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-navy-600 transition-colors duration-300" />
                </div>
                
                <h4 className="text-lg font-semibold text-navy-900 mb-3 group-hover:text-navy-700 transition-colors duration-300">
                  {item.title}
                </h4>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {item.excerpt}
                </p>
                
                <p className="text-sm text-gray-500">{item.date}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Press */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-navy-900 mb-8">Popular Press</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularPress.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300 group cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center">
                    <Newspaper className="h-6 w-6 text-navy-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-navy-900 group-hover:text-navy-700 transition-colors duration-300">
                    {item.title}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">{item.date}</span>
                    <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-navy-600 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
            <button className="bg-brand-orange text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold">
              View All Press Coverage
            </button>
        </motion.div>
      </div>
    </section>
  )
}

export default PressSection

