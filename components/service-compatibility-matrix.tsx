"use client"

import * as React from "react"
import type { Service } from "@/app/services/page"
import logger from '@/lib/logger';

interface ServiceCompatibilityMatrixProps {
  services: Service[];
}

export const ServiceCompatibilityMatrix: React.FC<ServiceCompatibilityMatrixProps> = ({ services }) => {
  logger.debug('ServiceCompatibilityMatrix rendered', { services });

  const uniqueCategories = Array.from(new Set(services.map(service => service.category))).sort();

  // Build compatibility map
  const compatibilityMap = new Map<string, Set<string>>();

  services.forEach(serviceA => {
    logger.debug(`Processing serviceA: ${serviceA.name}, Category: ${serviceA.category}`);
    if (!compatibilityMap.has(serviceA.category)) {
      compatibilityMap.set(serviceA.category, new Set<string>());
    }
    // A category is always compatible with itself
    compatibilityMap.get(serviceA.category)?.add(serviceA.category);

    serviceA.connections?.forEach(connectedServiceId => {
      const serviceB = services.find(s => s.id === connectedServiceId);
      if (serviceB) {
        logger.debug(`  ServiceA (${serviceA.name}) connected to ServiceB (${serviceB.name}), Category: ${serviceB.category}`);
        compatibilityMap.get(serviceA.category)?.add(serviceB.category);
        // Ensure reverse compatibility as well
        if (!compatibilityMap.has(serviceB.category)) {
          compatibilityMap.set(serviceB.category, new Set<string>());
        }
        compatibilityMap.get(serviceB.category)?.add(serviceA.category);
      }
    });
  });

  logger.debug('Compatibility Map built', { compatibilityMap: Object.fromEntries(compatibilityMap) });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
            {uniqueCategories.map(category => (
              <th key={category} className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {category}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueCategories.map(rowCategory => (
            <tr key={rowCategory}>
              <td className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {rowCategory}
              </td>
              {uniqueCategories.map(colCategory => {
                const isCompatible = compatibilityMap.get(rowCategory)?.has(colCategory);
                logger.debug(`  Checking compatibility: ${rowCategory} <-> ${colCategory}, Compatible: ${isCompatible}`);
                return (
                  <td
                    key={`${rowCategory}-${colCategory}`}
                    className={`py-2 px-4 border-b border-gray-200 ${
                      isCompatible ? 'bg-green-200' : 'bg-red-100'
                    } text-center`}
                  >
                    {isCompatible ? '✓' : '✗'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 