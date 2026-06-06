'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
    >
      Print / Save as PDF
    </button>
  )
}
