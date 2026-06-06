'use client'

import { motion } from 'framer-motion'

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Use</h1>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using bjpvarma.co.in (the &ldquo;Site&rdquo;), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Permitted Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may use the Site to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Read about the work of Shri Bhupathiraju Srinivasa Varma in his capacity as a Member of Parliament and Union Minister of State.</li>
              <li>Contact the office through the contact form.</li>
              <li>Subscribe to the newsletter.</li>
              <li>File a grievance through the &ldquo;Make It Better&rdquo; portal.</li>
              <li>Share publicly-available content on the Site with proper attribution.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Prohibited Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree <strong>not</strong> to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>Submit false, misleading, or defamatory grievances or contact messages.</li>
              <li>Attempt to gain unauthorised access to any portion of the Site, the server, or related systems.</li>
              <li>Use automated scripts, bots, or scrapers to collect content from the Site without prior permission.</li>
              <li>Upload files containing viruses, malware, or other harmful code.</li>
              <li>Use the Site to harass, threaten, or impersonate any person.</li>
              <li>Submit content that infringes any third party&rsquo;s intellectual property, privacy, or other rights.</li>
              <li>Use the Site for any unlawful purpose.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this Site — including text, photographs, graphics, design, and the BJP Varma name and likeness — is the property of Bhupathiraju Srinivasa Varma or its content suppliers and is protected by Indian and international copyright laws. Unauthorised reproduction or distribution is prohibited. Quotations and brief excerpts are permitted with attribution to the source.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User-Submitted Content</h2>
            <p className="text-gray-700 leading-relaxed">
              When you submit a contact message, newsletter signup, or grievance, you grant us a non-exclusive licence to use that content for the purpose of responding to you and operating the Site. You retain ownership of your content. You confirm that any content you upload is your own or that you have permission to share it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              The Site is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. We do not guarantee uninterrupted, error-free, or virus-free operation. We do not warrant the accuracy, completeness, or timeliness of any information on the Site, particularly press content sourced from third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Site, including loss of data, loss of profits, or service interruption — even if advised of the possibility of such damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              The Site may contain links to third-party websites (press releases, official government portals, donation platforms such as PM CARES, etc.). We are not responsible for the content, practices, or accuracy of these external sites. Access them at your own discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your access to the Site (including your &ldquo;Make It Better&rdquo; account) without notice if you violate these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of India. Any dispute arising out of or in connection with the use of this Site shall be subject to the exclusive jurisdiction of the courts at Bhimavaram, West Godavari, Andhra Pradesh.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to These Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may revise these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top reflects any changes. Continued use of the Site after a change constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, contact us at <strong>office@bjpvarma.co.in</strong>.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
