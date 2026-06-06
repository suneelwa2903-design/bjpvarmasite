'use client'

import { useState } from 'react'
import { Play, Volume2, VolumeX, Sun, Moon, Type } from 'lucide-react'
import ClientOnly from './ClientOnly'

const HeroSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLargeFont, setIsLargeFont] = useState(false)

  const statements = [
    "A Nationalist to the Core",
    "A Religious Man", 
    "A Family Man",
    "Keen Student of History and Culture",
    "Lover of Indian Art & Culture"
  ]

  const videos = [
    "Minister Speaking on the Ideology of the BJP",
    "Minister Speaking on the Life and Works Adi Shankaracharya", 
    "Minister Speaking on Jammu & Kashmir Issue",
    "Minister Speaking on Prime Minister Narendra Modi"
  ]

  return (
    <section className="relative min-h-screen bg-white">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Video Player */}
          <div className="relative">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              {/* Video Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Play className="h-10 w-10 text-brand-orange ml-1" />
                  </div>
                  <p className="text-white text-lg font-medium">Video Background</p>
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all duration-200">
                    {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                  </button>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* IMPACT Button */}
            <div className="mt-8">
              <button className="bg-brand-orange text-white px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wide hover:bg-orange-600 transition-colors duration-300 shadow-lg">
                IMPACT
              </button>
            </div>
          </div>

          {/* Right Side - Main Headline */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-brand-orange leading-tight">
                Minister Shri BJP Varma Speaking on Prime Minister Narendra Modi
              </h1>
              
              {/* Video List */}
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{video}</h3>
                        <p className="text-gray-600 text-sm">Click to play video</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listen · Act · Share - horizontal pill (bottom-right) */}
      <div className="fixed right-4 bottom-6 z-50">
        <div className="bg-brand-orange text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-4">
          <button className="text-white hover:text-orange-200 transition-colors duration-200 font-medium uppercase tracking-wide">Listen</button>
          <span className="h-4 w-px bg-white/50" />
          <button className="text-white hover:text-orange-200 transition-colors duration-200 font-medium uppercase tracking-wide">Act</button>
          <span className="h-4 w-px bg-white/50" />
          <button className="text-white hover:text-orange-200 transition-colors duration-200 font-medium uppercase tracking-wide">Share</button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

