
import React, { useState } from "react";
import { 
  Facebook, 
  Linkedin, 
  Share2, 
  X as CloseIcon, 
  Copy, 
  Check,
  X,
  MessageSquare
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
}

const SocialShare: React.FC<SocialShareProps> = ({
  url = window.location.href,
  title = "Check out Spaan - Find gigs or post jobs!",
  description = "Spaan connects people needing help with skilled service providers. Find or offer local and digital gigs in South Africa and beyond.",
  className = "",
  variant = "icon",
  size = "md"
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-9 w-9";

  const shareViaWindow = (shareUrl: string) => {
    window.open(
      shareUrl,
      "share-dialog",
      "width=600,height=600,location=no,menubar=no,toolbar=no"
    );
  };

  return (
    <div className="relative inline-block flex-shrink-0">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {variant === "icon" ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full hover:bg-blue-50 hover:text-blue-600 flex-shrink-0 ${className}`}
              aria-label="Share"
            >
              <Share2 className={iconSize} />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className={`flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50 flex-shrink-0 ${className}`}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 z-50 bg-white" align="end" sideOffset={5}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Share this page</h3>
            <button 
              className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            <Button 
              variant="outline"
              className="flex flex-col items-center justify-center py-3 border-gray-200 hover:bg-blue-600 hover:text-white"
              onClick={() => shareViaWindow(shareLinks.facebook)}
            >
              <Facebook className={iconSize} />
              <span className="text-xs mt-1">Facebook</span>
            </Button>
            
            <Button 
              variant="outline"
              className="flex flex-col items-center justify-center py-3 border-gray-200 hover:bg-black hover:text-white"
              onClick={() => shareViaWindow(shareLinks.twitter)}
            >
              <X className={iconSize} />
              <span className="text-xs mt-1">X</span>
            </Button>
            
            <Button 
              variant="outline"
              className="flex flex-col items-center justify-center py-3 border-gray-200 hover:bg-green-500 hover:text-white"
              onClick={() => shareViaWindow(shareLinks.whatsapp)}
            >
              <MessageSquare className={iconSize} />
              <span className="text-xs mt-1">WhatsApp</span>
            </Button>
            
            <Button 
              variant="outline"
              className="flex flex-col items-center justify-center py-3 border-gray-200 hover:bg-blue-700 hover:text-white"
              onClick={() => shareViaWindow(shareLinks.linkedin)}
            >
              <Linkedin className={iconSize} />
              <span className="text-xs mt-1">LinkedIn</span>
            </Button>
          </div>
          
          <div className="flex items-center border rounded-md overflow-hidden">
            <div className="bg-gray-50 text-gray-600 px-3 py-2 border-r flex-grow overflow-hidden whitespace-nowrap text-ellipsis">
              {url}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SocialShare;
