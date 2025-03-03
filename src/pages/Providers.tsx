
import React, { useState } from "react";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "sonner";
import { Shield, CheckCircle, Upload, User, Mail, Phone, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const Providers = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate verification submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Verification request submitted successfully. We'll review your documents within 1-2 business days.");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-spaan-secondary">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-spaan-primary">Service Providers</h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect with skilled and verified professionals ready to deliver quality services.
        </p>

        <div className="flex flex-col gap-8">
          {/* Verification Info Card */}
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Shield className="h-6 w-6 text-green-500 mr-3" />
                <CardTitle>Verified Professionals</CardTitle>
              </div>
              <CardDescription>
                All service providers on our platform undergo thorough verification to ensure quality and reliability
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <div className="bg-spaan-primary bg-opacity-10 p-2 rounded-full mr-3">
                    <User className="h-5 w-5 text-spaan-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Identity Verification</h3>
                    <p className="text-sm text-gray-600">Each provider's identity is verified using South African ID or passport.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <div className="bg-spaan-primary bg-opacity-10 p-2 rounded-full mr-3">
                    <ClipboardCheck className="h-5 w-5 text-spaan-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Skills Assessment</h3>
                    <p className="text-sm text-gray-600">We verify professional qualifications and certifications where applicable.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <div className="bg-spaan-primary bg-opacity-10 p-2 rounded-full mr-3">
                    <Shield className="h-5 w-5 text-spaan-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Background Checks</h3>
                    <p className="text-sm text-gray-600">Criminal background checks ensure your safety and peace of mind.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <div className="bg-spaan-primary bg-opacity-10 p-2 rounded-full mr-3">
                    <Phone className="h-5 w-5 text-spaan-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Verification</h3>
                    <p className="text-sm text-gray-600">Mobile numbers are verified through regional carriers for authenticity.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Verification Process Card */}
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle>Get Verified as a Provider</CardTitle>
              <CardDescription>
                Complete the verification process to start offering your services on our platform
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex border-b mb-6">
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'info' ? 'text-spaan-primary border-b-2 border-spaan-primary' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('info')}
                >
                  Information
                </button>
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'apply' ? 'text-spaan-primary border-b-2 border-spaan-primary' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('apply')}
                >
                  Apply Now
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-spaan-primary font-bold">1</div>
                    <div>
                      <h3 className="font-medium text-lg">Register an Account</h3>
                      <p className="text-gray-600">Create your account with basic information and contact details.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-spaan-primary font-bold">2</div>
                    <div>
                      <h3 className="font-medium text-lg">Submit Required Documents</h3>
                      <p className="text-gray-600">Upload your ID/passport, professional certifications, and proof of address.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-spaan-primary font-bold">3</div>
                    <div>
                      <h3 className="font-medium text-lg">Verification Review</h3>
                      <p className="text-gray-600">Our team will review your documents within 1-2 business days.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-spaan-primary font-bold">4</div>
                    <div>
                      <h3 className="font-medium text-lg">Start Offering Services</h3>
                      <p className="text-gray-600">Once verified, you can create service listings and start accepting jobs.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'apply' && (
                <form onSubmit={handleVerificationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <Input id="firstName" placeholder="Enter your first name" required />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <Input id="lastName" placeholder="Enter your last name" required />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <Input id="phone" placeholder="+27 XX XXX XXXX" required />
                    </div>
                    
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Primary Service Category</label>
                      <select 
                        id="service" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="home-services">Home Services</option>
                        <option value="professional">Professional Services</option>
                        <option value="digital">Digital Marketing</option>
                        <option value="education">Education & Tutoring</option>
                        <option value="health">Health & Wellness</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Document Upload</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop your ID/passport and certifications, or click to browse</p>
                        <input type="file" multiple className="hidden" id="fileUpload" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('fileUpload')?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-spaan-primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Verification Request'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default Providers;
