'use client'

import { motion } from 'framer-motion'

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-600 italic">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Our Commitment</h2>
            <p className="text-gray-700 leading-relaxed">
              We are committed to making bjpvarma.co.in accessible to as many people as possible, including those who rely on assistive technologies. Our goal is to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, as published by the World Wide Web Consortium (W3C).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. What We&rsquo;ve Done</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Site has been built with accessibility in mind. Notable features include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li><strong>Skip-to-content link</strong> at the top of every page for keyboard users.</li>
              <li><strong>Semantic HTML</strong> — headings, landmarks (header, nav, main, footer), and lists are used appropriately.</li>
              <li><strong>Alt text</strong> on photographs uploaded through the CMS, when provided by the administrator.</li>
              <li><strong>Keyboard navigation</strong> — all interactive elements are reachable using the Tab key.</li>
              <li><strong>Sufficient colour contrast</strong> against the primary orange/saffron theme.</li>
              <li><strong>Responsive design</strong> — the Site adapts to mobile, tablet, and desktop screens.</li>
              <li><strong>Multiple languages</strong> — English and Telugu are supported on the homepage.</li>
              <li><strong>Adjustable font size</strong> via the Settings menu in the header.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Known Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Despite our efforts, some areas may not yet fully meet WCAG 2.1 AA. We are aware of the following and are working to improve:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Embedded third-party social-media feeds (Instagram, Twitter/X, YouTube, Facebook) are rendered by third-party services and may not meet the same accessibility standards.</li>
              <li>Older press releases or scanned PDF documents may not contain selectable text or be fully screen-reader-friendly. We provide summaries in plain text where possible.</li>
              <li>The embedded Google Maps view of the constituency office is provided by Google and follows Google&rsquo;s own accessibility behaviour.</li>
              <li>Some animations and motion effects on the homepage may not respect the user&rsquo;s &ldquo;reduced motion&rdquo; preference in all cases.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compatible Assistive Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Site is designed to work with current versions of the following:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li><strong>Screen readers:</strong> NVDA, JAWS (Windows); VoiceOver (macOS / iOS); TalkBack (Android).</li>
              <li><strong>Browsers:</strong> Chrome, Firefox, Safari, Edge — current and one previous major version.</li>
              <li><strong>Operating systems:</strong> Windows 10+, macOS 11+, iOS 15+, Android 11+.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Feedback and Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We welcome your feedback on the accessibility of bjpvarma.co.in. If you encounter accessibility barriers or have suggestions for improvement, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> office@bjpvarma.co.in</p>
              <p className="text-gray-700"><strong>Subject line:</strong> &ldquo;Accessibility — &lt;your concern&gt;&rdquo;</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We aim to acknowledge accessibility feedback within 5 working days and address valid issues as quickly as practicable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Formal Complaints</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are not satisfied with our response to an accessibility concern, you may escalate to our Grievance Officer as described in our <strong>Privacy Policy</strong>.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
