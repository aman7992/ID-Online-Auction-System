import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const styles = {
    default: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    ended: 'bg-slate-700/80 text-slate-400 border-slate-600/50',
    paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    winning: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
    outbid: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-medium',
    won: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
    admin: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    user: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[variant] || styles.default
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
