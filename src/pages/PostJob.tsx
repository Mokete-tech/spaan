
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserJobs, JobPost } from "@/integrations/jobs";
import JobTabs from "@/components/jobs/JobTabs";

const PostJob = () => {
  const { user } = useAuth();
  const [postedJobs, setPostedJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserJobs = async () => {
      if (user) {
        try {
          setLoading(true);
          const jobs = await getUserJobs(user.id);
          setPostedJobs(jobs);
        } catch (error) {
          console.error("Error fetching user's gigs:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserJobs();
  }, [user]);

  // Handle refreshing jobs list after a new job is created
  const handleJobCreated = (updatedJobs: JobPost[]) => {
    setPostedJobs(updatedJobs);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Post Your Gig</h1>
          <p className="text-gray-600">
            Describe what you need help with and skilled helpers will contact you with offers
          </p>
        </div>
        
        <JobTabs 
          jobs={postedJobs} 
          loading={loading} 
          onJobCreated={handleJobCreated} 
        />
      </div>
    </main>
  );
};

export default PostJob;
