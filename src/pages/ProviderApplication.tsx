
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import BusinessInfoStep from "@/components/provider/BusinessInfoStep";
import DocumentUploadStep from "@/components/provider/DocumentUploadStep";
import TermsAndSubmissionStep from "@/components/provider/TermsAndSubmissionStep";
import ApplicationSuccessState from "@/components/provider/ApplicationSuccessState";
import AutoApprovalBanner from "@/components/provider/AutoApprovalBanner";
import StepIndicator from "@/components/provider/StepIndicator";

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
          <ApplicationSuccessState autoApproved={autoApproved} />
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
            <StepIndicator currentStep={step} />
          </div>
          
          <Card>
            <CardContent className="p-6">
              {step === 1 && (
                <BusinessInfoStep
                  businessName={businessName}
                  setBusinessName={setBusinessName}
                  businessDescription={businessDescription}
                  setBusinessDescription={setBusinessDescription}
                  onNext={() => setStep(2)}
                />
              )}
              
              {step === 2 && (
                <DocumentUploadStep
                  documents={documents}
                  onFileChange={handleFileChange}
                  onRemoveFile={removeFile}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}
              
              {step === 3 && (
                <TermsAndSubmissionStep
                  agreement={agreement}
                  setAgreement={setAgreement}
                  onBack={() => setStep(2)}
                  onSubmit={handleSubmit}
                  uploading={uploading}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <AutoApprovalBanner />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProviderApplication;
