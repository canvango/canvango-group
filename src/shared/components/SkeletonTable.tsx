import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="table-container animate-pulse">
      <table className="table">
        <thead className="table-header">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="table-header-cell">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="table-row">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="table-cell">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
