"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CURRENCIES = exports.DEFAULT_ROLES = exports.PERMISSIONS = exports.FEATURES = void 0;
exports.FEATURES = ['content', 'gallery', 'events', 'pledges', 'contacts', 'analytics', 'settings', 'staff', 'roles'];
exports.PERMISSIONS = exports.FEATURES.flatMap(feature => feature === 'analytics' || feature === 'pledges' ? [`${feature}.view`] : [`${feature}.view`, `${feature}.manage`]);
exports.DEFAULT_ROLES = [
    { id: 'super_admin', name: 'Administrator', permissions: exports.PERMISSIONS, protected: true },
    { id: 'ceo', name: 'CEO', permissions: exports.PERMISSIONS, protected: false },
    { id: 'manager', name: 'Manager', permissions: ['content.view', 'content.manage', 'gallery.view', 'gallery.manage', 'events.view', 'events.manage', 'analytics.view'], protected: false },
    { id: 'publisher', name: 'Publisher', permissions: ['content.view', 'content.manage', 'gallery.view', 'gallery.manage'], protected: false },
    { id: 'event_manager', name: 'Event manager', permissions: ['events.view', 'events.manage'], protected: false },
    { id: 'viewer', name: 'No access', permissions: [], protected: true },
];
exports.DEFAULT_CURRENCIES = { defaultCurrency: 'GHS', currencies: [
        { code: 'GHS', name: 'Ghanaian cedi', enabled: true },
        { code: 'USD', name: 'US dollar', enabled: false },
        { code: 'EUR', name: 'Euro', enabled: false },
        { code: 'GBP', name: 'Pound sterling', enabled: false },
    ] };
