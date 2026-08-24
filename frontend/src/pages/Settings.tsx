/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SettingsProps {
  navigate: (path: string) => void;
}

export function Settings({ navigate }: SettingsProps) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#D9DEE7] flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#111827]">
            System settings
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Workspace and regulatory rule preferences are managed here.
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
        <div className="border-b border-[#D9DEE7] pb-3">
          <div className="text-xs font-mono font-bold uppercase text-[#111827]">Statutory Reference</div>
          <div className="text-xs text-[#667085] mt-0.5">Legal Metrology (Packaged Commodities) Rules, 2011</div>
        </div>
        <div className="border-b border-[#D9DEE7] pb-3">
          <div className="text-xs font-mono font-bold uppercase text-[#111827]">Authorized Role</div>
          <div className="text-xs text-[#667085] mt-0.5">Inspector • Enforcement Workspace</div>
        </div>
        <div className="pt-2">
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
