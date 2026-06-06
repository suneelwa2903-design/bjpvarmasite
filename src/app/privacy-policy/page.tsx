'use client'

import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Privacy Policy explains how the official website of Shri Bhupathiraju Srinivasa Varma (&ldquo;BJP Varma&rdquo;) — accessible at bjpvarma.co.in — collects, uses, stores, and protects information you provide when interacting with the site.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We comply with India&rsquo;s Digital Personal Data Protection Act, 2023 (DPDP Act) and process your information lawfully and only for the purposes described here.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect only the information you choose to share with us through specific interactions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li><strong>Contact form submissions:</strong> Your name, email address, subject, and message.</li>
              <li><strong>Newsletter subscriptions:</strong> Your email address.</li>
              <li><strong>&ldquo;Make It Better&rdquo; (citizen grievance) submissions:</strong> Your name, mobile number, email address, location (state, district, mandal, ward, pincode), the subject and description of your grievance, and any attached documents or photos you upload.</li>
              <li><strong>&ldquo;Make It Better&rdquo; registered accounts:</strong> Your name, mobile number, email address, and a hashed (one-way encrypted) password.</li>
              <li><strong>Technical information:</strong> Standard server logs (IP address, browser type, time of request) — kept briefly for security and abuse prevention.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li>To respond to your queries and grievances.</li>
              <li>To send you periodic updates about constituency work, parliamentary activity, and ministerial initiatives — only if you have subscribed.</li>
              <li>To assign citizen grievances to the appropriate office staff for follow-up.</li>
              <li>To verify your identity when you log in to track your grievances.</li>
              <li>To improve the website and prevent abuse.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We <strong>do not</strong> sell, rent, or trade your personal information to third parties for marketing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Where Your Information Is Stored</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is stored on infrastructure operated by Google Cloud Platform (GCP) in the Mumbai (asia-south1) region:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li><strong>Cloud SQL for PostgreSQL</strong> — primary database for grievances, users, and tickets.</li>
              <li><strong>Cloud Storage</strong> — two buckets. A public bucket for website images (slideshow, press, gallery). A private bucket for citizen-uploaded evidence files, accessible only via short-lived signed links generated server-side.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              All data transit uses TLS (HTTPS). Daily backups are stored in a separate private Cloud Storage bucket and retained for 7 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the following third-party services to operate the site:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li><strong>Gmail SMTP</strong> (Google) — to send notification emails (contact form confirmations, OTPs, ticket updates).</li>
              <li><strong>Google Cloud Platform</strong> — hosting and storage as described above.</li>
              <li><strong>Meta WhatsApp Business Cloud API</strong> — for ticket-related WhatsApp notifications, where enabled. Only ticket number and minimal context are transmitted.</li>
              <li><strong>SociableKit</strong> — to embed publicly-visible social-media feeds on the homepage. No personal data is shared.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              The site uses no third-party analytics, advertising, or tracking services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights Under the DPDP Act, 2023</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As a Data Principal, you have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Correct</strong> inaccurate or incomplete personal data.</li>
              <li><strong>Erase</strong> your personal data, subject to legal retention requirements.</li>
              <li><strong>Withdraw consent</strong> for processing (e.g. unsubscribe from emails).</li>
              <li><strong>Grievance redressal</strong> in case you believe your data is being mishandled.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise any of these rights, contact our Grievance Officer (see Section 9 below).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
              <li><strong>Contact form messages:</strong> retained as long as required for follow-up, then archived or deleted.</li>
              <li><strong>Newsletter subscriptions:</strong> retained until you unsubscribe.</li>
              <li><strong>Citizen grievances and attachments:</strong> retained for the lifetime of the ticket and a reasonable period thereafter for audit purposes.</li>
              <li><strong>Server logs:</strong> retained briefly for security purposes (typically 30 days).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Passwords are stored using one-way encryption (bcrypt). Sessions are protected by signed, HTTP-only cookies with strict same-site policies. Citizen file uploads are stored in a private bucket and accessed only through short-lived signed links generated after a permission check. All form submissions are protected against cross-site forgery.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Grievance Officer</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In accordance with the DPDP Act, 2023:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2"><strong>Name:</strong> Bhupathiraju Srinivasa Varma</p>
              <p className="text-gray-700 mb-2"><strong>Email:</strong> bhupathirajusrinivasvarma@gmail.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Bhimavaram, West Godavari, Andhra Pradesh, India</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We aim to acknowledge grievances within 7 working days and resolve them within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or in the law. The &ldquo;Last updated&rdquo; date at the top of this page will reflect any changes. Significant changes will be highlighted on the homepage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For any privacy-related questions, please contact us at <strong>office@bjpvarma.co.in</strong> or via the contact form on this website.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
