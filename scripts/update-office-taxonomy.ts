/**
 * Script to update the office taxonomy in the database
 * Run with: npx tsx scripts/update-office-taxonomy.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_OFFICE_TAXONOMY = {
  "Constituency – Grievances": [
    "Individual Petition",
    "Land Issue",
    "Job Request",
    "Health Support",
    "Education Support",
    "Pension / Welfare Issue",
    "Police / Law & Order",
    "Other Grievance"
  ],
  "Constituency – Infrastructure": [
    "Roads",
    "Water Supply",
    "Electricity",
    "Drainage & Sanitation",
    "Irrigation / Canals",
    "Public Transport",
    "Public Buildings (Schools, Hospitals, Anganwadi)",
    "Other Infrastructure"
  ],
  "Government Schemes & Benefits": [
    "Housing (PMAY, State Housing)",
    "Farmer Schemes (PM Kisan, others)",
    "Scholarships & Education Schemes",
    "Health Insurance (Ayushman, State Schemes)",
    "Minority / SC / ST Schemes",
    "Women & Child Schemes",
    "Skill Development",
    "Other Scheme"
  ],
  "Ministry – Files & Approvals": [
    "File Movement / Tracking",
    "Note Sheet / Approval",
    "Cabinet / Committee Reference",
    "Inter-Ministerial Coordination",
    "PSU / Department Coordination",
    "Policy / Draft Review"
  ],
  "Parliament Matters": [
    "Starred Question",
    "Unstarred Question",
    "Zero Hour / Special Mention",
    "Committee Meeting",
    "Parliament Briefing Note",
    "Assurance / Follow-up"
  ],
  "Media & Communication": [
    "Press Release Draft",
    "Media Query Response",
    "Interview Request",
    "Event Coverage Request",
    "Social Media Content",
    "Fact Check / Clarification"
  ],
  "Office Administration": [
    "Staff HR & Leave",
    "Travel & TA/DA",
    "Bills & Payments",
    "Vendor / Purchase",
    "Office Maintenance",
    "Vehicle & Logistics",
    "IT / Email / System Issue"
  ],
  "Events & Visits": [
    "Constituency Visit Planning",
    "Official Meeting (Govt)",
    "Political Meeting (Party)",
    "Public Inauguration / Function",
    "Election Campaign Event",
    "Protocol / VIP Movement"
  ],
  "Personal / Confidential": [
    "Personal Appointment",
    "Family Matter",
    "Confidential Correspondence",
    "Private Travel"
  ],
  "Development Works – CSR/MPLADS": [
    "CSR Proposal",
    "MPLADS Proposal",
    "Technical Estimate",
    "Sanction & Fund Release",
    "Tendering",
    "Completion & Closure",
    "Issue / Obstruction"
  ]
}

async function updateTaxonomy() {
  try {
    console.log('Updating office taxonomy...')
    
    const result = await prisma.mibSetting.upsert({
      where: { key: 'taxonomy_office' },
      update: {
        value: JSON.stringify(NEW_OFFICE_TAXONOMY)
      },
      create: {
        key: 'taxonomy_office',
        value: JSON.stringify(NEW_OFFICE_TAXONOMY)
      }
    })
    
    console.log('✅ Office taxonomy updated successfully!')
    console.log('Categories:', Object.keys(NEW_OFFICE_TAXONOMY).length)
    console.log('Total types:', Object.values(NEW_OFFICE_TAXONOMY).flat().length)
    
  } catch (error) {
    console.error('❌ Error updating taxonomy:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateTaxonomy()

