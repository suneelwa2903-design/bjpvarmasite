'use client'

import { motion } from 'framer-motion'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files placed in your browser by websites you visit. They allow the site to remember your actions or preferences over time, or to recognise that you are signed in.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cookies We Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Site uses a small number of <strong>strictly necessary</strong> cookies to operate. We do <strong>not</strong> use third-party analytics, advertising, or behavioural tracking cookies.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 my-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Cookie name</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Purpose</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Set when</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Lifetime</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 font-mono">csrf-token</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Protects forms against cross-site request forgery.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">On any page visit.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">24 hours.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 font-mono">admin-session</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Authenticates CMS administrators.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">After admin login.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">24 hours (or until logout).</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 font-mono">office-session</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Authenticates office staff using the grievance back-office.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">After office portal login.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">24 hours (or until logout).</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 font-mono">mib-session</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">Authenticates citizens using the &ldquo;Make It Better&rdquo; grievance portal.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">After citizen login.</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">24 hours (or until logout).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. No Tracking, No Analytics, No Advertising</h2>
            <p className="text-gray-700 leading-relaxed">
              We do <strong>not</strong> use Google Analytics, Facebook Pixel, advertising-network cookies, or any third-party behavioural tracking. We do not build profiles of visitors. We do not share cookie data with any third party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Local Storage</h2>
            <p className="text-gray-700 leading-relaxed">
              In addition to cookies, the website may store small items of data in your browser&rsquo;s local storage to remember your preferences (theme, font size, language, whether you have dismissed the welcome screen). These items are not transmitted to our servers.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              If you log in to the &ldquo;Make It Better&rdquo; portal, your name, email, and mobile may be stored in local storage for UI convenience (e.g. to greet you on subsequent visits). These items are not used for authentication.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Embedded Third-Party Content</h2>
            <p className="text-gray-700 leading-relaxed">
              The homepage may embed publicly-visible feeds from Instagram, Twitter/X, YouTube, and Facebook (via SociableKit), and an embedded Google Maps view of the constituency office. These third-party widgets may set their own cookies subject to the providers&rsquo; respective policies. We have no control over these third-party cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Managing Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              You can control or delete cookies through your browser settings. However, disabling the cookies listed in Section 2 will prevent you from logging in to any portal on this Site, and may break form submissions. Cookies set by third-party embeds can be controlled through your browser settings or by signing out of the respective third-party service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about our use of cookies, contact us at <strong>office@bjpvarma.co.in</strong>.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
