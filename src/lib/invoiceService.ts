import { getApiBaseUrl, getAuthToken } from '../config/api';

export interface InvoiceData {
  reservationId: string;
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
}

export interface EmailInvoiceData extends InvoiceData {
  customerEmail: string;
  customerName?: string;
}

export class InvoiceService {
  private static async makeRequest(endpoint: string, data: any, method: 'POST' | 'GET' = 'POST') {
    const token = getAuthToken();
    
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...(method === 'POST' && { body: JSON.stringify(data) }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `Failed to ${endpoint}`);
    }

    return response;
  }

  /**
   * Generate invoice PDF for a reservation
   */
  static async generateInvoicePDF(data: InvoiceData): Promise<Blob> {
    const response = await this.makeRequest('/admin/invoices/generate', data);
    return response.blob();
  }

  /**
   * Send invoice via email
   */
  static async sendInvoiceEmail(data: EmailInvoiceData): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest('/admin/invoices/send', data);
    return response.json();
  }

  /**
   * Get all invoices for admin
   */
  static async getAllInvoices(): Promise<any[]> {
    const response = await this.makeRequest('/admin/invoices', {}, 'GET');
    const data = await response.json();
    return data.invoices || [];
  }

  /**
   * Get invoice by reservation ID
   */
  static async getInvoiceByReservation(reservationId: string): Promise<any> {
    const response = await this.makeRequest(`/admin/invoices/reservation/${reservationId}`, {}, 'GET');
    return response.json();
  }

  /**
   * Download invoice PDF
   */
  static async downloadInvoicePDF(data: InvoiceData, filename?: string): Promise<void> {
    try {
      const blob = await this.generateInvoicePDF(data);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `invoice-${data.reservationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to download invoice PDF');
    }
  }

  /**
   * Print invoice (opens in new window for printing)
   */
  static async printInvoice(data: InvoiceData): Promise<void> {
    try {
      const blob = await this.generateInvoicePDF(data);
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            window.URL.revokeObjectURL(url);
          };
        };
      } else {
        window.URL.revokeObjectURL(url);
        throw new Error('Failed to open print window');
      }
    } catch (error) {
      throw new Error('Failed to print invoice');
    }
  }

  /**
   * Send invoice automatically after reservation confirmation
   */
  static async sendConfirmationInvoice(reservationId: string, customerEmail: string, customerName?: string): Promise<void> {
    try {
      await this.sendInvoiceEmail({
        reservationId,
        customerEmail,
        customerName,
      });
    } catch (error) {
      console.error('Failed to send confirmation invoice:', error);
      // Don't throw here as this is automatic - just log the error
    }
  }

  /**
   * Generate invoice data for reservation
   */
  static generateInvoiceData(reservation: any, businessInfo?: any): InvoiceData {
    return {
      reservationId: reservation.id || reservation.reservationId,
      businessInfo: {
        name: businessInfo?.name || 'Garden Mirror Event Management',
        address: businessInfo?.address || '123 Event Street, Manila, Philippines',
        phone: businessInfo?.phone || '+63 912 345 6789',
        email: businessInfo?.email || 'info@gardenmirror.com',
        logo: businessInfo?.logo,
      },
    };
  }

  /**
   * Validate invoice data
   */
  static validateInvoiceData(data: InvoiceData): boolean {
    if (!data.reservationId) {
      throw new Error('Reservation ID is required');
    }
    
    if (!data.businessInfo?.name || !data.businessInfo?.email) {
      throw new Error('Business information is incomplete');
    }
    
    return true;
  }

  /**
   * Format currency for invoice display
   */
  static formatCurrency(amount: number, currency: string = 'PHP'): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format date for invoice display
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Calculate invoice totals
   */
  static calculateInvoiceTotals(reservation: any) {
    const subtotal = reservation.totalAmount || 0;
    const downpayment = reservation.downpaymentAmount || (subtotal * 0.3);
    const balance = reservation.balanceAmount || (subtotal - downpayment);
    
    return {
      subtotal,
      downpayment,
      balance,
      total: subtotal,
    };
  }
}