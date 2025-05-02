
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
        
        // Use a stored function that returns boolean
        const { data, error } = await supabase.functions.invoke('check_user_reaction', {
          body: {
            content_id: contentId,
            content_type: contentType,
            user_id: userId
          }
        });
        
        if (error) {
          console.error('Error checking reaction:', error);
          return;
        }
        
        if (data?.exists) {
          setReacted(!!data.exists);
        }
        
        // Get total reactions count
        const { data: countData, error: countError } = await supabase.functions.invoke('get_reaction_count', {
          body: {
            content_id: contentId,
            content_type: contentType
          }
        });
        
        if (countError) {
          console.error('Error getting reaction count:', countError);
          return;
        }
        
        setCount(countData?.count || 0);
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
        // Remove reaction
        const { error } = await supabase.functions.invoke('delete_reaction', {
          body: {
            content_id: contentId,
            content_type: contentType,
            user_id: userId
          }
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
        // Add reaction
        const { error } = await supabase.functions.invoke('add_reaction', {
          body: {
            content_id: contentId,
            content_type: contentType,
            user_id: userId,
            reaction_type: 'tick'
          }
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
