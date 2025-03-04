
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AdBannerProps {
  slot?: "top" | "bottom" | "inline";
  format?: "banner" | "large-banner" | "medium-rectangle";
  className?: string;
  showCloseButton?: boolean;
}

const AdBanner = ({ 
  slot = "inline", 
  format = "banner",
  className = "",
  showCloseButton = true
}: AdBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  
  // This would be replaced by actual AdMob initialization
  useEffect(() => {
    // Simulate ad loading
    const timer = setTimeout(() => {
      setIsAdLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get dimensions based on format
  const getDimensions = () => {
    switch(format) {
      case "banner":
        return "h-16 w-full"; // 320x50
      case "large-banner":
        return "h-24 w-full"; // 320x100
      case "medium-rectangle":
        return "h-64 w-80"; // 300x250
      default:
        return "h-16 w-full";
    }
  };
  
  // Get position based on slot
  const getPosition = () => {
    switch(slot) {
      case "top":
        return "fixed top-0 left-0 right-0 z-50";
      case "bottom":
        return "fixed bottom-0 left-0 right-0 z-50";
      case "inline":
      default:
        return "";
    }
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`ad-container ${getDimensions()} ${getPosition()} ${className}`}>
      <div className="relative bg-gray-100 rounded-md overflow-hidden w-full h-full flex items-center justify-center">
        {isAdLoaded ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-xs text-gray-500 mb-1">Advertisement</p>
              <p className="text-sm font-medium text-blue-600">
                Find local services at great rates
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-pulse bg-gray-200 w-full h-full" />
        )}
        
        {showCloseButton && (
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-1 right-1 bg-gray-100 bg-opacity-70 rounded-full p-1 hover:bg-gray-200"
            aria-label="Close advertisement"
          >
            <X className="h-3 w-3 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
