'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { Camera, Video, X } from 'lucide-react'

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const galleryItems = [
    { id: 1, src: '/images/slide1.jpg', title: 'Prayers at Sai Baba Temple', type: 'image', category: 'spiritual' },
    { id: 2, src: '/images/slide2.jpg', title: 'Addressing Public Rally', type: 'image', category: 'rally' },
    { id: 3, src: '/images/slide3.jpg', title: 'Government Event', type: 'image', category: 'government' },
    { id: 4, src: '/images/slide4.jpg', title: 'Community Interaction', type: 'image', category: 'community' },
    { id: 5, src: '/images/slide5.jpg', title: 'Cultural Celebration', type: 'image', category: 'cultural' },
    { id: 6, src: '/images/slide1.jpg', title: 'Launch Event', type: 'image', category: 'rally' },
    { id: 7, src: '/images/slide2.jpg', title: 'Prayer Gathering', type: 'image', category: 'spiritual' },
    { id: 8, src: '/images/slide3.jpg', title: 'Cabinet Meeting', type: 'image', category: 'government' },
  ]

  const categories = [
    { id: 'all', label: 'All', icon: Camera },
    { id: 'spiritual', label: 'Spiritual', icon: Camera },
    { id: 'rally', label: 'Rallies', icon: Video },
    { id: 'government', label: 'Government', icon: Camera },
    { id: 'community', label: 'Community', icon: Camera },
    { id: 'cultural', label: 'Cultural', icon: Camera },
  ]

  const filteredItems = activeTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeTab)

  return (
    <>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Photo Gallery
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Moments and memories from public life
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
                    activeTab === category.id
                      ? 'bg-brand-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </button>
              )
            })}
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                onClick={() => setSelectedImage(item.src)}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                  <p className="text-white text-center px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-semibold">
                    {item.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View More Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button className="bg-brand-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-300 shadow-md">
              View All Photos
            </button>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null) }}
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Gallery"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default GallerySection
