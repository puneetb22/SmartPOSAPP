export type Language = 'en' | 'hi' | 'mr';

// Define English translations first
const englishTranslations = {
  // App
  'app.title': 'Maharashtra POS',
  
  // Business Modes
  'businessMode.restaurant': 'Restaurant Mode',
  'businessMode.pharmacy': 'Pharmacy Mode',
  'businessMode.agri': 'Agri Mode',
  'businessMode.notConfigured': 'Not Configured',
  
  // Menu
  'menu.dashboard': 'Dashboard',
  'menu.newSale': 'New Sale',
  'menu.inventory': 'Inventory',
  'menu.customers': 'Customers',
  'menu.prescriptions': 'Prescriptions',
  'menu.reports': 'Reports',
  'menu.settings': 'Settings',
  'menu.logout': 'Logout',
  
  // Roles
  'role.admin': 'Administrator',
  'role.cashier': 'Cashier',
  'role.waiter': 'Waiter',
  'role.kitchen': 'Kitchen Staff',
  'role.unknown': 'Unknown Role',
  
  // Keyboard Shortcuts
  'shortcuts.title': 'Keyboard Shortcuts',
  'shortcuts.general': 'General',
  'shortcuts.sales': 'Sales',
  'shortcuts.navigation': 'Navigation',
  'shortcuts.help': 'Help',
  'shortcuts.newSale': 'New Sale',
  'shortcuts.print': 'Print Receipt',
  'shortcuts.search': 'Search Product',
  'shortcuts.customerDisplay': 'Customer Display',
  'shortcuts.addItem': 'Add Item',
  'shortcuts.removeItem': 'Remove Item',
  'shortcuts.discount': 'Apply Discount',
  'shortcuts.payment': 'Payment',
  'shortcuts.clearCart': 'Clear Cart',
  'shortcuts.dashboard': 'Dashboard',
  'shortcuts.inventory': 'Inventory',
  'shortcuts.reports': 'Reports',
  'shortcuts.settings': 'Settings',
  'shortcuts.logout': 'Logout',
  
  // Actions
  'actions.quickSale': 'Quick Sale',
  'actions.logout': 'Logout',
  'actions.newSale': 'New Sale',
  'actions.addProduct': 'Add Product',
  'actions.search': 'Search',
  'actions.prescription': 'Prescription',
  'actions.newOrder': 'New Order',
  'actions.bulkEntry': 'Bulk Entry',
  'actions.reorder': 'Reorder',
  'actions.markSale': 'Mark Sale',
  
  // Stats
  'stats.todaysSales': "Today's Sales",
  'stats.transactions': 'Transactions',
  'stats.lowStock': 'Low Stock Items',
  'stats.expiringSoon': 'Expiring Soon',
  'stats.sales': 'Sales',
  'stats.revenue': 'Revenue',
  'stats.needsAttention': 'Needs attention',
  'stats.next30Days': 'Next 30 days',
  
  // Dashboard
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.topSellingProducts': 'Top Selling Products',
  'dashboard.stockAlerts': 'Stock Alerts',
  'dashboard.viewAllActivity': 'View All Activity',
  'dashboard.viewAllAlerts': 'View All Alerts',
  'dashboard.noRecentActivity': 'No recent activity',
  'dashboard.noSalesData': 'No sales data available',
  'dashboard.noAlerts': 'No alerts at this time',
  
  // Alerts
  'alerts.lowStock': 'Low Stock',
  'alerts.expiringSoon': 'Expiring Soon',
  'alerts.unitsLeft': '{{count}} units left',
  'alerts.expiresInDays': 'Expires in {{days}} days',
  
  // Activity
  'activity.sale': 'Sale',
  'activity.lowStockAlert': 'Low Stock Alert',
  'activity.lowStockCount': '{{count}} products need reordering',
  
  // Product
  'product.name': 'Product',
  
  // Landing Page
  'landing.hero.title': 'Maharashtra POS System',
  'landing.hero.subtitle': 'Complete GST-compliant Point of Sale solution for restaurants, pharmacies, and agri businesses in Maharashtra',
  'landing.getStarted': 'Get Started',
  'landing.features.pos.title': 'Complete POS Solution',
  'landing.features.pos.description': 'Full-featured point of sale with inventory management, billing, and reporting',
  'landing.features.keyboard.title': 'Keyboard Optimized',
  'landing.features.keyboard.description': 'Lightning-fast operations with comprehensive keyboard shortcuts',
  'landing.features.multilingual.title': 'Multi-Language Support',
  'landing.features.multilingual.description': 'Available in English, Hindi, and Marathi for local businesses',
  'landing.features.gst.title': 'GST Compliant',
  'landing.features.gst.description': 'Full GST compliance with SGST/CGST calculations for Maharashtra',
  'landing.businessTypes.title': 'Built for Your Business',
  'landing.businessTypes.restaurant': 'Table management, KOT, and kitchen display systems',
  'landing.businessTypes.pharmacy': 'Prescription tracking, expiry management, and medicine inventory',
  'landing.businessTypes.agri': 'Seasonal products, bulk handling, and agricultural compliance',
  'landing.cta.title': 'Ready to Get Started?',
  'landing.cta.subtitle': 'Join thousands of businesses using our POS system',
  'landing.cta.button': 'Start Free Trial',
  
  // Business Setup
  'setup.title': 'Business Setup',
  'setup.subtitle': 'Configure your business to get started with the POS system',
  'setup.businessType': 'Select Your Business Type',
  'setup.businessDetails': 'Business Details',
  'setup.complete': 'Complete Setup',
  'setup.saving': 'Saving...',
  'setup.success.title': 'Setup Complete',
  'setup.success.description': 'Your business has been configured successfully',
  'setup.error.title': 'Setup Failed',
  'setup.fields.businessName': 'Business Name',
  'setup.fields.gstin': 'GSTIN',
  'setup.fields.address': 'Address',
  'setup.fields.phone': 'Phone',
  'setup.fields.email': 'Email',
  'setup.types.restaurant.description': 'Restaurant and food service operations',
  'setup.types.restaurant.feature1': 'Table management',
  'setup.types.restaurant.feature2': 'Kitchen order tickets',
  'setup.types.restaurant.feature3': 'Waiter interface',
  'setup.types.pharmacy.description': 'Medical store and pharmacy operations',
  'setup.types.pharmacy.feature1': 'Prescription tracking',
  'setup.types.pharmacy.feature2': 'Expiry date management',
  'setup.types.pharmacy.feature3': 'Medicine inventory',
  'setup.types.agri.description': 'Agricultural products and farming supplies',
  'setup.types.agri.feature1': 'Seasonal products',
  'setup.types.agri.feature2': 'Bulk handling',
  'setup.types.agri.feature3': 'Agricultural compliance',
  
  // Pages
  'pages.sales.placeholder': 'Sales interface will be implemented here',
  'pages.inventory.placeholder': 'Inventory management will be implemented here',
  'pages.reports.placeholder': 'Reports and analytics will be implemented here',
  'pages.settings.placeholder': 'Settings and configuration will be implemented here',
} as const;

// Now create the full translations object
export const translations = {
  en: englishTranslations,
  hi: {
    // App
    'app.title': 'महाराष्ट्र पीओएस',
    
    // Business Modes
    'businessMode.restaurant': 'रेस्तरां मोड',
    'businessMode.pharmacy': 'फार्मेसी मोड',
    'businessMode.agri': 'कृषि मोड',
    'businessMode.notConfigured': 'कॉन्फ़िगर नहीं किया गया',
    
    // Menu
    'menu.dashboard': 'डैशबोर्ड',
    'menu.newSale': 'नई बिक्री',
    'menu.inventory': 'इन्वेंटरी',
    'menu.customers': 'ग्राहक',
    'menu.prescriptions': 'प्रिस्क्रिप्शन',
    'menu.reports': 'रिपोर्ट',
    'menu.settings': 'सेटिंग्स',
    'menu.logout': 'लॉगआउट',
    
    // Roles
    'role.admin': 'प्रशासक',
    'role.cashier': 'कैशियर',
    'role.waiter': 'वेटर',
    'role.kitchen': 'रसोई स्टाफ',
    'role.unknown': 'अज्ञात भूमिका',
    
    // Shortcuts
    'shortcuts.title': 'कीबोर्ड शॉर्टकट',
    'shortcuts.general': 'सामान्य',
    'shortcuts.sales': 'बिक्री',
    'shortcuts.navigation': 'नेविगेशन',
    'shortcuts.help': 'सहायता',
    'shortcuts.newSale': 'नई बिक्री',
    'shortcuts.print': 'रसीद प्रिंट करें',
    'shortcuts.search': 'उत्पाद खोजें',
    
    // Use English as fallback for other keys
    'landing.hero.title': 'महाराष्ट्र पीओएस सिस्टम',
    'landing.getStarted': 'शुरू करें',
  },
  mr: {
    // App
    'app.title': 'महाराष्ट्र पीओएस',
    
    // Business Modes
    'businessMode.restaurant': 'रेस्टॉरंट मोड',
    'businessMode.pharmacy': 'फार्मसी मोड',
    'businessMode.agri': 'शेती मोड',
    'businessMode.notConfigured': 'कॉन्फिगर केलेले नाही',
    
    // Menu
    'menu.dashboard': 'डॅशबोर्ड',
    'menu.newSale': 'नवीन विक्री',
    'menu.inventory': 'इन्व्हेंटरी',
    'menu.customers': 'ग्राहक',
    'menu.prescriptions': 'प्रिस्क्रिप्शन',
    'menu.reports': 'अहवाल',
    'menu.settings': 'सेटिंग्ज',
    'menu.logout': 'लॉगआउट',
    
    // Roles
    'role.admin': 'प्रशासक',
    'role.cashier': 'कॅशियर',
    'role.waiter': 'वेटर',
    'role.kitchen': 'स्वयंपाकघर कर्मचारी',
    'role.unknown': 'अज्ञात भूमिका',
    
    // Shortcuts
    'shortcuts.title': 'कीबोर्ड शॉर्टकट',
    'shortcuts.general': 'सामान्य',
    'shortcuts.sales': 'विक्री',
    'shortcuts.navigation': 'नेव्हिगेशन',
    'shortcuts.help': 'मदत',
    'shortcuts.newSale': 'नवीन विक्री',
    'shortcuts.print': 'पावती प्रिंट करा',
    'shortcuts.search': 'उत्पादन शोधा',
    
    // Use English as fallback for other keys
    'landing.hero.title': 'महाराष्ट्र पीओएस सिस्टम',
    'landing.getStarted': 'सुरू करा',
  },
};

// Define the type after the translations object
export type TranslationKey = keyof typeof englishTranslations;