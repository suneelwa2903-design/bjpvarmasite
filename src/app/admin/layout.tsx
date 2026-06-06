import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - BJP Varma | BJP Varma',
  description: 'Administration portal',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
