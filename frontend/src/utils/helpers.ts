/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format bytes into readable KB / MB
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format timestamp / date string into standard institutional format
 */
export function formatDate(dateInput: string | number): string {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Get CSS badge classes for compliance status
 */
export function getStatusBadgeStyle(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'COMPLIANT':
    case 'PASSED':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
      };
    case 'NON-COMPLIANT':
    case 'VIOLATION':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
      };
    case 'NEEDS REVIEW':
    case 'NEEDS_REVIEW':
    case 'INCONCLUSIVE':
    default:
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
      };
  }
}

/**
 * Get severity styling
 */
export function getSeverityBadgeStyle(severity: string): { bg: string; text: string; border: string } {
  switch (severity) {
    case 'Critical':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
      };
    case 'Major':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
      };
    case 'Minor':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
      };
    case 'Advisory':
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-800',
        border: 'border-slate-300',
      };
  }
}

/**
 * Truncate long strings safely
 */
export function truncateText(text: string, maxLen: number = 60): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}
