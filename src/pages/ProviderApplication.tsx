import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Upload, ShieldCheck, Check, CheckCircle } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const ProviderApplication = () => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [agreement, setAgreement] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Validate each file
      for (const file of filesArray) {
        if (!(file instanceof File)) continue;
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Only PDF, JPG, and PNG files are allowed.",
            variant: "destructive"
          });
          return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `Each file must be under ${MAX_FILE_SIZE_MB}MB`,
            variant: "destructive"
          });
          return;
        }
      }
      setDocuments([...documents, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    if (!businessName || !businessDescription || documents.length === 0 || !agreement) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields and accept the terms",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload documents to storage first
      const uploadedDocuments = [];
      
      for (const [index, file] of documents.entries()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("verification_documents")
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        uploadedDocuments.push({
          path: fileName,
          type: file.type
        });
      }
      
      // Call the provider verification edge function
      const { data, error } = await supabase.functions.invoke('provider-verification', {
        body: {
          action: 'submit_application',
          businessName,
          businessDescription,
          documents: uploadedDocuments
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setApplicationSuccess(true);
        setAutoApproved(data.auto_approved || false);
        
        toast({
          title: data.auto_approved ? "Application Approved!" : "Application Submitted",
          description: data.message,
          variant: data.auto_approved ? "default" : "default"
        });
        
        // Don't navigate immediately, show success state
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Application submission error:", error);
      toast({
        title: "Error submitting application",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Success state
  if (applicationSuccess) {
    return (
      <main className="min-h-screen bg-spaan-secondary">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              {autoApproved ? (
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
              ) : (
                <ShieldCheck className="h-24 w-24 text-blue-500 mx-auto mb-6" />
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-spaan-primary">
              {autoApproved ? "Application Approved!" : "Application Submitted!"}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              {autoApproved 
                ? "Congratulations! Your provider application has been automatically approved. You can now start creating service listings and accepting jobs."
                : "Thank you for submitting your provider application. Our team will review your documents and get back to you within 1-3 business days."
              }
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => navigate("/profile")}
                className="bg-spaan-primary hover:bg-spaan-primary/90 w-full md:w-auto"
              >
                Go to Profile
              </Button>
              {autoApproved && (
                <Button 
                  onClick={() => navigate("/services")}
                  variant="outline"
                  className="w-full md:w-auto md:ml-4"
                >
                  Browse Services
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-spaan-secondary">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-spaan-primary">
            Provider Application
          </h1>
          
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                step >= 1 ? "bg-spaan-primary text-white" : "bg-gray-200 text-gray-500"
              }`}>
                1
              </div>
              <div className="h-0.5 flex-grow bg-gray-200 mx-2">
                <div className={`h-full bg-spaan-primary transition-all ${
                  step > 1 ? "w-full" : "w-0"
                }`}></div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                step >= 2 ? "bg-spaan-primary text-white" : "bg-gray-200 text-gray-500"
              }`}>
                2
              </div>
              <div className="h-0.5 flex-grow bg-gray-200 mx-2">
                <div className={`h-full bg-spaan-primary transition-all ${
                  step > 2 ? "w-full" : "w-0"
                }`}></div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? "bg-spaan-primary text-white" : "bg-gray-200 text-gray-500"
              }`}>
                3
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
                    <p className="text-gray-600 mb-6">
                      Tell us about your business or service offering
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="businessName" className="text-sm font-medium">
                        Business Name *
                      </label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your business or service name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="businessDescription" className="text-sm font-medium">
                        Business Description *
                      </label>
                      <Textarea
                        id="businessDescription"
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        placeholder="Describe your business, services, and expertise..."
                        rows={5}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setStep(2)}
                      className="bg-spaan-primary hover:bg-spaan-primary/90"
                      disabled={!businessName || !businessDescription}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Document Verification</h2>
                    <p className="text-gray-600 mb-6">
                      Upload documents to verify your identity and business registration
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload Verification Documents</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Accepted formats: PDF, JPG, PNG (Max 10MB each)
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Please upload one or more of the following documents:
                      </p>
                      <ul className="text-sm text-gray-600 mb-4 space-y-1">
                        <li>• Government-issued ID (ID card, passport, driver's license)</li>
                        <li>• Business registration certificate</li>
                        <li>• Professional certification/license</li>
                      </ul>
                      <Input
                        id="documents"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("documents")?.click()}
                        className="mx-auto"
                      >
                        Select Files
                      </Button>
                    </div>
                    
                    {documents.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Selected Documents:</h4>
                        <ul className="space-y-2">
                          {documents.map((file, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-500 h-8 w-8 p-0"
                              >
                                ×
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setStep(3)}
                      className="bg-spaan-primary hover:bg-spaan-primary/90"
                      disabled={documents.length === 0}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Terms & Submission</h2>
                    <p className="text-gray-600 mb-6">
                      Review and accept our terms of service
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Escrow Payment System</h3>
                      <p className="text-sm text-gray-600">
                        As a provider, you agree that all payments will be processed through our secure escrow system. Funds will be released to you only after the client confirms satisfactory completion of the service. A platform fee of 5% will be deducted from each transaction.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Service Obligations</h3>
                      <p className="text-sm text-gray-600">
                        You commit to providing services as described in your listings, maintaining professional standards, and resolving any client issues promptly and courteously.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Verification Process</h3>
                      <p className="text-sm text-gray-600">
                        You understand that all submitted documents will be reviewed for verification purposes. Your provider account will remain in "pending" status until verification is complete, which typically takes 1-3 business days.
                      </p>
                    </div>
                    
                    <label className="flex items-start gap-2 cursor-pointer mt-4">
                      <input
                        type="checkbox"
                        checked={agreement}
                        onChange={(e) => setAgreement(e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm">
                        I agree to the terms and conditions, privacy policy, and provider guidelines of the Spaan platform.
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="bg-spaan-primary hover:bg-spaan-primary/90"
                      disabled={!agreement || uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Auto-Approval System</h3>
                <p className="text-sm text-blue-700 mb-4">
                  At Spaan, we've implemented an auto-approval system to get you started quickly! Your provider application will be automatically approved upon submission, allowing you to start offering services immediately.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Instant approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Start earning immediately</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Create service listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Accept job requests</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProviderApplication;
