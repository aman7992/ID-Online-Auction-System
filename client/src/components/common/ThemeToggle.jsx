import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ showLabel = false, className = '' }) => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-300 dark:text-slate-300 hover:text-amber-400 dark:hover:text-amber-400 border border-slate-700/80 dark:border-slate-700/80 transition-colors flex items-center gap-2"
        title={`Current theme: ${theme} (${effectiveTheme})`}
        aria-label="Toggle Theme"
      >
        {effectiveTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-amber-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
        {showLabel && (
          <span className="text-xs font-semibold capitalize hidden sm:inline">
            {theme}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{opt.label}</span>
                {isSelected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
