
import { supabase } from "@/integrations/supabase/client";

export interface JobPost {
  id?: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  timeframe: string;
  is_remote: boolean;
  user_id: string;
  created_at?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
}

export const createJob = async (jobData: Omit<JobPost, 'id' | 'created_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([
      {
        ...jobData,
        status: 'open'
      }
    ])
    .select();
  
  if (error) throw error;
  return data?.[0] as JobPost;
};

export const getUserJobs = async (userId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Convert the status string to the expected union type
  return data.map(job => ({
    ...job,
    status: job.status as JobPost['status']
  })) as JobPost[];
};

export const getJobById = async (jobId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  
  if (error) throw error;
  
  // Convert the status string to the expected union type
  return {
    ...data,
    status: data.status as JobPost['status']
  } as JobPost;
};

export const updateJobStatus = async (jobId: string, status: JobPost['status']) => {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select();
  
  if (error) throw error;
  
  // Convert the status string to the expected union type
  return data?.[0] ? {
    ...data[0],
    status: data[0].status as JobPost['status']
  } as JobPost : null;
};

export const getAllJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Convert the status string to the expected union type
  return data.map(job => ({
    ...job,
    status: job.status as JobPost['status']
  })) as JobPost[];
};
