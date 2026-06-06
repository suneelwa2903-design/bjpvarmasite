import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth'

// Server-side auth gate for every admin page that requires login.
// Lives in a Next.js route group `(authenticated)` — the parens make the
// segment URL-transparent (`/admin/dashboard` works without `/(authenticated)`
// in the URL), and physically separates guarded pages from the login at
// `src/app/admin/page.tsx` so the login can never accidentally redirect-loop.
//
// Because layouts run server-side and `redirect()` aborts the render before
// any child segment ships HTML or client bundles, this guard protects client
// components (e.g. dashboard, make-it-better) without converting them to
// server components.
export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUsername = await getCurrentSession()
  if (!adminUsername) {
    redirect('/admin')
  }
  return <>{children}</>
}
