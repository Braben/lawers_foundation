'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
  hoverable?: boolean;
}

export function Card({ children, className = '', as: Component = 'div', hoverable = false }: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -5 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Component className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        {children}
      </Component>
    </motion.div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={`text-xl font-bold text-[#2C5F2D] mb-2 ${className}`}>
      {children}
    </Component>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`text-gray-600 ${className}`}>{children}</div>;
}
