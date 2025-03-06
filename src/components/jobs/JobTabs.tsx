
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import JobForm from "./JobForm";
import JobList from "./JobList";
import { JobPost } from "@/integrations/jobs";

interface JobTabsProps {
  jobs: JobPost[];
  loading: boolean;
  onJobCreated: (jobs: JobPost[]) => void;
}

const JobTabs: React.FC<JobTabsProps> = ({ jobs, loading, onJobCreated }) => {
  // Function to switch to Post tab
  const switchToPostTab = () => {
    const postTabTrigger = document.querySelector('[data-value="post"]') as HTMLElement | null;
    if (postTabTrigger) {
      postTabTrigger.click();
    }
  };

  return (
    <Tabs defaultValue="post" className="max-w-3xl mx-auto">
      <TabsList className="grid grid-cols-2 mb-8">
        <TabsTrigger value="post">Post a New Gig</TabsTrigger>
        <TabsTrigger value="my-jobs">My Posted Gigs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="post">
        <JobForm onJobCreated={onJobCreated} />
      </TabsContent>
      
      <TabsContent value="my-jobs">
        <Card>
          <CardHeader>
            <CardTitle>My Posted Gigs</CardTitle>
            <CardDescription>
              Review and manage your previously posted gigs
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <JobList 
              jobs={jobs} 
              loading={loading} 
              onPostNewClick={switchToPostTab} 
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default JobTabs;
