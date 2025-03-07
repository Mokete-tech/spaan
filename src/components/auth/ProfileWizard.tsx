import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle, User, Briefcase } from "lucide-react";

enum WizardStep {
  ROLE_SELECTION = 0,
  PERSONAL_INFO = 1,
  COMPLETE = 2,
}

const ProfileWizard: React.FC = () => {
  const { user, refreshProfile, updateUserRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.ROLE_SELECTION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<"client" | "provider" | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const handleRoleSelect = async (role: "client" | "provider") => {
    setSelectedRole(role);
    setIsLoading(true);
    try {
      await updateUserRole(role);
      setCurrentStep(WizardStep.PERSONAL_INFO);
    } catch (error) {
      console.error("Error setting role:", error);
      toast({
        title: "Error setting role",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPersonalInfo = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updateData: Record<string, any> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        updated_at: new Date().toISOString(),
        phone: formData.phone,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;
      
      await refreshProfile();
      setCurrentStep(WizardStep.COMPLETE);
      
      toast({
        title: "Profile updated successfully",
        description: "You can now use all features of the app",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    const redirectPath = selectedRole === "provider" ? "/provider-application" : "/";
    navigate(redirectPath);
  };

  const renderRoleSelection = () => (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Welcome to Spaan!</CardTitle>
        <CardDescription>How would you like to use our platform?</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          className="grid grid-cols-2 gap-4"
          value={selectedRole || ""}
          onValueChange={(value) => setSelectedRole(value as "client" | "provider")}
        >
          <Label 
            htmlFor="client" 
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
              selectedRole === "client" ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="client" id="client" className="sr-only" />
            <User size={48} className="mb-2 text-blue-600" />
            <div className="font-medium">I Need Help</div>
            <p className="text-sm text-gray-500 text-center mt-2">
              Post jobs and find service providers
            </p>
          </Label>
          
          <Label 
            htmlFor="provider" 
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
              selectedRole === "provider" ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="provider" id="provider" className="sr-only" />
            <Briefcase size={48} className="mb-2 text-blue-600" />
            <div className="font-medium">I Provide Services</div>
            <p className="text-sm text-gray-500 text-center mt-2">
              Offer your skills and find clients
            </p>
          </Label>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => handleRoleSelect(selectedRole as "client" | "provider")}
          className="w-full"
          disabled={!selectedRole || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderPersonalInfo = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Tell us a bit about yourself to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="John"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Doe"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+27 12 345 6789"
            type="tel"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmitPersonalInfo}
          className="w-full"
          disabled={!formData.first_name || !formData.last_name || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderComplete = () => (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <CardTitle>Profile Complete!</CardTitle>
        <CardDescription>
          You're all set and ready to use Spaan services
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {selectedRole === "provider" ? (
          <p className="text-gray-500">
            As a service provider, we need to verify your account before you can start accepting jobs.
            We'll guide you through this process next.
          </p>
        ) : (
          <p className="text-gray-500">
            You can now post jobs and find service providers to help with your tasks.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFinish} className="w-full">
          Continue
        </Button>
      </CardFooter>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case WizardStep.ROLE_SELECTION:
        return renderRoleSelection();
      case WizardStep.PERSONAL_INFO:
        return renderPersonalInfo();
      case WizardStep.COMPLETE:
        return renderComplete();
      default:
        return renderRoleSelection();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">
            {currentStep === WizardStep.ROLE_SELECTION && "Choose Your Role"}
            {currentStep === WizardStep.PERSONAL_INFO && "Complete Your Profile"}
            {currentStep === WizardStep.COMPLETE && "Profile Complete"}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[WizardStep.ROLE_SELECTION, WizardStep.PERSONAL_INFO, WizardStep.COMPLETE].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full ${
                  step === currentStep
                    ? "w-8 bg-blue-500"
                    : step < currentStep
                    ? "w-8 bg-blue-500"
                    : "w-4 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        
        {currentStep === WizardStep.ROLE_SELECTION && (
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle>Welcome to Spaan!</CardTitle>
              <CardDescription>How would you like to use our platform?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                className="grid grid-cols-2 gap-4"
                value={selectedRole || ""}
                onValueChange={(value) => setSelectedRole(value as "client" | "provider")}
              >
                <Label 
                  htmlFor="client" 
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === "client" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="client" id="client" className="sr-only" />
                  <User size={48} className="mb-2 text-blue-600" />
                  <div className="font-medium">I Need Help</div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Post jobs and find service providers
                  </p>
                </Label>
                
                <Label 
                  htmlFor="provider" 
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === "provider" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="provider" id="provider" className="sr-only" />
                  <Briefcase size={48} className="mb-2 text-blue-600" />
                  <div className="font-medium">I Provide Services</div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Offer your skills and find clients
                  </p>
                </Label>
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleRoleSelect(selectedRole as "client" | "provider")}
                className="w-full"
                disabled={!selectedRole || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {currentStep === WizardStep.PERSONAL_INFO && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Tell us a bit about yourself to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+27 12 345 6789"
                  type="tel"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmitPersonalInfo}
                className="w-full"
                disabled={!formData.first_name || !formData.last_name || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {currentStep === WizardStep.COMPLETE && (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <CardTitle>Profile Complete!</CardTitle>
              <CardDescription>
                You're all set and ready to use Spaan services
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {selectedRole === "provider" ? (
                <p className="text-gray-500">
                  As a service provider, we need to verify your account before you can start accepting jobs.
                  We'll guide you through this process next.
                </p>
              ) : (
                <p className="text-gray-500">
                  You can now post jobs and find service providers to help with your tasks.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleFinish} className="w-full">
                Continue
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileWizard;
