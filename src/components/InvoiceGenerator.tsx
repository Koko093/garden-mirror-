import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Download, 
  Mail, 
  Printer,
  Calendar,
  MapPin,
  Users,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl } from '../config/api';

interface InvoiceProps {
  reservation: {
    id: string;
    reservationId: string;
    eventTitle: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    guestCount: number;
    totalAmount: number;
    downpaymentAmount: number;
    balanceAmount: number;
    status: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    room?: {
      name: string;
      capacity: number;
    };
    package?: {
      name: string;
      price: number;
      inclusions: string[];
    };
    additionalServices?: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    createdAt: string;
  };
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  onClose?: () => void;
}

export function InvoiceGenerator({ reservation, businessInfo, onClose }: InvoiceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const defaultBusinessInfo = {
    name: 'Garden Mirror Event Management',
    address: '123 Event Street, Manila, Philippines',
    phone: '+63 912 345 6789',
    email: 'info@gardenmirror.com',
    ...businessInfo
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const generateInvoicePDF = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch(`${getApiBaseUrl()}/admin/invoices/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          businessInfo: defaultBusinessInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${reservation.reservationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice PDF generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendInvoiceEmail = async () => {
    try {
      setIsSending(true);
      
      const response = await fetch(`${getApiBaseUrl()}/admin/invoices/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          customerEmail: reservation.contactEmail,
          businessInfo: defaultBusinessInfo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invoice');
      }

      toast.success('Invoice sent to customer email successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invoice');
    } finally {
      setIsSending(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold">Invoice Preview</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={printInvoice}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={generateInvoicePDF}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button
            onClick={sendInvoiceEmail}
            disabled={isSending}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Email Invoice'}
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="space-y-6">
          {/* Business Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">{defaultBusinessInfo.name}</h1>
              <div className="text-muted-foreground space-y-1">
                <p>{defaultBusinessInfo.address}</p>
                <p>{defaultBusinessInfo.phone}</p>
                <p>{defaultBusinessInfo.email}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <FileText className="w-4 h-4 mr-2" />
                INVOICE
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Invoice #{reservation.reservationId}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {formatDate(reservation.createdAt)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-medium">{reservation.contactPerson}</p>
                <p className="text-muted-foreground">{reservation.contactEmail}</p>
                <p className="text-muted-foreground">{reservation.contactPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Event Details:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(reservation.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{reservation.guestCount} guests</span>
                </div>
                {reservation.room && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.room.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Title */}
          <div>
            <h2 className="text-xl font-semibold">{reservation.eventTitle}</h2>
            <p className="text-muted-foreground">
              {reservation.startTime} - {reservation.endTime}
            </p>
          </div>

          {/* Services Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Package */}
                {reservation.package && (
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{reservation.package.name}</p>
                        {reservation.package.inclusions && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Includes: {reservation.package.inclusions.join(', ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(reservation.package.price)}
                    </td>
                  </tr>
                )}

                {/* Room */}
                {reservation.room && !reservation.package && (
                  <tr className="border-t">
                    <td className="p-4">
                      <p className="font-medium">Venue: {reservation.room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Capacity: {reservation.room.capacity} guests
                      </p>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(reservation.totalAmount - (reservation.additionalServices?.reduce((sum, service) => sum + (service.price * service.quantity), 0) || 0))}
                    </td>
                  </tr>
                )}

                {/* Additional Services */}
                {reservation.additionalServices?.map((service, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {service.quantity}
                      </p>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(service.price * service.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(reservation.totalAmount)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Downpayment (30%):</span>
                <span>{formatCurrency(reservation.downpaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Remaining Balance:</span>
                <span>{formatCurrency(reservation.balanceAmount)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-primary">{formatCurrency(reservation.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="text-center">
            <Badge 
              variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
              className="text-sm px-4 py-2"
            >
              Status: {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </Badge>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-6 border-t">
            <p>Thank you for choosing {defaultBusinessInfo.name}!</p>
            <p>For any questions, please contact us at {defaultBusinessInfo.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}