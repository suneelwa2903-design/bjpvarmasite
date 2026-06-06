import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'
import { MIB_TAXONOMY } from '@/lib/mibTaxonomy'

const KEY_PUBLIC = 'taxonomy_public'
const KEY_OFFICE = 'taxonomy_office'

function pickKey(scope?: string) {
  return scope === 'office' ? KEY_OFFICE : KEY_PUBLIC
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') || 'public'
  const key = pickKey(scope)
  const setting = await prisma.mibSetting.findUnique({ where: { key } })
  // Only use MIB_TAXONOMY fallback for public scope, not for office
  // Office should return empty {} if not set, so admin can configure it
  const data = setting ? JSON.parse(setting.value) : (scope === 'public' ? MIB_TAXONOMY : {})
  
  // Filter out hidden items for form display (admin panel shows all including hidden)
  const includeHidden = searchParams.get('includeHidden') === 'true'
  if (!includeHidden && data._hidden) {
    console.log(`[Taxonomy API] GET request for scope: ${scope} - filtering hidden items`)
    console.log(`[Taxonomy API] Hidden data:`, data._hidden)
    const filtered: any = {}
    const hiddenCategories = data._hidden.categories || []
    const hiddenSubcategories = data._hidden.subcategories || {}
    
    for (const [category, subs] of Object.entries(data)) {
      if (category === '_hidden') continue
      if (!hiddenCategories.includes(category)) {
        const hiddenSubs = hiddenSubcategories[category] || []
        const visibleSubs = (subs as string[]).filter(s => !hiddenSubs.includes(s))
        if (visibleSubs.length > 0) {
          filtered[category] = visibleSubs
        }
        if (hiddenSubs.length > 0) {
          console.log(`[Taxonomy API] Filtered out ${hiddenSubs.length} hidden subcategories from "${category}":`, hiddenSubs)
        }
      }
    }
    console.log(`[Taxonomy API] Filtered taxonomy:`, filtered)
    return NextResponse.json({ success: true, data: filtered }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  }
  
  console.log(`[Taxonomy API] GET request for scope: ${scope} - returning all data (includeHidden=${includeHidden})`)
  return NextResponse.json({ success: true, data }, {
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
  })
}

export async function PUT(req: Request) {
  const session = await getCurrentSession()
  if (!session) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') || 'public'
  const key = pickKey(scope)
  try {
    const body = await req.json()
    console.log(`[Taxonomy API] PUT request for scope: ${scope}`, body)

    // Shape guard: taxonomy is `Record<string, string[]>` with an optional
    // `_hidden` object. Any other shape would crash the admin editor (it
    // expects `data[category].filter(...)`). Reject early instead of
    // persisting and corrupting the editor for everyone.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Body must be an object' }, { status: 400 })
    }
    for (const [k, v] of Object.entries(body)) {
      if (k === '_hidden') continue  // _hidden is the structured meta object — its own shape
      if (!Array.isArray(v) || !v.every(s => typeof s === 'string')) {
        return NextResponse.json(
          { success: false, error: `Category "${k}" must map to an array of strings` },
          { status: 400 }
        )
      }
    }

    const value = JSON.stringify(body || {})
    const saved = await prisma.mibSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    const parsed = JSON.parse(saved.value)
    console.log(`[Taxonomy API] Saved taxonomy for scope: ${scope}`, parsed)
    return NextResponse.json({ success: true, data: parsed })
  } catch (e:any) {
    console.error(`[Taxonomy API] Error saving taxonomy:`, e)
    return NextResponse.json({ success: false, error: e?.message || 'Failed to save' }, { status: 500 })
  }
}


