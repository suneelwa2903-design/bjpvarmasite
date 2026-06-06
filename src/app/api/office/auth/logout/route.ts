import { NextResponse } from 'next/server'
import { clearOfficeSession } from '@/lib/officeAuth'

export async function POST() {
  try {
    await clearOfficeSession()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Logout failed' }, { status: 500 })
  }
}

