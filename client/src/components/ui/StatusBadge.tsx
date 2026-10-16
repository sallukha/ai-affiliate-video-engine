import React from 'react';
import { VideoStatus } from '../../types';

interface StatusBadgeProps {
  status: VideoStatus | string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  const normalized = status.toLowerCase();

  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-600';
  let label = status;

  switch (normalized) {
    case 'completed':
    case 'success':
      dotColor = 'bg-emerald-500';
      textColor = 'text-emerald-700 font-medium';
      label = 'Completed';
      break;
    case 'processing':
    case 'running':
      dotColor = 'bg-teal-500 animate-pulse';
      textColor = 'text-teal-700 font-medium';
      label = 'Processing';
      break;
    case 'failed':
    case 'error':
      dotColor = 'bg-rose-500';
      textColor = 'text-rose-700 font-medium';
      label = 'Failed';
      break;
    case 'cancelled':
      dotColor = 'bg-slate-400';
      textColor = 'text-slate-600';
      label = 'Cancelled';
      break;
    case 'pending':
      dotColor = 'bg-amber-400';
      textColor = 'text-amber-700';
      label = 'Queued';
      break;
    default:
      label = status;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${textColor}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      <span>{label}</span>
    </span>
  );
};
