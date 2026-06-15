
import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Ensure PlaceHolderImages is always an array to prevent .find() errors
export const PlaceHolderImages: ImagePlaceholder[] = Array.isArray(data?.placeholderImages) 
  ? data.placeholderImages 
  : [];
