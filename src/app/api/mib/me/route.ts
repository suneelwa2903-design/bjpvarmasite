import { NextResponse } from 'next/server'
import { getMibCitizenSession } from '@/lib/mibCitizenSession'

// Lightweight session-state check used by the client UI to decide whether to
// show attachment controls, "log in to attach" prompts, etc. Returns the
// current citizen's display fields, or null when not logged in.
export async function GET() {
  const user = await getMibCitizenSession()
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null })
  }
  return NextResponse.json({
    authenticated: true,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
  })
}
