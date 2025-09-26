import React from 'react';
import { Button } from './ui/button';
import { Shield, Scale, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalComplianceModal({ isOpen, onClose }: LegalComplianceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Legal Compliance Notice</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Shield className="h-3 w-3 mr-1" />
              Philippine Law Compliant
            </Badge>
            <p className="text-sm text-muted-foreground">
              Garden Mirror operates in full compliance with Philippine legal requirements
            </p>
          </div>

          {/* Cybercrime Law Compliance */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-red-800">
                <Scale className="h-5 w-5" />
                Cybercrime Prevention Act (RA 10175)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-red-700 space-y-2">
                <p><strong>Zero Tolerance Policy:</strong> We strictly prohibit any activities that violate the Cybercrime Prevention Act of 2012.</p>
                <div className="bg-white/70 rounded p-3">
                  <p className="font-medium mb-2">Prohibited Activities Include:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Illegal access to computer systems</li>
                    <li>• Computer-related fraud or identity theft</li>
                    <li>• Data interference or system interference</li>
                    <li>• Cyber libel or online defamation</li>
                    <li>• Spam or unsolicited communications</li>
                  </ul>
                </div>
                <p className="text-xs">
                  <strong>Penalties:</strong> Violations may result in imprisonment and/or fines up to ₱10,000,000
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Privacy Act */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800">Data Privacy Act (RA 10173)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-2">
                <p>Your personal information is protected under the Data Privacy Act of 2012.</p>
                <div className="bg-white/70 rounded p-3">
                  <p className="font-medium mb-1">We ensure:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Secure data collection and storage</li>
                    <li>• Limited data processing for business purposes only</li>
                    <li>• No unauthorized sharing with third parties</li>
                    <li>• Right to access, correct, or delete your data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* E-Commerce Act */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800">E-Commerce Act (RA 8792)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700 space-y-2">
                <p>All electronic transactions are conducted in accordance with the Electronic Commerce Act.</p>
                <div className="bg-white/70 rounded p-3">
                  <p className="font-medium mb-1">Security Measures:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Encrypted payment processing</li>
                    <li>• Secure electronic record keeping</li>
                    <li>• Digital signature validation</li>
                    <li>• Transaction audit trails</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <div className="bg-gray-900 text-white rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Emergency Cybercrime Reporting
            </h4>
            <div className="text-sm space-y-1">
              <p><strong>PNP Anti-Cybercrime Group:</strong> 02-723-0401</p>
              <p><strong>NBI Cybercrime Division:</strong> 02-525-4093</p>
              <p><strong>Garden Mirror Report Email:</strong> report@gardenmirror.com</p>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">Legal Acknowledgment</h4>
                <p className="text-sm text-amber-700">
                  By using Garden Mirror's services, you acknowledge that you understand and will comply with all applicable Philippine laws. 
                  Any violations will be reported to the appropriate authorities and may result in legal action.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-6">
          <div className="flex justify-center">
            <Button onClick={onClose} className="px-8">
              I Understand and Agree
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            By clicking "I Understand and Agree", you acknowledge that you have read and understood this legal compliance notice.
          </p>
        </div>
      </div>
    </div>
  );
}