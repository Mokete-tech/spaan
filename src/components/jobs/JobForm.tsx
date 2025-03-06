
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { createJob, getUserJobs, JobPost } from "@/integrations/jobs";

interface JobFormProps {
  onJobCreated: (jobs: JobPost[]) => void;
}

const JobForm: React.FC<JobFormProps> = ({ onJobCreated }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    location: "",
    timeframe: "flexible",
    isRemote: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Submit gig posting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post a gig",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budget),
        location: formData.location,
        timeframe: formData.timeframe,
        is_remote: formData.isRemote,
        user_id: user.id
      };
      
      await createJob(jobData);
      
      toast({
        title: "Gig posted successfully!",
        description: "Helpers will be able to contact you soon.",
      });
      
      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        category: "",
        budget: "",
        location: "",
        timeframe: "flexible",
        isRemote: false
      });
      
      // Refresh user's jobs
      const updatedJobs = await getUserJobs(user.id);
      onJobCreated(updatedJobs);
      
    } catch (error: any) {
      console.error("Error posting gig:", error);
      toast({
        title: "Failed to post gig",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe Your Project</CardTitle>
        <CardDescription>
          Provide details about what you need help with so helpers can better understand your requirements.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Gig Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Need Help Moving Furniture"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe exactly what you need help with..."
                rows={5}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("category", value)}
                  value={formData.category}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home-services">Home Services</SelectItem>
                    <SelectItem value="digital-services">Digital Services</SelectItem>
                    <SelectItem value="professional-services">Professional Services</SelectItem>
                    <SelectItem value="trades">Trades & Labor</SelectItem>
                    <SelectItem value="events">Events & Entertainment</SelectItem>
                    <SelectItem value="education">Education & Tutoring</SelectItem>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="budget">Budget (ZAR)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Your budget"
                    className="pl-10"
                    type="number"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Cape Town"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select
                    onValueChange={(value) => handleSelectChange("timeframe", value)}
                    value={formData.timeframe}
                  >
                    <SelectTrigger id="timeframe" className="pl-10">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (ASAP)</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRemote"
                name="isRemote"
                checked={formData.isRemote}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isRemote" className="cursor-pointer">This gig can be done remotely</Label>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post Gig
              </>
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 text-sm text-gray-500">
        <p>
          By posting, you agree to our terms of service and privacy policy.
        </p>
        <p>
          Your contact details will only be shared with helpers you approve.
        </p>
      </CardFooter>
    </Card>
  );
};

export default JobForm;
