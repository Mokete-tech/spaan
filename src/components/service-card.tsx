
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id: string;
  title: string;
  provider: {
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
  };
  category: string;
  price: number;
  image: string;
  featured?: boolean;
}

const ServiceCard = ({
  id,
  title,
  provider,
  category,
  price,
  image,
  featured = false,
}: ServiceCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className={cn(
        "overflow-hidden border border-gray-200 rounded-xl card-hover transition-all duration-300",
        featured ? "ring-2 ring-spaan-primary/20" : ""
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <div className={cn("w-full h-full bg-gray-200 shimmer", imageLoaded ? "hidden" : "block")}></div>
        <img
          src={image}
          alt={title}
          className={cn(
            "w-full h-full object-cover lazy-image transition-opacity duration-500",
            imageLoaded ? "loaded" : ""
          )}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {featured && (
          <Badge className="absolute top-3 right-3 bg-spaan-primary">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600 hover:bg-gray-200">
            {category}
          </Badge>
        </div>
        
        <h3 className="font-medium text-lg mb-2 line-clamp-2 h-14">{title}</h3>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-700">{provider.name}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{provider.rating}</span>
          <span className="text-sm text-gray-500">({provider.reviews})</span>
        </div>
        
        <div className="text-lg font-semibold">
          ${price}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
