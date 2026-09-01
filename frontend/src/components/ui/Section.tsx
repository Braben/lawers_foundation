import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'neutral' | 'primary' | 'secondary';
}

export function Section({
  children,
  className = '',
  id,
  background = 'white',
}: SectionProps) {
  const backgrounds = {
    white: 'bg-white',
    neutral: 'bg-[#EDF4F2]',
    primary: 'bg-[#2C5F2D]',
    secondary: 'bg-[#97BC62]',
  };

  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${backgrounds[background]} ${className}`}
    >
      {children}
    </section>
  );
}
