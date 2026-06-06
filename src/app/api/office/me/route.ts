import { NextResponse } from 'next/server'
import { getOfficeSessionUser } from '@/lib/officeAuth'

export async function GET() {
  const user = await getOfficeSessionUser()
  if (!user) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ success: true, data: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role } })
}

