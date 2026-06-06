'use client'

import { motion } from 'framer-motion'
import { Twitter, Mail, Share2, Heart, MessageCircle, Repeat2 } from 'lucide-react'
import ClientOnly from './ClientOnly'

const SocialSection = () => {
  const socialPosts = [
    {
      id: 1,
      content: "Today I had the privilege of addressing the nation on the importance of indigenous products and celebrating our cultural heritage. Let us all embrace 'स्वदेशी' this Diwali and support local businesses. #Swadeshi #Diwali #SupportLocal",
      timestamp: "2 hours ago",
      likes: 12500,
      retweets: 3200,
      replies: 890
    },
    {
      id: 2,
      content: "Proud to announce the successful launch of ethanol blending initiatives that are transforming our sugar sector. This will not only benefit farmers but also contribute to our energy security goals. #FarmersFirst #EnergySecurity",
      timestamp: "1 day ago",
      likes: 8900,
      retweets: 2100,
      replies: 456
    },
    {
      id: 3,
      content: "The cooperative movement is the backbone of our rural economy. Today's initiatives will empower millions of farmers and strengthen our agricultural sector. #CooperativeMovement #RuralDevelopment",
      timestamp: "2 days ago",
      likes: 15600,
      retweets: 4100,
      replies: 1200
    }
  ]

  const quotes = [
    "I have worked with BJP Varma Bhai for several years and witnessed his outstanding contributions to strengthen the Party and in Government - Prime Minister, Narendra Modiji",
    "Shri BJP Varma Ji is extremely dynamic and has got the clarity of vision and devotion to do the welfare of the country - Former Vice President, Venkaiah Naidu",
    "Shri BJP Varma Ji is rich in energy, hard work, knowledge & efficiency - Former Finance Minister, Arun Jaitley",
    "He is making tremendous efforts to ensure a safe and secure India - Defense Minister, Rajnath Singh"
  ]

  return (
    <section className="py-20 bg-white text-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-orange mb-6">
            Follow & Connect
          </h2>
          <div className="w-24 h-1 bg-brand-orange mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay connected for latest updates, insights, and exclusive content
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Social Media Feed */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <Twitter className="h-8 w-8 text-blue-400" />
                <h3 className="text-2xl font-bold">Latest Tweets</h3>
              </div>

              <div className="space-y-6">
                {socialPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-300"
                  >
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.timestamp}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.replies}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Repeat2 className="h-4 w-4" />
                          <span>{post.retweets}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 font-medium">
                  Follow on Twitter
                </button>
              </div>
            </div>
          </motion.div>

          {/* Newsletter & Quotes */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Newsletter Subscription */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-8 w-8 text-secondary-400" />
                <h3 className="text-2xl font-bold">Get Exclusive Updates</h3>
              </div>

              <p className="text-gray-700 mb-6">
                Subscribe to receive exclusive news, updates, and insights directly in your inbox.
              </p>

              <ClientOnly
                fallback={
                  <div className="space-y-4">
                    <div className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white">
                      Enter your email address
                    </div>
                    <div className="w-full bg-secondary-500 text-white py-3 rounded-lg font-semibold text-center">
                      Subscribe Now
                    </div>
                  </div>
                }
              >
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  />
                  <button className="w-full bg-brand-orange text-white py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold">
                    Subscribe Now
                  </button>
                </div>
              </ClientOnly>

              <p className="text-xs text-gray-500 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>

            {/* Testimonials */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">What People Say</h3>
              
              <div className="space-y-6">
                {quotes.map((quote, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="border-l-4 border-secondary-500 pl-4"
                  >
                    <p className="text-gray-200 italic leading-relaxed">
                      "{quote}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Media Links */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8">Connect With Us</h3>
          
          <div className="flex justify-center space-x-6">
            {[
              { name: 'Twitter', icon: Twitter, color: 'bg-blue-500 hover:bg-blue-600' },
              { name: 'Facebook', icon: Share2, color: 'bg-blue-600 hover:bg-blue-700' },
              { name: 'Instagram', icon: Share2, color: 'bg-pink-500 hover:bg-pink-600' },
              { name: 'YouTube', icon: Share2, color: 'bg-red-500 hover:bg-red-600' },
              { name: 'Email', icon: Mail, color: 'bg-gray-500 hover:bg-gray-600' }
            ].map((social, index) => {
              const Icon = social.icon
              return (
                <motion.button
                  key={social.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${social.color} text-white p-4 rounded-full transition-all duration-300`}
                >
                  <Icon className="h-6 w-6" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SocialSection

