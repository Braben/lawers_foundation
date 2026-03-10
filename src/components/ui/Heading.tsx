import { ReactNode, ElementType } from 'react';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  align?: 'left' | 'center' | 'right';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const headingClasses = {
  1: 'text-4xl md:text-5xl lg:text-6xl',
  2: 'text-3xl md:text-4xl lg:text-5xl',
  3: 'text-2xl md:text-3xl',
  4: 'text-xl md:text-2xl',
  5: 'text-lg md:text-xl',
  6: 'text-base md:text-lg',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Heading({
  children,
  level = 2,
  className = '',
  align = 'left',
  as,
}: HeadingProps) {
  const Tag = (as || `h${level}`) as ElementType;
  
  return (
    <Tag
      className={`font-bold text-[#2C5F2D] ${headingClasses[level]} ${alignClasses[align]} ${className}`}
    >
      {children}
    </Tag>
  );
}
