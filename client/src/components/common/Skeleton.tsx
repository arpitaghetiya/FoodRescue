import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-surface-200 shadow-soft overflow-hidden space-y-4">
      <div className="h-44 w-full rounded-2xl skeleton-shimmer" />
      <div className="space-y-2">
        <div className="h-4 w-1/3 rounded-lg skeleton-shimmer" />
        <div className="h-6 w-3/4 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
      </div>
      <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
        <div className="h-4 w-1/4 rounded-lg skeleton-shimmer" />
        <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-2xl border border-surface-100 shadow-xs flex items-center justify-between space-x-4">
      <div className="h-5 w-1/3 rounded skeleton-shimmer" />
      <div className="h-5 w-1/6 rounded skeleton-shimmer" />
      <div className="h-5 w-1/6 rounded skeleton-shimmer" />
      <div className="h-8 w-20 rounded-xl skeleton-shimmer" />
    </div>
  );
};

