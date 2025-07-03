'use client';

import React from 'react';
import logger from '@/lib/logger'; // assuming you have a logger utility

interface PageTitleProps {
  title: string;
  icon: string; // Material Icon name
  badgeText?: string; // Optional badge text
}

const PageTitle: React.FC<PageTitleProps> = ({ title, icon, badgeText }) => {
  logger.debug('PageTitle: Component rendering', { title, icon, badgeText });
  return (
    <div className="flex items-center mb-6">
      <span className="material-icons text-3xl text-blue-600 mr-3">{icon}</span>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {badgeText && (
        <span className="ml-3 px-3 py-1 bg-gray-800 text-white text-sm font-semibold rounded-full">
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default PageTitle;
