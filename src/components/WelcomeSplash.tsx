'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const EN = {
  welcome: 'Welcome to BJPVarma.co.in',
  tagline: 'Forever At Your Service',
  name: 'Bhupathiraju Srinivasa Varma',
  title: 'Union Minister of State — Heavy Industries & Steel',
  mp: 'Member of Parliament, Narsapuram, Andhra Pradesh',
  body: 'Dedicated to the development of Narsapuram, the growth of Andhra Pradesh, and the service of the nation under the Bharatiya Janata Party.',
  points: ['Works done for the constituency', 'Latest news & press releases', 'Yearly reports to the people'],
  enter: 'Enter Website →',
}

const TE = {
  welcome: 'BJPVarma.co.in కి స్వాగతం',
  tagline: 'సేవకు సదా సంసిద్ధుడు',
  name: 'భూపతిరాజు శ్రీనివాస వర్మ',
  title: 'కేంద్ర హెవీ ఇండస్ట్రీస్ & స్టీల్ శాఖ సహాయ మంత్రి',
  mp: 'పార్లమెంట్ సభ్యుడు, నరసాపురం, ఆంధ్రప్రదేశ్',
  body: 'నరసాపురం అభివృద్ధికి అంకితమై, ఆంధ్రప్రదేశ్ పురోగతికి కృషి చేస్తూ, భారతీయ జనతా పార్టీ మార్గదర్శకత్వంలో దేశ సేవలో నిమగ్నమై ఉన్నారు.',
  points: ['నియోజకవర్గంలో జరిగిన పనులు', 'తాజా వార్తలు & ప్రెస్ విజ్ఞప్తులు', 'ప్రజలకు వార్షిక నివేదికలు'],
  enter: 'వెబ్‌సైట్ లోకి →',
}

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(true) // Always start visible for SSR
  const [exiting, setExiting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Check if splash was already seen this session
    try {
      if (sessionStorage.getItem('splash_seen') === '1') {
        setVisible(false)
        return
      }
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!visible || !ready) return
    const t = setTimeout(() => handleExit(), 7000)
    return () => clearTimeout(t)
  }, [visible, ready])

  const handleExit = () => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      try { sessionStorage.setItem('splash_seen', '1') } catch {}
    }, 800)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col overflow-auto bg-white dark:bg-gray-950"
          onClick={handleExit}
        >
          {/* Saffron top bar */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 py-3 px-6 flex items-center justify-between flex-shrink-0">
            <span className="text-white text-xs font-semibold tracking-widest uppercase">Bharatiya Janata Party</span>
            <span className="text-white/80 text-xs">bjpvarma.co.in</span>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            {/* BJP Lotus / logo photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl mb-5"
            >
              <Image src="/images/header-image.jpg" alt="BJP Varma" fill className="object-cover" />
            </motion.div>

            {/* Name + title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{EN.name}</h1>
              <p className="text-orange-600 font-semibold text-sm mt-1">{EN.title}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{EN.mp}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="h-px w-12 bg-orange-300"></span>
                <p className="text-orange-600 font-bold text-base tracking-wide">{EN.tagline}</p>
                <span className="h-px w-12 bg-orange-300"></span>
              </div>
            </motion.div>

            {/* Two-column content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8"
            >
              {/* Telugu */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border-l-4 border-orange-500 shadow-sm dark:border-orange-400">
                <p className="text-orange-600 font-bold text-base mb-1">{TE.welcome}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-3">{TE.body}</p>
                <ul className="space-y-1">
                  {TE.points.map((p, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300 text-xs flex gap-1.5">
                      <span className="text-orange-500 flex-shrink-0">✦</span>{p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* English */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border-l-4 border-amber-500 shadow-sm dark:border-amber-400">
                <p className="text-orange-600 font-bold text-base mb-1">{EN.welcome}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-3">{EN.body}</p>
                <ul className="space-y-1">
                  {EN.points.map((p, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300 text-xs flex gap-1.5">
                      <span className="text-orange-500 flex-shrink-0">✦</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Enter button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              onClick={handleExit}
              className="mt-8 px-10 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-full transition-colors shadow-md"
            >
              {EN.enter}
            </motion.button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-2 text-gray-400 text-[0.65rem]"
            >
              Click anywhere or wait to enter
            </motion.p>
          </div>

          {/* Bottom BJP bar */}
          <div className="bg-orange-600 py-1.5 flex-shrink-0 text-center">
            <p className="text-white/80 text-[0.65rem] tracking-widest uppercase">Bharatiya Janata Party · bjpvarma.co.in</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
