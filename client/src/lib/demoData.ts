// Demo data for immediate POS access when database is unavailable
export const demoProducts = [
  {
    id: 1,
    name: 'Masala Dosa',
    nameHi: 'मसाला डोसा',
    nameMr: 'मसाला डोसा',
    sku: 'FOOD001',
    categoryId: 1,
    price: 80.00,
    costPrice: 35.00,
    stock: 100,
    lowStockThreshold: 5,
    barcode: '8901030875063',
    description: 'Traditional South Indian crispy crepe with spiced potato filling',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Paracetamol 500mg',
    nameHi: 'पैरासिटामोल ५००mg',
    nameMr: 'पॅरासिटामॉल ५००mg',
    sku: 'MED001',
    categoryId: 2,
    price: 25.00,
    costPrice: 12.00,
    stock: 200,
    lowStockThreshold: 20,
    barcode: '8901030875064',
    description: 'Pain relief and fever reducer tablet',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Basmati Rice 1kg',
    nameHi: 'बासमती चावल १kg',
    nameMr: 'बासमती तांदूळ १kg',
    sku: 'AGRI001',
    categoryId: 3,
    price: 120.00,
    costPrice: 85.00,
    stock: 50,
    lowStockThreshold: 10,
    barcode: '8901030875065',
    description: 'Premium quality long grain basmati rice',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const demoCategories = [
  {
    id: 1,
    name: 'Food & Beverages',
    nameHi: 'भोजन और पेय',
    nameMr: 'अन्न आणि पेय',
    description: 'Restaurant food items and beverages',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Medicines',
    nameHi: 'दवाइयां',
    nameMr: 'औषधे',
    description: 'Pharmaceutical products and medicines',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Agricultural Products',
    nameHi: 'कृषि उत्पाद',
    nameMr: 'कृषी उत्पादने',
    description: 'Farm products and agricultural items',
    createdAt: new Date().toISOString()
  }
];

export const demoSales = [
  {
    id: 1,
    invoiceNumber: 'INV-2025-001',
    customerId: null,
    userId: 'demo_user',
    subtotal: 205.00,
    discount: 5.00,
    taxAmount: 36.00,
    total: 236.00,
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    notes: 'Demo sale transaction',
    createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
  },
  {
    id: 2,
    invoiceNumber: 'INV-2025-002',
    customerId: null,
    userId: 'demo_user',
    subtotal: 120.00,
    discount: 0.00,
    taxAmount: 21.60,
    total: 141.60,
    paymentMethod: 'upi',
    paymentStatus: 'completed',
    notes: 'UPI payment transaction',
    createdAt: new Date().toISOString()
  }
];

export const demoCustomers = [
  {
    id: 1,
    name: 'राम पाटील',
    phone: '9876543210',
    email: 'ram.patil@example.com',
    address: 'शिवाजी नगर, पुणे',
    gstin: '',
    loyaltyPoints: 250,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'सुनीता शर्मा',
    phone: '9765432109',
    email: 'sunita.sharma@example.com',
    address: 'कॉलेज रोड, नाशिक',
    gstin: '',
    loyaltyPoints: 180,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to get demo data based on business type
export function getDemoDataForBusinessType(businessType: string) {
  switch (businessType) {
    case 'restaurant':
      return {
        products: demoProducts.filter(p => p.categoryId === 1),
        categories: demoCategories.filter(c => c.id === 1)
      };
    case 'pharmacy':
      return {
        products: demoProducts.filter(p => p.categoryId === 2),
        categories: demoCategories.filter(c => c.id === 2)
      };
    case 'agri':
      return {
        products: demoProducts.filter(p => p.categoryId === 3),
        categories: demoCategories.filter(c => c.id === 3)
      };
    default:
      return {
        products: demoProducts,
        categories: demoCategories
      };
  }
}