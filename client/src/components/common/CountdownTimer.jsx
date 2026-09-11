import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ endTime, onExpire, compact = false }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endTime).getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);

      if (updated.expired) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        <Clock className="w-3.5 h-3.5" />
        Auction Ended
      </span>
    );
  }

  // Determine urgency color
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
          isUrgent
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 shadow-inner">
        <span className="block text-2xl font-bold font-mono text-amber-400">
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Days
        </span>
      </div>
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 shadow-inner">
        <span className="block text-2xl font-bold font-mono text-amber-400">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Hours
        </span>
      </div>
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 shadow-inner">
        <span className="block text-2xl font-bold font-mono text-amber-400">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Mins
        </span>
      </div>
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 shadow-inner">
        <span
          className={`block text-2xl font-bold font-mono ${
            isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400'
          }`}
        >
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Secs
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
