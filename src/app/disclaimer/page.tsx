'use client'

import { motion } from 'framer-motion'

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Disclaimer</h1>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Nature of This Website</h2>
            <p className="text-gray-700 leading-relaxed">
              bjpvarma.co.in is the personal and political website of Shri Bhupathiraju Srinivasa Varma. It is maintained to inform constituents and the public about his work as Member of Parliament for Narsapuram and Union Minister of State for Heavy Industries &amp; Steel.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Personal and Political Capacity</h2>
            <p className="text-gray-700 leading-relaxed">
              Opinions, statements, and content on this Site are expressed in Shri Varma&rsquo;s <strong>personal and political capacity</strong>. They do not necessarily represent the official position of the Government of India, the Ministry of Heavy Industries, the Ministry of Steel, the Parliament of India, or the Bharatiya Janata Party (BJP) as an organisation, unless explicitly stated otherwise.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              For official Government of India communications, please refer to the relevant Ministry&rsquo;s official website. For official BJP communications, please refer to <strong>bjp.org</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Press Content and Third-Party Sources</h2>
            <p className="text-gray-700 leading-relaxed">
              The press releases, news articles, and media excerpts displayed on this Site are sourced from publicly-available reporting and are provided for informational purposes. While we strive for accuracy, we do not guarantee that any third-party press content is complete, current, or free from error. Readers are encouraged to verify with the original publisher.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Yearly Reports and Constituency Data</h2>
            <p className="text-gray-700 leading-relaxed">
              Yearly reports, infrastructure-investment figures, and constituency-development data are compiled in good faith from publicly-disclosed sources, ministerial filings, and constituency records. Figures may be approximate or subject to revision. They should not be treated as audited financial statements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. &ldquo;Make It Better&rdquo; Grievance Portal</h2>
            <p className="text-gray-700 leading-relaxed">
              The &ldquo;Make It Better&rdquo; portal is a facility provided to constituents to raise grievances and suggestions. Submission of a grievance does not guarantee any specific action or outcome. Resolution depends on the nature of the issue, jurisdictional authority, and availability of resources. The office endeavours to acknowledge and respond to grievances in good faith.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              The portal is <strong>not</strong> a substitute for emergency services, statutory complaint mechanisms (such as police complaints), or formal legal proceedings. For emergencies, contact local authorities directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              This Site contains links to external websites, including the Prime Minister&rsquo;s Office, BJP, PM CARES Fund, Bharat Ke Veer, and various government portals. These links are provided for convenience. We have no control over the content, privacy practices, or accuracy of these external sites. Inclusion of a link does not imply endorsement of any third-party content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Social Media Embeds</h2>
            <p className="text-gray-700 leading-relaxed">
              The homepage may display embedded feeds from Instagram, Twitter/X, YouTube, and Facebook. These embeds are loaded directly from the respective social-media platforms and are subject to those platforms&rsquo; terms and policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. No Professional Advice</h2>
            <p className="text-gray-700 leading-relaxed">
              Nothing on this Site constitutes legal, financial, medical, or any other professional advice. Information is provided for general awareness only. Consult a qualified professional for advice on your specific situation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Translations</h2>
            <p className="text-gray-700 leading-relaxed">
              Where this Site provides content in multiple languages (e.g. English and Telugu), the English version shall be considered authoritative in case of any conflict or ambiguity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For corrections, clarifications, or concerns about content on this Site, please contact <strong>office@bjpvarma.co.in</strong> or use the contact form.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
