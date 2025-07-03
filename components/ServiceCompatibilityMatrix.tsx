'use client';

import React from 'react';

interface Service {
  id: string;
  name: string;
  connections?: string[];
}

interface ServiceCompatibilityMatrixProps {
  services: Service[];
}

export function ServiceCompatibilityMatrix({ services }: ServiceCompatibilityMatrixProps) {
  if (!services || services.length === 0) {
    return <p>No services available to display the compatibility matrix.</p>;
  }

  const serviceMap = new Map(services.map(s => [s.id, s]));

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">서비스 호환성 매트릭스</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3" scope="col">Service</th>
              {services.map(service => (
                <th key={service.id} className="px-6 py-3" scope="col">
                  {service.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(rowService => (
              <tr key={rowService.id} className="table-row">
                <td className="table-cell table-cell-font-medium">{rowService.name}</td>
                {services.map(colService => {
                  const isConnected = rowService.connections?.includes(colService.id) || colService.connections?.includes(rowService.id);
                  return (
                    <td key={colService.id} className="table-cell text-center">
                      {rowService.id === colService.id ? '-' : isConnected ? '✅' : '❌'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
