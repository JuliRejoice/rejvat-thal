import React, { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ImagePreview({ imageUrl, isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when image URL changes
    setIsLoading(true);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    console.error('Error loading image');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "w-[85vw] max-w-5xl h-[85vh] max-h-[90vh] p-0 overflow-hidden",
          "flex flex-col bg-gray-50"
        )}
      >
        {/* Header with new tab button */}
        <div className="flex items-center justify-between pl-4 pr-14 py-3 border-b bg-white relative">
          <DialogTitle>Receipt Preview</DialogTitle>
          <div className="flex items-center">
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-9 px-3.5 text-sm font-medium text-gray-700 bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(imageUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in new tab
                </Button>
             
          </div>
        </div>
        
        {/* Image Content */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            <img
              src={imageUrl}
              alt="Preview"
              className={cn(
                "max-w-full max-h-full w-auto h-auto object-contain",
                "transition-opacity duration-300",
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
