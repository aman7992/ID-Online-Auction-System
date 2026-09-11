import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no active auctions matching your criteria at this moment.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
