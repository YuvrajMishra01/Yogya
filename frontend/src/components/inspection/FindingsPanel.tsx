/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ComplianceFinding } from '../../types';

interface FindingsPanelProps {
  findings: ComplianceFinding[];
}

const getFindingRowStyles = (status: string) => {
  if (status === 'PASSED') {
    return {
      rowBg: 'bg-[#F1F8F4]',
      leftBorder: 'border-l-[3.5px] border-l-[#4CAF7D]',
      badge: 'bg-[#EAF6EF] text-[#4CAF7D] border border-[#4CAF7D]/30',
      label: 'PASSED',
    };
  }
  if (status === 'REVIEW' || status === 'NEEDS_REVIEW') {
    return {
      rowBg: 'bg-[#FFF9EC]',
      leftBorder: 'border-l-[3.5px] border-l-[#D9A441]',
      badge: 'bg-[#FFF5DF] text-[#D9A441] border border-[#D9A441]/40',
      label: 'REVIEW',
    };
  }
  return {
    rowBg: 'bg-[#FDF1F1]',
    leftBorder: 'border-l-[3.5px] border-l-[#D96B6B]',
    badge: 'bg-[#FCECEC] text-[#D96B6B] border border-[#D96B6B]/40',
    label: 'NON-COMPLIANT',
  };
};

export const FindingsPanel: React.FC<FindingsPanelProps> = ({ findings }) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs overflow-hidden">
      <div className="px-5 py-4 border-b border-[#D9DEE7] bg-[#FAFAFC] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-serif font-bold text-[#111827]">
            Statutory Requirements & Findings Matrix
          </h3>
          <p className="text-[11px] text-[#667085]">
            Detailed breakdown of each mandatory packaging declaration
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#667085]">
          8 RULES AUDITED
        </span>
      </div>

      {/* Mobile View: Stacked Card Records */}
      <div className="sm:hidden divide-y divide-[#D9DEE7]">
        {findings.map((f) => {
          const styles = getFindingRowStyles(f.status);
          return (
            <div key={f.id} className={`p-4 space-y-2.5 ${styles.rowBg} ${styles.leftBorder} transition-colors`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono font-bold text-xs text-[#111827]">
                    {f.categoryNumber}. {f.requirement}
                  </div>
                  <div className="text-[10px] font-mono text-[#667085] mt-0.5">
                    {f.ruleReference}
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider ${styles.badge}`}
                >
                  {f.status === 'PASSED' ? 'PASSED' : f.status === 'VIOLATION' ? 'NON-COMPLIANT' : 'REVIEW'}
                </span>
              </div>

              <div className="text-xs text-[#667085]">
                <div className="font-medium text-[#111827]">{f.reason}</div>
                <div className="text-[11px] text-[#667085] mt-0.5">Expected: {f.expectedCondition}</div>
              </div>

              <div className="pt-1">
                <div className="text-[10px] font-mono uppercase text-[#667085] mb-1">Detected on Packaging:</div>
                {f.detectedCondition && f.detectedCondition !== 'Not detected' ? (
                  <div className="font-mono text-xs text-[#111827] break-words bg-[#FFFFFF]/80 p-2 rounded-xs border border-[#D9DEE7]">
                    {f.detectedCondition}
                  </div>
                ) : (
                  <div className="text-xs text-[#667085] italic bg-[#FFFFFF]/80 p-2 rounded-xs border border-[#D9DEE7]">
                    Declaration not detected on package
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / Tablet View: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFFFFF] border-b border-[#D9DEE7] text-[10px] font-mono uppercase text-[#667085]">
              <th className="py-2.5 px-4 font-semibold">Rule & Category</th>
              <th className="py-2.5 px-4 font-semibold">Statutory Mandate</th>
              <th className="py-2.5 px-4 font-semibold">Detected Packaging Value</th>
              <th className="py-2.5 px-4 font-semibold text-center">Finding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9DEE7] text-xs">
            {findings.map((f) => {
              const styles = getFindingRowStyles(f.status);
              return (
                <tr key={f.id} className={`${styles.rowBg} transition-colors`}>
                  <td className={`py-3 px-4 align-top ${styles.leftBorder}`}>
                    <div className="font-mono font-bold text-[#111827]">{f.categoryNumber}. {f.requirement}</div>
                    <div className="text-[10px] font-mono text-[#667085] mt-0.5">{f.ruleReference}</div>
                  </td>
                  <td className="py-3 px-4 align-top text-[#667085]">
                    <div className="font-medium text-[#111827]">{f.reason}</div>
                    <div className="text-[11px] text-[#667085] mt-0.5 leading-relaxed">
                      Expected: {f.expectedCondition}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top max-w-[200px]">
                    {f.detectedCondition && f.detectedCondition !== 'Not detected' ? (
                      <div className="font-mono text-xs text-[#111827] break-words bg-[#FFFFFF]/80 p-1.5 rounded-xs border border-[#D9DEE7]">
                        {f.detectedCondition}
                      </div>
                    ) : (
                      <div className="text-xs text-[#667085] italic">
                        Declaration not detected on package
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider ${styles.badge}`}
                    >
                      {f.status === 'PASSED' ? 'PASSED' : f.status === 'VIOLATION' ? 'NON-COMPLIANT' : 'REVIEW'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
