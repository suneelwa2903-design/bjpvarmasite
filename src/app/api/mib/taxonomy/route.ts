import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MIB_TAXONOMY } from '@/lib/mibTaxonomy'

export async function GET() {
  try {
    // Get taxonomy from database (public scope)
    const setting = await prisma.mibSetting.findUnique({ where: { key: 'taxonomy_public' } })
    const data = setting ? JSON.parse(setting.value) : MIB_TAXONOMY
    
    // Filter out hidden items for form display
    if (data._hidden) {
      const filtered: any = {}
      const hiddenCategories = data._hidden.categories || []
      const hiddenSubcategories = data._hidden.subcategories || {}
      
      for (const [category, subs] of Object.entries(data)) {
        if (category === '_hidden') continue
        if (!hiddenCategories.includes(category)) {
          const hiddenSubs = hiddenSubcategories[category] || []
          filtered[category] = (subs as string[]).filter(s => !hiddenSubs.includes(s))
        }
      }
      return NextResponse.json({ success: true, data: filtered }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
    }
    
    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (e: any) {
    // Fallback to static taxonomy if database error
    console.error('[Taxonomy API] Error fetching public taxonomy:', e)
    return NextResponse.json({ success: true, data: MIB_TAXONOMY }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  }
}
