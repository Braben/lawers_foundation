'use client';

import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

export function LazyImage({
  src,
  alt,
  placeholder = '/images/placeholder.jpg',
  aspectRatio = 'auto',
  className = '',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-[#EDF4F2] ${aspectRatios[aspectRatio]} ${className}`}
    >
      {isInView ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          decoding="async"
          {...props}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#2C5F2D] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#EDF4F2]">
          <div className="w-8 h-8 border-2 border-[#2C5F2D] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

interface AnimatedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  hoverEffect?: boolean;
}

export function AnimatedImage({
  src,
  alt,
  hoverEffect = false,
  className = '',
  ...props
}: AnimatedImageProps) {
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      whileHover={hoverEffect ? { scale: 1.05 } : {}}
      transition={{ duration: 0.3 }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        {...props}
      />
    </motion.div>
  );
}

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function BlurImage({ src, alt, className = '' }: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 bg-[#EDF4F2] transition-opacity duration-700 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          filter: isLoaded ? 'blur(0px)' : 'blur(10px)' 
        }}
        transition={{ duration: 0.5 }}
        onLoad={() => setIsLoaded(true)}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
