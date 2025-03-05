
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdBanner from "@/components/ui/ad-banner";
import { MapPin, Clock, DollarSign, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GigPosting = () => {
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
  const [postedGigs, setPostedGigs] = useState([]);
  const [loading, setLoading] = useState(true);

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
        description: "Please sign in to post a gig request",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Supabase (this will be implemented later)
      toast({
        title: "Gig posted successfully!",
        description: "Service providers will be able to contact you soon.",
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
      console.error("Error posting gig:", error);
      toast({
        title: "Failed to post gig",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <AdBanner slot="top" showCloseButton={true} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Post Your Gig Request</h1>
          <p className="text-gray-600">
            Describe what you need help with and providers will contact you with offers
          </p>
        </div>
        
        <Tabs defaultValue="post" className="max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="post">Post a New Gig</TabsTrigger>
            <TabsTrigger value="my-gigs">My Posted Gigs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="post">
            <Card>
              <CardHeader>
                <CardTitle>Describe Your Project</CardTitle>
                <CardDescription>
                  Provide details about what you need help with so service providers can better understand your requirements.
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
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post Gig Request"}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 text-sm text-gray-500">
                <p>
                  By posting, you agree to our terms of service and privacy policy.
                </p>
                <p>
                  Your contact details will only be shared with service providers you approve.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="my-gigs">
            <Card>
              <CardHeader>
                <CardTitle>My Posted Gigs</CardTitle>
                <CardDescription>
                  Review and manage your previously posted gig requests
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p>Loading your gigs...</p>
                  </div>
                ) : postedGigs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't posted any gigs yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => document.querySelector('[data-value="post"]')?.click()}
                    >
                      Post Your First Gig
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Gig listings would go here */}
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

export default GigPosting;
