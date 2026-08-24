/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HelpProps {
  navigate: (path: string) => void;
}

export function Help({ navigate }: HelpProps) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#D9DEE7] flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#111827]">
            Help & regulatory guidance
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Guidelines under the Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 rounded-xs space-y-4 max-w-2xl">
        <div className="text-sm font-serif font-bold text-[#111827]">Mandatory Package Declarations</div>
        <ul className="text-xs text-[#667085] space-y-2 list-disc list-inside leading-relaxed">
          <li>Name and complete address of the manufacturer / packer / importer</li>
          <li>Common or generic name of the commodity contained in the package</li>
          <li>Net quantity in terms of standard unit of weight or measure</li>
          <li>Month and year of manufacture or packaging or import</li>
          <li>Maximum Retail Price (MRP) inclusive of all taxes</li>
          <li>Consumer care details with telephone number and email address</li>
        </ul>
        <div className="pt-4 border-t border-[#D9DEE7]">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-medium rounded-xs transition-colors cursor-pointer"
          >
            Back to Overview
          </button>
        </div>
      </div>
    </div>
  );
}
