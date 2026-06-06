import type { Metadata } from 'next'
import '../../styles/globals.css'
import LanguageProvider from '@/components/i18n/LanguageProvider'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import OfficeLayoutWrapper from '@/components/office/OfficeLayoutWrapper'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Office - Make it Better',
  description: 'Internal office portal for ticket management and analytics',
}

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  const user = await getOfficeSessionUser()

  return (
    <LanguageProvider>
      <OfficeLayoutWrapper user={user}>
        {children}
      </OfficeLayoutWrapper>
      <Toaster richColors position="top-right" />
    </LanguageProvider>
  )
}
