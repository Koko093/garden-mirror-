import React from 'react';
import { X, Shield, Scale, AlertTriangle, FileText, Users, CreditCard, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

interface TermsAndConditionsProps {
  isOpen?: boolean;
  onClose?: () => void;
  showAsModal?: boolean;
  compact?: boolean;
}

export function TermsAndConditions({ isOpen, onClose, showAsModal = false, compact = false }: TermsAndConditionsProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const termsContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className={compact ? "text-lg" : "text-2xl"}>Terms and Conditions</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Last Updated: {currentDate}
        </p>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Shield className="h-3 w-3 mr-1" />
          Cybercrime Law Compliant
        </Badge>
      </div>

      <Separator />

      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Agreement Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">
            By accessing and using Garden Mirror's event venue reservation services, you agree to comply with and be bound by these Terms and Conditions, 
            applicable laws including the <strong>Cybercrime Prevention Act of 2012 (Republic Act 10175)</strong>, 
            Data Privacy Act of 2012 (Republic Act 10173), and other relevant Philippine laws.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Legal Notice:</strong> This agreement is governed by Philippine law and violations may result in civil and criminal penalties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cybercrime Law Compliance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-red-600" />
            Cybercrime Prevention Act Compliance
          </CardTitle>
          <CardDescription>
            Republic Act 10175 - Cybercrime Prevention Act of 2012
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-sm">Prohibited Activities</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Users are strictly prohibited from engaging in any activities that violate the Cybercrime Prevention Act, including but not limited to:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• Illegal access to computer systems or data</li>
                <li>• Computer-related fraud or identity theft</li>
                <li>• Data interference or system interference</li>
                <li>• Misuse of devices or access codes</li>
                <li>• Cyber libel or online defamation</li>
                <li>• Child pornography or cybersex</li>
                <li>• Unsolicited commercial communications (spam)</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-sm">Data Protection & Privacy</h4>
              <p className="text-sm text-muted-foreground mt-1">
                In compliance with the Data Privacy Act of 2012 (RA 10173), we implement appropriate security measures to protect your personal information.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-sm">Reporting Violations</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Any suspected cybercrime activities will be reported to the Philippine National Police Anti-Cybercrime Group (PNP-ACG) 
                and the National Bureau of Investigation Cybercrime Division (NBI-CCD).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Terms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Event Venue Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Reservation Policy</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Valid ID required for all bookings</li>
                <li>• 30% downpayment required to confirm reservation</li>
                <li>• 70% balance due before event date</li>
                <li>• Cancellations subject to fees</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">User Responsibilities</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Provide accurate booking information</li>
                <li>• Comply with venue rules and regulations</li>
                <li>• Respect other users and staff</li>
                <li>• Report any issues immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Payment & Financial Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p><strong>Payment Security:</strong> All payments are processed through secure, encrypted channels compliant with international security standards.</p>
            <p><strong>Fraud Prevention:</strong> We employ advanced fraud detection systems. Suspicious transactions will be investigated and may be reported to authorities.</p>
            <p><strong>Refund Policy:</strong> Refunds are processed according to our cancellation policy. Processing time is 7-14 business days.</p>
            <p><strong>Currency:</strong> All transactions are in Philippine Peso (PHP) unless otherwise specified.</p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data Collection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            Privacy & Data Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p><strong>Information We Collect:</strong> Personal information, contact details, payment information, and usage data necessary for service provision.</p>
            <p><strong>Data Usage:</strong> Information is used solely for booking management, customer service, and legal compliance.</p>
            <p><strong>Data Sharing:</strong> We do not sell or share personal data with third parties except as required by law or court order.</p>
            <p><strong>Data Retention:</strong> Personal data is retained as required by law and deleted when no longer necessary.</p>
            <p><strong>Your Rights:</strong> You have the right to access, correct, or request deletion of your personal data in accordance with RA 10173.</p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Compliance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5" />
            Legal Compliance & Enforcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p><strong>Governing Law:</strong> These terms are governed by the laws of the Republic of the Philippines.</p>
            <p><strong>Jurisdiction:</strong> Any legal disputes shall be resolved in Philippine courts with competent jurisdiction.</p>
            <p><strong>Compliance Monitoring:</strong> We actively monitor compliance with these terms and applicable laws.</p>
            <p><strong>Violation Consequences:</strong> Violations may result in account suspension, legal action, and cooperation with law enforcement.</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-red-800">
              <strong>Criminal Liability:</strong> Violations of the Cybercrime Prevention Act may result in imprisonment and/or fines up to ₱10,000,000 
              depending on the severity of the offense.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Contact & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p><strong>For questions about these terms:</strong> contact@gardenmirror.com</p>
            <p><strong>For privacy concerns:</strong> privacy@gardenmirror.com</p>
            <p><strong>To report violations:</strong> report@gardenmirror.com</p>
            <p><strong>Emergency contacts:</strong> PNP-ACG Hotline: 02-723-0401</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
      </div>
    </div>
  );

  if (showAsModal && isOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl">Terms and Conditions</h2>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1 p-6">
            {termsContent}
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "container mx-auto px-4 py-8"}>
      <ScrollArea className={compact ? "h-96" : "h-auto"}>
        {termsContent}
      </ScrollArea>
    </div>
  );
}