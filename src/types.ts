export interface SearchCriteria {
  industry: string;
  state: string;
}

export interface SearchResult {
  id: number;
  entityName: string;
  websiteUrl: string;
}

export const INDUSTRIES = [
  'Country Club',
  'Insurance',
  'Non-Profit',
  'Municipalities with Utilities',
  'Property Management',
  'Taxes',
  'Utilities'
] as const;

export const STATES = [
  'Alabama',
  'Florida',
  'Georgia',
  'Indiana',
  'Kentucky',
  'Maryland',
  'New Jersey',
  'North Carolina',
  'Ohio',
  'Pennsylvania',
  'South Carolina',
  'Tennessee',
  'Texas',
  'Virginia',
  'West Virginia',
  'Washington DC'
] as const;