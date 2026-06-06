import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import PrintButton from '@/components/PrintButton'
import AutoPrint from '@/components/AutoPrint'

export const metadata: Metadata = {
  title: 'Profile — Bhupathiraju Srinivasa Varma',
  description: 'Official profile of Bhupathiraju Srinivasa Varma (BJP Varma), Union Minister of State for Heavy Industries & Steel, MP — Narsapuram.',
  robots: { index: false },
}

export default function ProfilePage() {
  return (
    <>
      {/* Auto-print when opened with ?autoprint=1 */}
      <Suspense fallback={null}>
        <AutoPrint />
      </Suspense>

      {/* Print bar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-orange-200 dark:border-orange-900/50 px-8 py-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">BJP Varma — Official Profile</p>
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium tracking-wide">Bhupathiraju Srinivasa Varma • Union Minister of State • MP Narsapuram</p>
        </div>
        <PrintButton />
      </div>

      <div className="max-w-[1100px] mx-auto px-8 py-10 print:px-0 print:py-0">

        {/* ── COVER ── */}
        <section className="flex flex-col items-center text-center border-b-4 border-orange-500 pb-10 mb-10 print:pb-8 print:mb-8">
          {/* BJP lotus */}
          <div className="relative w-20 h-20 mb-4">
            <Image src="/images/header-image.jpg" alt="BJP Varma" fill className="object-contain rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bhupathiraju Srinivasa Varma</h1>
          <p className="text-orange-600 font-semibold text-lg mt-1">BJP Varma</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
              Union Minister of State — Heavy Industries &amp; Steel
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
              Member of Parliament — Narsapuram, Andhra Pradesh
            </span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
              Bharatiya Janata Party
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-3">Lok Sabha 2024 — 18th Lok Sabha</p>
        </section>

        {/* ── PERSONAL BIO ── */}
        <section className="mb-10">
          <h2 className="section-title">Personal Biography</h2>
          <div className="prose-profile">
            <p>
              Bhupathiraju Srinivasa Varma, widely known as <strong>BJP Varma</strong>, was born in 1968 in Bhimavaram,
              West Godavari district, Andhra Pradesh. He holds a Master of Arts in Political Science from Andhra
              University (1999), a Master of Library &amp; Information Science from Annamalai University, Chidambaram
              (1993), and a Bachelor of Law (B.L.).
            </p>
            <p className="mt-3">
              A lifelong RSS swayamsevak and BJP karyakarta, Shri Varma began his political journey as a student
              leader in the All India Students&rsquo; Federation (AISAF) in 1980. Joining the BJP in 1988 as a dedicated
              party worker, he rose through every level of the party organisation over four decades of grassroots service.
            </p>
            <p className="mt-3">
              In the 2024 Lok Sabha elections, he won the Narsapuram constituency with a decisive margin of
              <strong> 2,76,802 votes</strong>, polling a total of <strong>7,07,343 votes</strong>. He was subsequently
              appointed <strong>Union Minister of State for Heavy Industries &amp; Steel</strong> in the Modi 3.0 Cabinet —
              a recognition of his decades of party service and governance capability.
            </p>
          </div>
        </section>

        {/* ── EDUCATION ── */}
        <section className="mb-10">
          <h2 className="section-title">Education</h2>
          <ul className="space-y-2">
            {[
              { year: '1999', degree: 'M.A. (Political Science)', inst: 'Andhra University' },
              { year: '1993', degree: 'M.Li.Sc (Library & Information Science)', inst: 'Annamalai University, Chidambaram' },
              { year: '1990', degree: 'B.L. (Bachelor of Law)', inst: 'Bhimavaram' },
            ].map((e) => (
              <li key={e.year} className="flex gap-4 text-sm">
                <span className="text-orange-600 font-semibold w-12 flex-shrink-0">{e.year}</span>
                <span className="text-gray-800 dark:text-gray-200">
                  <strong>{e.degree}</strong>
                  {e.inst ? ` — ${e.inst}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── POLITICAL JOURNEY ── */}
        <section className="mb-10">
          <h2 className="section-title">Political Journey</h2>
          <ol className="relative border-l-2 border-orange-200 dark:border-orange-800 ml-4 space-y-6">
            {[
              { year: '1980', desc: 'Started political career as a student leader under the All India Students\' Federation (AISAF)' },
              { year: '1988', desc: 'Joined Bharatiya Janata Party as a dedicated grassroots worker in Bhimavaram' },
              { year: '1991–97', desc: 'Served as District President, BJP — Bhimavaram Town Unit' },
              { year: '2008–14', desc: 'Elected twice as West Godavari District President, BJP (two consecutive terms)' },
              { year: '2020–23', desc: 'Appointed State Secretary, BJP Andhra Pradesh — overseeing party organisation statewide' },
              { year: '2024 (Apr)', desc: 'Won Narsapuram Lok Sabha seat with 7,07,343 votes — margin of 2,76,802 votes over runner-up' },
              { year: '2024 (Jun)', desc: 'Sworn in as Union Minister of State for Heavy Industries & Steel, Government of India' },
            ].map((m, i) => (
              <li key={i} className="ml-6 relative">
                <div className="absolute -left-[1.65rem] w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-gray-900 top-0.5" />
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">{m.year}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{m.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── KEY ACHIEVEMENTS ── */}
        <section className="mb-10">
          <h2 className="section-title">Key Achievements</h2>
          <ul className="space-y-2">
            {[
              'Secured ₹2,787 crore funding approval for Amaravati infrastructure projects',
              '₹48 crore sanctioned for Inner Ring Road-3 in Narsapuram constituency',
              '₹83.25 crore ROB approved for Shyamala Nagar; ₹76.34 crore ROB for Sanjeevayya Nagar (Guntur)',
              'Proactive representation of Andhra Pradesh\'s industrial interests at Central Ministry level',
              'Four decades of uninterrupted party service — from booth worker to Cabinet Minister',
              'Spearheaded BJP organisation building in West Godavari during challenging years',
            ].map((a, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-orange-500 mt-0.5 flex-shrink-0">▸</span>
                {a}
              </li>
            ))}
          </ul>
        </section>

        {/* ── VISION ── */}
        <section className="mb-10">
          <h2 className="section-title">Vision &amp; Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Industrial Growth', desc: 'Attract heavy industry and steel investment to Andhra Pradesh, creating employment for youth.' },
              { title: 'Constituency Development', desc: 'Complete all pending infrastructure projects in Narsapuram — roads, bridges, connectivity.' },
              { title: 'Farmers & Fishermen', desc: 'Strengthen livelihoods of the coastal farming and fishing communities of Narsapuram.' },
              { title: 'Party Building', desc: 'Strengthen BJP\'s organisation in AP at every mandal and booth level for 2029 elections.' },
            ].map((v) => (
              <div key={v.title} className="bg-orange-50 dark:bg-gray-800 rounded-lg p-4 border border-orange-100 dark:border-gray-700">
                <h3 className="font-bold text-orange-700 dark:text-orange-400 text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="mb-10">
          <h2 className="section-title">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Parliamentary Office</p>
              <p>Parliament House Annexe, New Delhi — 110001</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Constituency Office</p>
              <p>BJP Party Office, Narasayyaagraharam, Narsapuram, AP</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Social Media</p>
              <p>Twitter/X: @BJPVarma</p>
              <p>Facebook: /BhupathirajuSrinivasaVarmaBjpVarma</p>
              <p>Instagram: @bjpvarma</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Official Website</p>
              <p>bjpvarma.co.in</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Bhupathiraju Srinivasa Varma — Official Profile</p>
          <p className="mt-1">Generated from bjpvarma.co.in — For media and official use</p>
        </div>
      </div>

      <style>{`
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #c2410c;
          border-left: 4px solid #ea580c;
          padding-left: 0.75rem;
          margin-bottom: 1rem;
        }
        .prose-profile { font-size: 0.95rem; line-height: 1.7; color: #374151; }
        @media (prefers-color-scheme: dark) {
          .prose-profile { color: #d1d5db; }
        }
        .dark .prose-profile { color: #d1d5db; }
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          * { color-scheme: light !important; }
          .section-title { color: #c2410c; }
        }
      `}</style>
    </>
  )
}
