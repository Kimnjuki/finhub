import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Shield, Smartphone, Key, Copy, CheckCircle, AlertTriangle, QrCode, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const TwoFactorAuth = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes] = useState([
    'ABCD-1234-EFGH',
    'IJKL-5678-MNOP',
    'QRST-9012-UVWX',
    'YZ12-3456-7890',
  ]);
  const [qrCode] = useState('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij7wn5m7PC90ZXh0Pjwvc3ZnPg==');

  const handleSetup = () => {
    setShowSetup(true);
  };

  const handleEnable = () => {
    setShowSetup(true);
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    // Simulate verification
    toast.success('Two-factor authentication enabled successfully!');
    setIsEnabled(true);
    setShowVerify(false);
    setShowSetup(false);
    setVerificationCode('');
  };

  const handleDisable = () => {
    setIsEnabled(false);
    toast.success('Two-factor authentication disabled');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </div>
          {isEnabled && (
            <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEnabled ? (
          <>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/30">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Strongly Recommended</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable 2FA to protect your account from unauthorized access. You'll need an authenticicator app like Google Authenticator or Authy.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border/30">
                  <CardContent className="p-4">
                    <Smartphone className="h-8 w-8 text-blue-400 mb-3" />
                    <h4 className="font-medium text-sm mb-1">Authenticator App</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Use Google Authenticator, Authy, or similar apps
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={handleSetup}
                      variant="default"
                    >
                      Setup App
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/30 opacity-60">
                  <CardContent className="p-4">
                    <Key className="h-8 w-8 text-gray-400 mb-3" />
                    <h4 className="font-medium text-sm mb-1">SMS/Email</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Coming soon - less secure than authenticator apps
                    </p>
                    <Button className="w-full" disabled variant="outline">
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="font-medium text-sm">2FA is Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Backup Codes</Label>
              <p className="text-xs text-muted-foreground">
                Save these codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </p>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 font-mono text-xs">
                {backupCodes.map((code, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-background">
                    <span>{code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={handleDisable}
              className="w-full"
            >
              Disable 2FA
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="p-4 bg-white rounded-lg">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            
            <div className="w-full space-y-2">
              <Label className="text-xs">Manual Entry Key</Label>
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value="JBSWY3DPEHPK3PXP" 
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('JBSWY3DPEHPK3PXP')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Open your authenticator app, scan the QR code, and enter the 6-digit code below.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full"
              onClick={() => {
                setShowSetup(false);
                setShowVerify(true);
              }}
            >
              I've Scanned the QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVerify} onOpenChange={setShowVerify}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Setup</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg font-mono"
                  value={verificationCode[i] || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const newCode = verificationCode.split('');
                    newCode[i] = value;
                    setVerificationCode(newCode.join(''));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !verificationCode[i] && i > 0) {
                      const newCode = verificationCode.split('');
                      newCode[i - 1] = '';
                      setVerificationCode(newCode.join(''));
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowVerify(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
            >
              Verify & Enable
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TwoFactorAuth;