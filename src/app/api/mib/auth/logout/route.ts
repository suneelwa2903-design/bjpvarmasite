import { NextResponse } from 'next/server'
import { clearMibCitizenSession } from '@/lib/mibCitizenSession'

export async function POST() {
  await clearMibCitizenSession()
  return NextResponse.json({ success: true })
}
