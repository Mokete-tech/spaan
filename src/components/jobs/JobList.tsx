
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { JobPost } from "@/integrations/jobs";

interface JobListProps {
  jobs: JobPost[];
  loading: boolean;
  onPostNewClick: () => void;
}

// Helper function to format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Helper function to get status badge color
const getStatusBadgeClass = (status: JobPost['status']) => {
  switch(status) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const JobList: React.FC<JobListProps> = ({ jobs, loading, onPostNewClick }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p>Loading your gigs...</p>
      </div>
    );
  }
  
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't posted any gigs yet</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={onPostNewClick}
        >
          Post Your First Gig
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{job.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Posted {job.created_at ? formatDate(job.created_at) : 'recently'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {job.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {job.is_remote ? 'Remote' : 'In-person'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  ZAR {job.budget}
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
              {job.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;
