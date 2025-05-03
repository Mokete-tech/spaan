
import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReactionButtonProps {
  contentId: string;
  contentType: "service" | "job" | "post";
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

// Define type interfaces for the RPC parameters
interface CheckReactionParams {
  content_id_param: string;
  content_type_param: string;
  user_id_param: string;
}

interface GetReactionCountParams {
  content_id_param: string;
  content_type_param: string;
}

interface AddReactionParams extends CheckReactionParams {
  reaction_type_param: string;
}

const ReactionButton = ({
  contentId,
  contentType,
  className = "",
  variant = "outline",
  size = "md"
}: ReactionButtonProps) => {
  const [reacted, setReacted] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Determine the button size based on prop
  const buttonSize = size === "sm" 
    ? "h-8 w-8" 
    : size === "lg" 
      ? "h-10 w-10" 
      : "h-9 w-9";

  // Load initial reaction state
  useEffect(() => {
    const checkUserReaction = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) return;

        const userId = session.session.user.id;
        
        // Use rpc to call the check_user_reaction database function
        const { data, error } = await supabase.rpc<boolean, CheckReactionParams>('check_user_reaction', {
          content_id_param: contentId,
          content_type_param: contentType,
          user_id_param: userId
        });
        
        if (error) {
          console.error('Error checking reaction:', error);
          return;
        }
        
        setReacted(!!data);
        
        // Get total reactions count using rpc
        const { data: countData, error: countError } = await supabase.rpc<number, GetReactionCountParams>('get_reaction_count', {
          content_id_param: contentId,
          content_type_param: contentType
        });
        
        if (countError) {
          console.error('Error getting reaction count:', countError);
          return;
        }
        
        // Ensure countData is treated as a number
        setCount(typeof countData === 'number' ? countData : 0);
      } catch (error) {
        console.error('Error checking reactions:', error);
      }
    };
    
    checkUserReaction();
  }, [contentId, contentType]);

  const handleReaction = async () => {
    try {
      setLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast.error("Please sign in to react");
        return;
      }
      
      const userId = session.session.user.id;
      
      if (reacted) {
        // Remove reaction using rpc
        const { error } = await supabase.rpc<null, CheckReactionParams>('delete_reaction', {
          content_id_param: contentId,
          content_type_param: contentType,
          user_id_param: userId
        });
        
        if (error) {
          console.error('Error deleting reaction:', error);
          toast.error("Failed to remove reaction");
          return;
        }
        
        setReacted(false);
        setCount(prev => Math.max(0, prev - 1));
        toast.success("Reaction removed");
      } else {
        // Add reaction using rpc
        const { error } = await supabase.rpc<null, AddReactionParams>('add_reaction', {
          content_id_param: contentId,
          content_type_param: contentType,
          user_id_param: userId,
          reaction_type_param: 'tick'
        });
        
        if (error) {
          console.error('Error adding reaction:', error);
          toast.error("Failed to add reaction");
          return;
        }
        
        setReacted(true);
        setCount(prev => prev + 1);
        toast.success("Thanks for your reaction!");
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error("Failed to process your reaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        variant={variant}
        size="icon"
        className={cn(
          buttonSize,
          "rounded-full transition-all duration-200",
          reacted 
            ? "bg-green-50 text-green-600 border-green-300" 
            : "hover:bg-green-50 hover:text-green-600",
          className
        )}
        onClick={handleReaction}
        disabled={loading}
      >
        <Check 
          className={cn(
            "h-4 w-4 transition-all",
            reacted && "fill-green-100",
            loading && "animate-pulse"
          )} 
        />
      </Button>
      {count > 0 && (
        <span className="text-xs text-gray-600 ml-1">{count}</span>
      )}
    </div>
  );
};

export default ReactionButton;
