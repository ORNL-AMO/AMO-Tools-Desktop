//TODO: Connect to routing
export type SetupTabRoutes = 'system-basics' | 'system-information' | 'inventory-setup' | 'day-types-setup' | 'system-profile-setup' | 'end-uses';

export const CaRouteTree = {
  "system-basics": {
    next: 'system-information',
    back: null
  },
  "system-information": {
    next: 'inventory-setup',
    back: 'system-basics'
  },
  "inventory-setup": {
    next: 'day-types-setup',
    back: 'system-information'
  },
  "day-types-setup": {
    next: 'system-profile-setup',
    back: 'inventory-setup'
  },
  "system-profile-setup": {
    next: 'end-uses',
    back: 'day-types-setup'
  },
  "end-uses": {
    next: null,
    back: 'system-profile-setup'
  }
}