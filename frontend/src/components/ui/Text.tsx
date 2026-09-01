import { ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'light' | 'muted';
}

export function Text({
  children,
  className = '',
  size = 'md',
  color = 'primary',
}: TextProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const colors = {
    primary: 'text-[#1a1a1a]',
    secondary: 'text-[#4a4a4a]',
    light: 'text-white',
    muted: 'text-gray-500',
  };

  return (
    <p className={`${sizes[size]} ${colors[color]} ${className}`}>
      {children}
    </p>
  );
}
