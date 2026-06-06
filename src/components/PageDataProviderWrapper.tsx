'use client'

import { PageDataProvider } from '@/contexts/PageDataContext'

export default function PageDataProviderWrapper({ children }: { children: React.ReactNode }) {
  return <PageDataProvider>{children}</PageDataProvider>
}




