export type MibCategory =
  | 'Government Department'
  | 'Infrastructure Grievance'
  | 'Jobs'
  | 'Recommendations'
  | 'Discounts Request'
  | 'Assistance'
  | 'Suggestions'
  | 'Volunteering'

export const MIB_TAXONOMY: Record<MibCategory, string[]> = {
  'Government Department': ['Farmers', 'Police', 'Revenue', 'Other Dept.'],
  'Infrastructure Grievance': ['Railways', 'Roads', 'Water Supply', 'Building', 'Irrigation', 'Drains', 'Hospital', 'Others'],
  'Jobs': ['Transfer', 'New Jobs', 'Others'],
  'Recommendations': ['Health', 'Education', 'Others'],
  'Discounts Request': ['Schools/Colleges', 'Hospitals', 'Others'],
  'Assistance': ['Scholarship (merit)', 'Housing Units', 'Community Building', 'Skill Development', 'Others'],
  'Suggestions': ['Feedback', 'Ideas', 'Others'],
  'Volunteering': ['Volunteering', 'Others'],
}

export function listCategories(): MibCategory[] {
  return Object.keys(MIB_TAXONOMY) as MibCategory[]
}

export function listTypes(category: MibCategory): string[] {
  return MIB_TAXONOMY[category] || []
}
