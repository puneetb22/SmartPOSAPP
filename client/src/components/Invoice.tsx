import { forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface InvoiceProps {
  sale: {
    id?: string;
    invoiceNumber: string;
    customer?: {
      name: string;
      phone: string;
      address?: string;
      gstin?: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    taxAmount: number;
    total: number;
    paymentMethod: string;
    createdAt: string;
  };
  businessConfig: {
    businessName: string;
    address?: string;
    phone?: string;
    email?: string;
    gstin?: string;
  };
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
  ({ sale, businessConfig }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <div ref={ref} className="max-w-2xl mx-auto p-8 bg-white">
        <Card className="border-2">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {businessConfig.businessName}
              </h1>
              {businessConfig.address && (
                <p className="text-sm text-gray-600 mt-1">{businessConfig.address}</p>
              )}
              <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2">
                {businessConfig.phone && (
                  <span>Phone: {businessConfig.phone}</span>
                )}
                {businessConfig.email && (
                  <span>Email: {businessConfig.email}</span>
                )}
              </div>
              {businessConfig.gstin && (
                <p className="text-sm text-gray-600 mt-1">GSTIN: {businessConfig.gstin}</p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Invoice Details</h3>
                <p className="text-sm">
                  <span className="font-medium">Invoice No:</span> {sale.invoiceNumber}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Date:</span> {formatDate(sale.createdAt)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Payment:</span> {sale.paymentMethod.toUpperCase()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Bill To</h3>
                {sale.customer ? (
                  <>
                    <p className="text-sm font-medium">{sale.customer.name}</p>
                    <p className="text-sm">{sale.customer.phone}</p>
                    {sale.customer.address && (
                      <p className="text-sm">{sale.customer.address}</p>
                    )}
                    {sale.customer.gstin && (
                      <p className="text-sm">GSTIN: {sale.customer.gstin}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm">Walk-in Customer</p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                      <td className="text-right py-2">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-₹{sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax (GST):</span>
                <span>₹{sale.taxAmount.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>Thank you for your business!</p>
              <p className="mt-1">This is a computer generated invoice.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

Invoice.displayName = 'Invoice';