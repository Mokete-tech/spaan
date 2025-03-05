
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, DollarSign, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PostJob = () => {
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
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating loading of user's posted jobs
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Submit job posting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post a job",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Supabase (placeholder for now)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Job posted successfully!",
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
      
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Failed to post job",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to switch to Post tab
  const switchToPostTab = () => {
    const postTabTrigger = document.querySelector('[data-value="post"]') as HTMLElement | null;
    if (postTabTrigger) {
      postTabTrigger.click();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Post Your Job</h1>
          <p className="text-gray-600">
            Describe what you need help with and skilled helpers will contact you with offers
          </p>
        </div>
        
        <Tabs defaultValue="post" className="max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="post">Post a New Job</TabsTrigger>
            <TabsTrigger value="my-jobs">My Posted Jobs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="post">
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
                      <Label htmlFor="title">Job Title</Label>
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
                      <Label htmlFor="isRemote" className="cursor-pointer">This job can be done remotely</Label>
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
                        Post Job
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
          </TabsContent>
          
          <TabsContent value="my-jobs">
            <Card>
              <CardHeader>
                <CardTitle>My Posted Jobs</CardTitle>
                <CardDescription>
                  Review and manage your previously posted jobs
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p>Loading your jobs...</p>
                  </div>
                ) : postedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={switchToPostTab}
                    >
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Job listings would go here */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Need help with website design</h3>
                      <p className="text-sm text-gray-500 mt-1">Posted 2 days ago · 3 responses</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default PostJob;
