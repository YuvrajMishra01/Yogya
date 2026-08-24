/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  ShieldCheck,
  ScanLine,
  Package,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import { YogyaLogo } from './common/YogyaLogo';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  onLogoutClick: () => void;
  onSelectReportsReset?: () => void;
}

export function Sidebar({
  currentPath,
  navigate,
  mobileDrawerOpen,
  setMobileDrawerOpen,
  onLogoutClick,
  onSelectReportsReset,
}: SidebarProps) {
  const navItems = [
    { label: 'OVERVIEW', path: '/dashboard', icon: FileText },
    { label: 'INSPECTIONS', path: '/inspection', icon: ShieldCheck },
    { label: 'SCAN PRODUCT', path: '/inspection', icon: ScanLine },
    { label: 'PRODUCTS', path: '/products', icon: Package },
    { label: 'REPORTS', path: '/reports', icon: BarChart3 },
    { label: 'HISTORY', path: '/history', icon: History },
  ];

  const systemNavItems = [
    { label: 'SETTINGS', path: '/settings', icon: Settings },
    { label: 'HELP & GUIDANCE', path: '/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#FFFFFF] border-r border-[#D9DEE7] shrink-0 z-20">
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-[#D9DEE7] bg-[#FFFFFF]">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 text-left group cursor-pointer w-full focus:outline-hidden"
          >
            <YogyaLogo size="md" showSubtitle={true} subtitleText="LEGAL METROLOGY" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Primary Section */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#667085] font-semibold">
              WORKSPACE
            </div>
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.path === '/reports' && onSelectReportsReset) {
                      onSelectReportsReset();
                    }
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono tracking-wider rounded-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#071B3A] text-[#FFFFFF] font-semibold shadow-2xs'
                      : 'text-[#667085] hover:text-[#111827] hover:bg-[#E8F0FC]'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#667085]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-[#D9DEE7] mx-2"></div>

          {/* System Section */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#667085] font-semibold">
              SYSTEM
            </div>
            {systemNavItems.map((item) => {
              const isActive = currentPath === item.path;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono tracking-wider rounded-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#071B3A] text-[#FFFFFF] font-semibold shadow-2xs'
                      : 'text-[#667085] hover:text-[#111827] hover:bg-[#E8F0FC]'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#667085]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom Inspector Info */}
        <div className="p-3 border-t border-[#D9DEE7] bg-[#FFFFFF]">
          <div className="bg-[#FAFAFC] border border-[#D9DEE7] p-3 rounded-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xs bg-[#071B3A] text-[#FFFFFF] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                IN
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#111827] truncate">
                  Inspector
                </div>
                <div className="text-[10px] font-mono text-[#667085] truncate">
                  Authorized User
                </div>
              </div>
            </div>

            <button
              onClick={onLogoutClick}
              title="Log out"
              className="p-1.5 text-[#667085] hover:text-[#111827] hover:bg-[#D9DEE7]/40 rounded-xs transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER (Slide-out Navigation) ─── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-[#071B3A]/50 backdrop-blur-2xs"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="relative w-72 bg-[#FFFFFF] border-r border-[#D9DEE7] flex flex-col h-full z-10 shadow-xl"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-[#D9DEE7] flex items-center justify-between bg-[#FFFFFF]">
                <div className="flex items-center gap-2.5">
                  <YogyaLogo size="sm" showSubtitle={true} subtitleText="LEGAL METROLOGY" />
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-[#667085] hover:text-[#111827] rounded-xs cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#667085] font-semibold">
                    WORKSPACE
                  </div>
                  {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          if (item.path === '/reports' && onSelectReportsReset) {
                            onSelectReportsReset();
                          }
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono tracking-wider rounded-xs text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#071B3A] text-[#FFFFFF] font-semibold'
                            : 'text-[#667085] hover:text-[#111827] hover:bg-[#E8F0FC]'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#FFFFFF]' : 'text-[#667085]'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#D9DEE7] mx-2"></div>

                <div className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#667085] font-semibold">
                    SYSTEM
                  </div>
                  {systemNavItems.map((item) => {
                    const isActive = currentPath === item.path;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-mono tracking-wider rounded-xs text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#071B3A] text-[#FFFFFF] font-semibold'
                            : 'text-[#667085] hover:text-[#111827] hover:bg-[#E8F0FC]'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#FFFFFF]' : 'text-[#667085]'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Bottom Inspector / Logout */}
              <div className="p-3 border-t border-[#D9DEE7] bg-[#FFFFFF]">
                <div className="bg-[#FAFAFC] border border-[#D9DEE7] p-2.5 rounded-xs flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-xs bg-[#071B3A] text-[#FFFFFF] flex items-center justify-center text-[10px] font-mono font-bold">
                      IN
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#111827]">Inspector</div>
                      <div className="text-[10px] font-mono text-[#667085]">Authorized User</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogoutClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
