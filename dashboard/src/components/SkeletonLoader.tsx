import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

interface SkeletonLoaderProps {
  type: 'text' | 'rectangle' | 'circle' | 'avatar';
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  width,
  height,
  variant = 'text',
  count = 1,
}) => {
  const skeletonStyle = {
    width: width || '100%',
    height: height || '20px',
  };

  switch (type) {
    case 'text':
      return (
        <Box>
          {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} variant={variant} width="100%" height={skeletonStyle.height} />
          ))}
        </Box>
      );

    case 'rectangle':
      return (
        <Box>
          {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={skeletonStyle.width} height={skeletonStyle.height} />
          ))}
        </Box>
      );

    case 'circle':
      return (
        <Box>
          {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} variant="circular" width={skeletonStyle.width} height={skeletonStyle.height} />
          ))}
        </Box>
      );

    case 'avatar':
      return (
        <Box>
          {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} variant="circular" width={40} height={40} />
          ))}
        </Box>
      );

    default:
      return null;
  }
};

export default SkeletonLoader;
