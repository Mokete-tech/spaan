
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, MapPin, Heart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import SocialShare from "./social-share";

interface ServiceCardProps {
  id: string;
  title: string;
  provider: {
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
    verified?: boolean;
    isFreelancer?: boolean;
  };
  category: string;
  price: number;
  image: string;
  featured?: boolean;
  currency?: string;
  location?: string;
  isDigital?: boolean;
}

const ServiceCard = ({
  id,
  title,
  provider,
  category,
  price,
  image,
  featured = false,
  currency = "ZAR",
  location,
  isDigital = false,
}: ServiceCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(price);
  };

  const handleGetHelpClick = () => {
    navigate(`/checkout?gigId=${id}`);
  };

  const handleContactClick = () => {
    toast({
      title: "Contact initiated",
      description: `You've requested to contact ${provider.name}`,
    });
    navigate(`/messages?provider=${provider.name}&serviceId=${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    
    toast({
      title: favorite ? "Removed from favorites" : "Added to favorites",
      description: favorite ? "Service removed from your favorites" : "Service added to your favorites"
    });
  };

  // Generate a shareable URL for this specific service
  const shareUrl = `${window.location.origin}/gigs/${id}`;
  const shareTitle = `Check out this gig on Spaan: ${title}`;
  const shareDescription = `${title} by ${provider.name} on Spaan - Find or offer gigs in South Africa and beyond`;

  return (
    <Card
      className={cn(
        "overflow-hidden border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md group",
        featured ? "ring-2 ring-amber-400" : ""
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <div className={cn("w-full h-full bg-gray-200 shimmer", imageLoaded ? "hidden" : "block")}></div>
        <img
          src={image}
          alt={title}
          className={cn(
            "w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105",
            imageLoaded ? "loaded" : ""
          )}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {featured && (
          <Badge className="absolute top-3 right-3" variant="featured">
            Featured
          </Badge>
        )}
        {isDigital && (
          <Badge className="absolute top-3 left-3" variant="digital">
            Digital
          </Badge>
        )}
        {provider.isFreelancer && (
          <Badge className="absolute bottom-3 left-3" variant="freelancer">
            Freelancer
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex space-x-1">
          {!featured && (
            <button 
              className="bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white transition-colors"
              onClick={handleFavoriteClick}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("h-5 w-5 transition-colors", favorite ? "fill-red-500 text-red-500" : "text-gray-400")} />
            </button>
          )}
          <SocialShare 
            url={shareUrl}
            title={shareTitle}
            description={shareDescription}
            variant="icon"
            className="bg-white/80 hover:bg-white"
          />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600 hover:bg-gray-200">
            {category}
          </Badge>
          {location && !isDigital && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{location}</span>
            </div>
          )}
        </div>
        
        <h3 className="font-medium text-lg mb-3 line-clamp-2 h-12">{title}</h3>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700">{provider.name}</span>
            {provider.verified && (
              <div className="ml-2 text-green-500" title="Verified Provider">
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{provider.rating}</span>
          <span className="text-sm text-gray-500">({provider.reviews})</span>
        </div>
        
        <div className="text-lg font-semibold text-blue-600">
          {formatPrice(price, currency)}
        </div>
      </CardFooter>
      
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={handleGetHelpClick}
        >
          Get Help
        </Button>
        <Button 
          variant="outline" 
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
          onClick={handleContactClick}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </div>
    </Card>
  );
};

export default ServiceCard;
