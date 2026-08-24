/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getStatusBadgeStyle, getSeverityBadgeStyle } from '../../utils/helpers';

interface StatusBadgeProps {
  status: 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT' | 'INCONCLUSIVE' | 'PASSED' | 'VIOLATION' | 'NEEDS_REVIEW' | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = getStatusBadgeStyle(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase rounded-xs border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: 'Critical' | 'Major' | 'Minor' | 'Advisory' | string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const style = getSeverityBadgeStyle(severity);

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-xs border ${style.bg} ${style.text} ${style.border}`}
    >
      {severity}
    </span>
  );
}
