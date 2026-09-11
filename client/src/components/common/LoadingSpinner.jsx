import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading auctions...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div
        className={`${sizeClasses[size]} border-slate-700 border-t-amber-500 rounded-full animate-spin mb-3`}
      />
      {message && <p className="text-slate-400 text-sm font-medium animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
