/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Search,
  Bell,
  X,
  FileText,
  Plus,
  ArrowRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { InspectionReport, ProductSummary } from '../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenMobileDrawer: () => void;
  reports: InspectionReport[];
  derivedProducts: ProductSummary[];
  onSelectInspection: (id: string) => void;
  onSelectProduct: (name: string) => void;
  logoutModalOpen: boolean;
  setLogoutModalOpen: (open: boolean) => void;
  guidanceModalOpen: boolean;
  setGuidanceModalOpen: (open: boolean) => void;
}

export function Navbar({
  currentPath,
  navigate,
  onOpenMobileDrawer,
  reports,
  derivedProducts,
  onSelectInspection,
  onSelectProduct,
  logoutModalOpen,
  setLogoutModalOpen,
  guidanceModalOpen,
  setGuidanceModalOpen,
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Determine current page metadata for header
  const getPageInfo = () => {
    switch (currentPath) {
      case '/dashboard':
        return { title: 'Overview', context: 'Inspection workspace' };
      case '/inspection':
        return { title: 'New inspection', context: 'Commodity verification' };
      case '/history':
        return { title: 'Inspection history', context: 'Completed records' };
      case '/reports':
        return { title: 'Inspection reports', context: 'Statutory documents' };
      case '/products':
        return { title: 'Products', context: 'Commodity register' };
      case '/settings':
        return { title: 'Settings', context: 'System configuration' };
      case '/help':
        return { title: 'Help & Guidance', context: 'Regulatory rules' };
      default:
        return { title: 'Workspace', context: 'Legal Metrology' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <>
      {/* Top Application Header */}
      <header className="bg-[#FFFFFF] border-b border-[#D9DEE7] sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Left Title & Mobile Hamburger */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenMobileDrawer}
              className="md:hidden p-1.5 text-[#111827] border border-[#D9DEE7] rounded-xs hover:bg-[#E8F0FC] transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-serif font-bold text-[#111827] truncate leading-tight">
                {pageInfo.title}
              </h1>
              <div className="text-[11px] font-mono text-[#667085] truncate">
                {pageInfo.context}
              </div>
            </div>
          </div>

          {/* Right Controls: Search, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#667085] bg-[#FAFAFC] hover:bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs transition-colors cursor-pointer"
              title="Search workspace"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-sans">Search records...</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 text-[#667085] hover:text-[#111827] bg-[#FAFAFC] hover:bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Notifications Popover */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-md p-4 z-30"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE7] mb-3">
                      <span className="text-xs font-mono font-semibold uppercase text-[#111827]">
                        Notifications
                      </span>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[#667085] hover:text-[#111827] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-center py-4">
                      <Bell className="w-6 h-6 text-[#667085]/50 mx-auto mb-2" />
                      <p className="text-xs text-[#667085]">No new notifications.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-[#FAFAFC] hover:bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-xs bg-[#071B3A] text-[#FFFFFF] flex items-center justify-center text-[10px] font-mono font-bold">
                  IN
                </div>
                <span className="hidden sm:inline text-xs font-medium text-[#111827]">
                  Inspector
                </span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-md py-1.5 z-30"
                  >
                    <div className="px-3 py-2 border-b border-[#D9DEE7] mb-1">
                      <div className="text-xs font-semibold text-[#111827]">Inspector</div>
                      <div className="text-[10px] font-mono text-[#667085]">Authorized User</div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-[#667085] hover:text-[#111827] hover:bg-[#FAFAFC] transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-[#667085] hover:text-[#111827] hover:bg-[#FAFAFC] transition-colors cursor-pointer"
                    >
                      Settings
                    </button>
                    <div className="border-t border-[#D9DEE7] my-1"></div>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setLogoutModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-[#C62828] hover:bg-[#FAFAFC] transition-colors cursor-pointer font-medium"
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ─── SEARCH OVERLAY MODAL ─── */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-[#071B3A]/50 backdrop-blur-2xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-lg w-full p-5 rounded-xs shadow-xl relative z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#667085]" />
                  <span className="text-xs font-mono uppercase font-semibold text-[#111827]">
                    Search Workspace
                  </span>
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-[#667085] hover:text-[#111827] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inspections, products, manufacturers, or rule findings..."
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D9DEE7] focus:border-[#071B3A] focus:ring-1 focus:ring-[#071B3A] text-sm text-[#111827] rounded-xs outline-hidden placeholder-[#98A2B3]/50 transition-colors font-sans"
                  autoFocus
                />
              </div>

              {/* Dynamic Search Results vs Empty State */}
              {(() => {
                const q = searchQuery.trim().toLowerCase();
                const matchedReports = q
                  ? reports.filter(
                      (r) =>
                        r.productName?.toLowerCase().includes(q) ||
                        r.manufacturer?.toLowerCase().includes(q) ||
                        r.referenceNumber?.toLowerCase().includes(q) ||
                        r.overallStatus?.toLowerCase().includes(q) ||
                        r.findings?.some(
                          (f) =>
                            f.requirement.toLowerCase().includes(q) ||
                            f.reason.toLowerCase().includes(q)
                        )
                    )
                  : reports.slice(0, 4);

                const matchedProducts = q
                  ? derivedProducts.filter(
                      (p) =>
                        p.name.toLowerCase().includes(q) ||
                        p.manufacturer.toLowerCase().includes(q)
                    )
                  : derivedProducts.slice(0, 3);

                if (reports.length === 0) {
                  return (
                    <div className="py-8 text-center bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs p-4">
                      <FileText className="w-8 h-8 text-[#667085]/40 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-[#111827] mb-1">
                        No inspection records found
                      </div>
                      <p className="text-[11px] text-[#667085] max-w-xs mx-auto mb-4">
                        Records and reports will appear here as soon as inspections are completed in your workspace.
                      </p>
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          navigate('/inspection');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-medium rounded-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Start New Inspection</span>
                      </button>
                    </div>
                  );
                }

                if (q && matchedReports.length === 0 && matchedProducts.length === 0) {
                  return (
                    <div className="py-8 text-center bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs p-4">
                      <Search className="w-7 h-7 text-[#667085]/40 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-[#111827] mb-1">
                        No matching results for "{searchQuery}"
                      </div>
                      <p className="text-[11px] text-[#667085] max-w-xs mx-auto mb-3">
                        Try searching by product name, manufacturer, inspection reference, or compliance status.
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-[#111827] font-medium underline cursor-pointer"
                      >
                        Clear search query
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
                    {matchedReports.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold uppercase text-[#667085] mb-2">
                          {q ? `INSPECTION RECORDS (${matchedReports.length})` : 'RECENT INSPECTIONS'}
                        </div>
                        <div className="space-y-1.5">
                          {matchedReports.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => {
                                setSearchOpen(false);
                                onSelectInspection(r.id);
                                navigate('/history');
                              }}
                              className="p-2.5 bg-[#FAFAFC] hover:bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs cursor-pointer transition-colors flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-mono text-xs font-bold text-[#111827]">
                                    {r.referenceNumber}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs border ${
                                      r.overallStatus === 'COMPLIANT'
                                        ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                                        : r.overallStatus === 'NON-COMPLIANT'
                                        ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                                        : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
                                    }`}
                                  >
                                    {r.overallStatus}
                                  </span>
                                </div>
                                <div className="text-xs font-medium text-[#111827] truncate">
                                  {r.productName || 'Unlabeled Commodity'}
                                </div>
                                <div className="text-[10px] text-[#667085] truncate">
                                  {r.manufacturer || 'No manufacturer declared'}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchedProducts.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold uppercase text-[#667085] mb-2">
                          {q ? `COMMODITY REGISTER (${matchedProducts.length})` : 'REGISTERED PRODUCTS'}
                        </div>
                        <div className="space-y-1.5">
                          {matchedProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSearchOpen(false);
                                onSelectProduct(p.name);
                                navigate('/products');
                              }}
                              className="p-2.5 bg-[#FFFFFF] hover:bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs cursor-pointer transition-colors flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[#111827] truncate">
                                  {p.name}
                                </div>
                                <div className="text-[10px] text-[#667085] truncate">
                                  {p.manufacturer} • {p.stats.totalInspections} audit
                                  {p.stats.totalInspections === 1 ? '' : 's'}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── LOGOUT CONFIRMATION DIALOG ─── */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutModalOpen(false)}
              className="fixed inset-0 bg-[#071B3A]/50 backdrop-blur-2xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-sm w-full p-6 rounded-xs shadow-xl relative z-10 text-center"
            >
              <div className="w-10 h-10 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto mb-4 text-[#111827]">
                <LogOut className="w-5 h-5" />
              </div>

              <h3 className="text-base font-serif font-bold text-[#111827] mb-2">
                Leave inspection workspace?
              </h3>

              <p className="text-xs text-[#667085] leading-relaxed mb-6">
                Are you sure you want to sign out of the Yogya inspection platform?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLogoutModalOpen(false)}
                  className="w-full py-2.5 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setLogoutModalOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2.5 bg-[#071B3A] hover:bg-[#0D2A55] text-xs font-medium text-[#FFFFFF] rounded-xs transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── GUIDANCE MODAL ─── */}
      <AnimatePresence>
        {guidanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGuidanceModalOpen(false)}
              className="fixed inset-0 bg-[#071B3A]/50 backdrop-blur-2xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-lg w-full p-6 rounded-xs shadow-xl relative z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#667085]" />
                  <h3 className="text-sm font-serif font-bold text-[#111827]">
                    How Inspections Work
                  </h3>
                </div>
                <button
                  onClick={() => setGuidanceModalOpen(false)}
                  className="p-1 text-[#667085] hover:text-[#111827] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-6 text-xs text-[#667085] leading-relaxed">
                <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                  <div className="font-mono font-semibold text-[#111827] text-[11px] mb-1">
                    01 / Capture Package Evidence
                  </div>
                  <p>Photograph or upload clear imagery of all packaging faces showing declared panels.</p>
                </div>
                <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                  <div className="font-mono font-semibold text-[#111827] text-[11px] mb-1">
                    02 / Rule-Based Verification
                  </div>
                  <p>
                    The system audits MRP, net quantity, manufacturer address, origin, and consumer care details against Legal Metrology Rules.
                  </p>
                </div>
                <div className="p-3 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                  <div className="font-mono font-semibold text-[#111827] text-[11px] mb-1">
                    03 / Compile Statutory Record
                  </div>
                  <p>Review flagged deviations, add inspector remarks, and generate audit-ready documentation.</p>
                </div>
              </div>

              <button
                onClick={() => setGuidanceModalOpen(false)}
                className="w-full bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] py-2.5 text-xs font-medium rounded-xs transition-colors cursor-pointer"
              >
                Close Guidance
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
