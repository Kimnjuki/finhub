import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, XCircle, Upload, FileText, Shield, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

interface VerificationDocument {
  id: string;
  type: 'id_document' | 'proof_of_address' | 'analyst_certification' | 'accredited_investor';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  documentUrl: string;
}

const KYCVerification = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const submitVerification = useMutation(api.users.submitVerification);
  const verifications = useQuery(api.users.getUserVerifications) as VerificationDocument[] | undefined;

  const verificationTypes = [
    { id: 'id_document', name: 'Government ID', description: 'Passport, National ID, or Driver\'s License', icon: FileText, required: true },
    { id: 'proof_of_address', name: 'Proof of Address', description: 'Utility bill or bank statement (last 3 months)', icon: FileText, required: true },
    { id: 'analyst_certification', name: 'Analyst Certification', description: 'Professional certification for analysts', icon: Shield, required: false },
    { id: 'accredited_investor', name: 'Accredited Investor', description: 'Financial statements or accreditation letter', icon: Shield, required: false },
  ];

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('Please select a verification type');
      return;
    }
    if (!documentUrl) {
      toast.error('Please provide a document URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitVerification({
        verificationType: selectedType as any,
        documentUrl,
      });
      toast.success('Verification document submitted successfully');
      setShowUploadDialog(false);
      setSelectedType('');
      setDocumentUrl('');
    } catch (error) {
      toast.error('Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/30">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const pendingCount = verifications?.filter(v => v.status === 'pending').length || 0;
  const approvedCount = verifications?.filter(v => v.status === 'approved').length || 0;
  const totalRequired = verificationTypes.filter(v => v.required).length;
  const progressPercent = (approvedCount / totalRequired) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                KYC Verification
              </CardTitle>
              <CardDescription>Verify your identity to unlock all features</CardDescription>
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Submit Verification Document</DialogTitle>
                  <DialogDescription>
                    Upload a clear photo or scan of your document
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {verificationTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} {type.required && '*'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedType && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground">
                        {verificationTypes.find(t => t.id === selectedType)?.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Document URL</Label>
                    <Input
                      placeholder="https://example.com/document.pdf"
                      value={documentUrl}
                      onChange={e => setDocumentUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your document to a secure cloud storage and paste the link here
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowUploadDialog(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verification Progress</span>
              <span className="font-medium">{approvedCount} / {totalRequired} required</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Verification Types Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {verificationTypes.map(type => {
              const verification = verifications?.find(v => v.type === type.id);
              const status = verification?.status || 'none';
              
              return (
                <Card key={type.id} className="border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${status === 'approved' ? 'bg-green-500/10' : 'bg-muted/30'}`}>
                        <type.icon className={`h-4 w-4 ${status === 'approved' ? 'text-green-400' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{type.name}</h4>
                          {status !== 'none' && getStatusIcon(status)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{type.description}</p>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(status)}
                          {type.required && <span className="text-[10px] text-muted-foreground">Required</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Submissions */}
          {verifications && verifications.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Recent Submissions</Label>
              <div className="space-y-2">
                {verifications.slice(0, 5).map(verification => (
                  <Card key={verification.id} className="border-border/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {verification.type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(verification.status)}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      {verification.reviewNotes && (
                        <div className="mt-2 p-2 rounded bg-muted/30">
                          <p className="text-xs text-muted-foreground">{verification.reviewNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Why verify your identity?
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-3 w-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                <span>Higher deposit and withdrawal limits</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-3 w-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                <span>Access to advanced trading features</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-3 w-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                <span>Enhanced account security</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-3 w-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                <span>Priority customer support</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;