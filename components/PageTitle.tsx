'use client';

import React from 'react';
import logger from '@/lib/logger'; // assuming you have a logger utility

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  logger.debug('PageTitle: Component rendering', { title });
  return (
    <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
      {title}
    </h1>
  );
};

export default PageTitle; 