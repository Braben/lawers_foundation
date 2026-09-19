export const FEATURES = ['content', 'gallery', 'events', 'pledges', 'contacts', 'analytics', 'settings', 'staff', 'roles'] as const;
export const PERMISSIONS = FEATURES.flatMap(feature => feature === 'analytics' || feature === 'pledges' ? [`${feature}.view`] : [`${feature}.view`, `${feature}.manage`]);
export const DEFAULT_ROLES = [
  { id: 'super_admin', name: 'Administrator', permissions: PERMISSIONS, protected: true },
  { id: 'ceo', name: 'CEO', permissions: PERMISSIONS, protected: false },
  { id: 'manager', name: 'Manager', permissions: ['content.view', 'content.manage', 'gallery.view', 'gallery.manage', 'events.view', 'events.manage', 'analytics.view'], protected: false },
  { id: 'publisher', name: 'Publisher', permissions: ['content.view', 'content.manage', 'gallery.view', 'gallery.manage'], protected: false },
  { id: 'event_manager', name: 'Event manager', permissions: ['events.view', 'events.manage'], protected: false },
  { id: 'viewer', name: 'No access', permissions: [], protected: true },
];
export const DEFAULT_CURRENCIES = { defaultCurrency: 'GHS', currencies: [
  { code: 'GHS', name: 'Ghanaian cedi', enabled: true },
  { code: 'USD', name: 'US dollar', enabled: false },
  { code: 'EUR', name: 'Euro', enabled: false },
  { code: 'GBP', name: 'Pound sterling', enabled: false },
] };
