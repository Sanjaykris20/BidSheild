import React from 'react';

interface MockBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'amber' | 'blue' | 'purple' | 'green' | 'gray';
}

export function MockBadge({ label = 'MOCK', size = 'sm', variant }: MockBadgeProps) {
  const upper = label.toUpperCase();

  let colorClasses = 'bg-warning/15 text-warning border-warning/30';

  if (variant === 'green' || upper === 'LIVE' || upper === 'VERIFIED') {
    colorClasses = 'bg-success/15 text-success border-success/30';
  } else if (variant === 'blue' || upper === 'OPEN_DATA' || upper === 'OPEN DATA' || upper === 'DATA.GOV.IN') {
    colorClasses = 'bg-info/15 text-info border-info/30';
  } else if (variant === 'purple' || upper === 'SANDBOX') {
    colorClasses = 'bg-purple-100 text-purple-700 border-purple-300';
  } else if (variant === 'gray' || upper === 'UNAVAILABLE' || upper === 'OFFLINE') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
  } else if (variant === 'amber' || upper === 'MOCK' || upper === 'SIMULATED') {
    colorClasses = 'bg-warning/15 text-warning border-warning/30';
  }

  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border tracking-wider ${colorClasses} ${sizeClasses}`}
      title={`Data Mode: ${label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {label}
    </span>
  );
}
