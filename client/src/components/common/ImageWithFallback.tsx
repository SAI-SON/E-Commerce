import React, { useState } from 'react';
import { getFallbackImage } from '../../lib/utils.js';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError || !src ? getFallbackImage(fallbackText || alt) : src}
      alt={alt || 'Product image'}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
};
