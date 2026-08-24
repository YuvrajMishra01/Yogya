/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { YogyaLogo } from '../components/common/YogyaLogo';

interface LandingProps {
  navigate: (path: string) => void;
}

export function Landing({ navigate }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'front' | 'back'>('back');
  const [isInspectionWindowOpen, setIsInspectionWindowOpen] = useState(true);

  // Subtle cursor-following motion for hero inspection card
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 180, mass: 0.5 };
  const cardX = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const cardY = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [-8, 8]), springConfig);
  const cardRotateX = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [-2, 2]), springConfig);
  const cardRotateY = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-3, 3]), springConfig);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const xPct = (e.clientX - rect.left) / rect.width - 0.5;
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;
      heroMouseX.set(xPct);
      heroMouseY.set(yPct);
    }
  };

  const handleHeroMouseLeave = () => {
    heroMouseX.set(0);
    heroMouseY.set(0);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col font-sans selection:bg-[#D9DEE7] selection:text-[#111827]">
      {/* ─────────────────────────────────────────────────────────────
          1. INSTITUTIONAL CLASSIFICATION STRIP
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#E8F0FC] border-b border-[#D9DEE7] px-4 py-1.5 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-[#667085]">
          <span>Legal Metrology</span>
          <span className="text-[#D9DEE7]">•</span>
          <span>Packaged Commodities</span>
          <span className="text-[#D9DEE7]">•</span>
          <span>Digital Inspection</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. NAVBAR
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAFAFC]/95 backdrop-blur-xs border-b border-[#D9DEE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand Logo & Mark */}
          <button
            onClick={() => scrollToSection('platform')}
            className="flex items-center gap-3 group focus:outline-hidden focus:ring-2 focus:ring-[#071A33] rounded-sm p-1 cursor-pointer text-left"
          >
            <YogyaLogo size="lg" showSubtitle={true} subtitleText="Legal Metrology Compliance" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#667085]">
            <button
              onClick={() => scrollToSection('platform')}
              className="hover:text-[#111827] transition-colors cursor-pointer py-1"
            >
              Platform
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#111827] transition-colors cursor-pointer py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#111827] transition-colors cursor-pointer py-1"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-[#111827] transition-colors cursor-pointer py-1"
            >
              About
            </button>
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-[#111827] hover:text-[#071B3A] transition-colors px-3 py-2 cursor-pointer"
            >
              Inspector Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] px-4 py-2 text-sm font-medium rounded-xs transition-colors border border-[#071B3A] shadow-xs active:translate-y-px cursor-pointer"
            >
              Start Inspection
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#111827] hover:bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs focus:outline-hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-b border-[#D9DEE7] bg-[#FAFAFC] px-4 pt-3 pb-6 space-y-3"
            >
              <div className="flex flex-col space-y-2 text-base font-medium text-[#111827]">
                <button
                  onClick={() => scrollToSection('platform')}
                  className="text-left py-2 px-2 hover:bg-[#E8F0FC] rounded-xs"
                >
                  Platform
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left py-2 px-2 hover:bg-[#E8F0FC] rounded-xs"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-left py-2 px-2 hover:bg-[#E8F0FC] rounded-xs"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-left py-2 px-2 hover:bg-[#E8F0FC] rounded-xs"
                >
                  About
                </button>
              </div>
              <div className="pt-3 border-t border-[#D9DEE7] flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-center py-2.5 text-sm font-medium border border-[#D9DEE7] bg-[#FFFFFF] text-[#111827] rounded-xs cursor-pointer"
                >
                  Inspector Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-center py-2.5 text-sm font-medium bg-[#071B3A] text-[#FFFFFF] rounded-xs cursor-pointer"
                >
                  Start Inspection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section
        id="platform"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#D9DEE7] overflow-hidden"
      >
        {/* Background Warehouse Image with blur */}
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center blur-[10px] scale-105 pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />

        {/* Dark Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/90 via-[#071426]/70 to-[#071426]/30 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Hero Column */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="lg:col-span-7 flex flex-col items-start"
            >
              {/* Small Uppercase Label */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs text-[11px] font-semibold uppercase tracking-wider text-[#071A33] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#071B3A]"></span>
                Legal Metrology Compliance
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif font-normal text-[#FFFFFF] leading-[1.12] tracking-tight mb-5">
                Making package inspection more reliable.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#D6E2F0] leading-relaxed max-w-2xl mb-8 font-normal">
                Verify packaged commodity declarations through a structured digital inspection workflow designed to make compliance checks clearer, faster and easier to document.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setIsInspectionWindowOpen(true);
                    navigate('/login');
                  }}
                  className="inline-flex items-center justify-center bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] px-6 py-3 text-sm sm:text-base font-medium rounded-xs transition-colors border border-[#071B3A] shadow-xs text-center cursor-pointer"
                >
                  Start an Inspection
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center justify-center text-sm sm:text-base font-medium text-[#111827] hover:text-[#071B3A] px-5 py-3 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] rounded-xs transition-colors cursor-pointer text-center"
                >
                  Explore the Process <ArrowRight className="ml-1.5 w-4 h-4" />
                </button>
              </div>

              {/* Institutional Reference Subtext */}
              <div className="mt-8 pt-6 border-t border-[#D9DEE7]/40 w-full flex items-center gap-4 text-xs text-[#D6E2F0]">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#D6E2F0] font-medium">Standard:</span>
                <span>The Legal Metrology (Packaged Commodities) Rules, 2011</span>
              </div>
            </motion.div>

            {/* Right Hero Column: Realistic Product Inspection Interface Visual */}
            <div className="lg:col-span-5 w-full min-h-[440px] flex flex-col justify-center relative">
              <AnimatePresence mode="wait">
                {isInspectionWindowOpen ? (
                  <motion.div
                    key="hero-inspection-window"
                    initial={{ opacity: 0, scale: 0.95, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.94,
                      y: -14,
                      transition: { duration: 0.35, ease: 'easeInOut' }
                    }}
                    transition={{
                      type: 'spring',
                      damping: 22,
                      stiffness: 220,
                      mass: 0.8
                    }}
                    className="w-full"
                  >
                    <motion.div
                      style={{
                        x: cardX,
                        y: cardY,
                        rotateX: cardRotateX,
                        rotateY: cardRotateY,
                        transformPerspective: 1000,
                        transformStyle: 'preserve-3d',
                      }}
                      className="bg-[#FFFFFF] border border-[#CBD5E1] shadow-2xl shadow-[#000000]/30 rounded-[12px] overflow-hidden"
                    >
                      
                      {/* macOS-style Window Title Bar */}
                      <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* macOS Window Traffic Lights */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsInspectionWindowOpen(false);
                              }}
                              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/70 inline-block hover:opacity-85 active:scale-95 transition-transform cursor-pointer focus:outline-hidden"
                              title="Close Window"
                              aria-label="Close Inspection Window"
                            />
                            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/70 inline-block"></span>
                            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/70 inline-block"></span>
                          </div>
                          <span className="text-[11px] font-mono uppercase font-semibold tracking-wider text-[#111827]">
                            PRODUCT INSPECTION
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFFFFF] border border-[#D9DEE7] text-[#667085] rounded-xs">
                          REF-2026-0884
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Fictional Packaged Product Visual Representation */}
                        <div className="relative bg-[#FAFAFC] border border-[#D9DEE7] p-4 rounded-xs overflow-hidden">
                          <div className="flex items-start justify-between pb-3 border-b border-[#D9DEE7]">
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085] block">Commodity Unit</span>
                              <h4 className="text-sm font-serif font-bold text-[#111827]">Standard Packaged Commodity</h4>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#E8F0FC] border border-[#D9DEE7] text-[#111827]">
                              500 g Solid
                            </span>
                          </div>

                          {/* Inspection Overlay Elements */}
                          <div className="py-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
                              <div className="text-[10px] text-[#667085] uppercase font-mono">Retail Price (MRP)</div>
                              <div className="font-semibold text-[#111827] mt-0.5">₹ 99.00</div>
                              <span className="text-[9px] text-[#4CAF7D] font-medium flex items-center gap-1 mt-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-[#4CAF7D]" /> Incl. all taxes
                              </span>
                            </div>
                            <div className="p-2 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
                              <div className="text-[10px] text-[#667085] uppercase font-mono">Net Quantity</div>
                              <div className="font-semibold text-[#111827] mt-0.5">500 g</div>
                              <span className="text-[9px] text-[#4CAF7D] font-medium flex items-center gap-1 mt-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-[#4CAF7D]" /> Compliant unit
                              </span>
                            </div>
                          </div>

                          {/* Subtle scanning bar animation */}
                          <div className="w-full h-0.5 bg-[#667085]/20 relative overflow-hidden">
                            <div className="absolute top-0 bottom-0 w-1/3 bg-[#071B3A] opacity-40 animate-pulse"></div>
                          </div>
                        </div>

                        {/* Inspection Findings Checklist Panel */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs py-1 border-b border-[#D9DEE7]">
                            <span className="text-[#667085]">Product</span>
                            <span className="font-medium text-[#111827]">Packaged Commodity</span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1 border-b border-[#D9DEE7]">
                            <span className="text-[#667085]">MRP</span>
                            <span className="font-medium text-[#111827] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF7D]"></span>
                              ₹99
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1 border-b border-[#D9DEE7]">
                            <span className="text-[#667085]">Net Quantity</span>
                            <span className="font-medium text-[#111827] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF7D]"></span>
                              500 g
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1 border-b border-[#D9DEE7]">
                            <span className="text-[#667085]">Manufacturer</span>
                            <span className="font-medium text-[#111827] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF7D]"></span>
                              Detected
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1 border-b border-[#D9DEE7]">
                            <span className="text-[#667085]">Consumer Care</span>
                            <span className="font-medium text-[#D9A441] flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-[#D9A441]" />
                              Review Required
                            </span>
                          </div>
                        </div>

                        {/* Summary Metric Footer */}
                        <div className="pt-2 flex items-center justify-between bg-[#E8F0FC] p-2.5 rounded-xs border border-[#D9DEE7]">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085] block">Compliance Score</span>
                            <span className="text-xl font-bold font-serif text-[#111827]">82%</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085] block">Overall Status</span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-xs bg-[#FFF5DF] text-[#D9A441] border border-[#D9A441]/40">
                              Needs Review
                            </span>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="w-full flex items-end justify-end pt-12 pb-2">
                    <motion.button
                      key="hero-minimized-chip"
                      type="button"
                      initial={{ opacity: 0, scale: 0.85, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: 8, transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsInspectionWindowOpen(true)}
                      className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-[#071A33] hover:bg-[#0C2444] text-[#FFFFFF] text-xs font-medium rounded-[10px] border border-white/20 shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/50 transition-all duration-200 cursor-pointer group"
                      title="Restore Product Inspection Window"
                      aria-label="Restore Product Inspection Window"
                    >
                      <span className="text-[13px] text-[#A5C0E0] group-hover:text-white transition-colors leading-none select-none">▣</span>
                      <span className="font-medium tracking-tight text-[#FFFFFF]">Product Inspection</span>
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. VALUE STRIP
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFFFF] border-b border-[#D9DEE7] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            <div className="flex items-start gap-3.5 sm:border-r border-[#D9DEE7] sm:pr-4">
              <span className="text-xs font-mono font-bold text-[#667085] pt-0.5">01</span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
                  Faster Inspections
                </h2>
                <p className="text-xs text-[#667085] mt-1 leading-normal">
                  Standardize field checks with structured digitised capture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 sm:border-r border-[#D9DEE7] sm:pr-4">
              <span className="text-xs font-mono font-bold text-[#667085] pt-0.5">02</span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
                  Declaration Verification
                </h2>
                <p className="text-xs text-[#667085] mt-1 leading-normal">
                  Evaluate mandatory details against metrology mandates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 sm:border-r border-[#D9DEE7] sm:pr-4">
              <span className="text-xs font-mono font-bold text-[#667085] pt-0.5">03</span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
                  Evidence-Based Findings
                </h2>
                <p className="text-xs text-[#667085] mt-1 leading-normal">
                  Link every flag directly to image evidence and legal clauses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="text-xs font-mono font-bold text-[#667085] pt-0.5">04</span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
                  Digital Reporting
                </h2>
                <p className="text-xs text-[#667085] mt-1 leading-normal">
                  Export consistent, auditable inspection records immediately.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. HOW IT WORKS SECTION
          ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#D9DEE7] bg-[#FAFAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="max-w-2xl mb-12 sm:mb-16">
            <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#667085] mb-2">
              Workflow Sequence
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111827] mb-3">
              From package to compliance report.
            </h2>
            <p className="text-base text-[#667085]">
              One structured workflow for inspecting packaged commodities.
            </p>
          </div>

          {/* 4 Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 relative">
            
            {/* Stage 1 */}
            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 rounded-xs relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[#D9DEE7] pb-3">
                  <span className="font-mono text-sm font-bold text-[#111827]">01</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Step 1</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#111827] mb-2">CAPTURE</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Upload or capture package images from multiple angles including principal display panel and consumer information panels.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D9DEE7] text-xs font-mono text-[#667085]">
                PDP • Rear Panel • Sides
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 rounded-xs relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[#D9DEE7] pb-3">
                  <span className="font-mono text-sm font-bold text-[#111827]">02</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Step 2</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#111827] mb-2">EXTRACT</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Identify important declarations from the packaging including MRP, Net Quantity, Dates, Manufacturer address, and Customer care.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D9DEE7] text-xs font-mono text-[#667085]">
                Declaration Parser
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 rounded-xs relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[#D9DEE7] pb-3">
                  <span className="font-mono text-sm font-bold text-[#111827]">03</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Step 3</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#111827] mb-2">VERIFY</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Check declarations against applicable requirements specified under the Legal Metrology (Packaged Commodities) Rules, 2011.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D9DEE7] text-xs font-mono text-[#667085]">
                Rule Matching Engine
              </div>
            </div>

            {/* Stage 4 */}
            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 rounded-xs relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-[#D9DEE7] pb-3">
                  <span className="font-mono text-sm font-bold text-[#111827]">04</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Step 4</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#111827] mb-2">REPORT</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Generate a structured inspection record with verified items, flagged discrepancies, and referenced statutory provisions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#D9DEE7] text-xs font-mono text-[#667085]">
                Formal Audit Dossier
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FEATURES SECTION
          ───────────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 border-b border-[#D9DEE7] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12 sm:mb-16">
            <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#667085] mb-2">
              Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111827] mb-3">
              Everything needed for a better inspection.
            </h2>
            <p className="text-base text-[#667085]">
              Purpose-built capabilities designed around actual enforcement and quality compliance workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Feature 01 */}
            <div className="border border-[#D9DEE7] p-6 sm:p-8 bg-[#FAFAFC]/60 rounded-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <span className="font-mono text-xs font-bold text-[#667085]">01</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Input Stage</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#111827] mb-3">
                Product Scanning
              </h3>
              <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
                Upload package images and prepare them for inspection with structured multi-surface guidance and high-resolution document processing.
              </p>
            </div>

            {/* Feature 02 */}
            <div className="border border-[#D9DEE7] p-6 sm:p-8 bg-[#FAFAFC]/60 rounded-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <span className="font-mono text-xs font-bold text-[#667085]">02</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Automated Check</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#111827] mb-3">
                Declaration Verification
              </h3>
              <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
                Check declarations such as MRP, net quantity, manufacturer details, and consumer care information against mandated statutory standards.
              </p>
            </div>

            {/* Feature 03 */}
            <div className="border border-[#D9DEE7] p-6 sm:p-8 bg-[#FAFAFC]/60 rounded-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <span className="font-mono text-xs font-bold text-[#667085]">03</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Auditability</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#111827] mb-3">
                Explainable Findings
              </h3>
              <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
                Understand what was detected, where it was detected, and why it needs attention, with direct pointers to the corresponding legal clauses.
              </p>
            </div>

            {/* Feature 04 */}
            <div className="border border-[#D9DEE7] p-6 sm:p-8 bg-[#FAFAFC]/60 rounded-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <span className="font-mono text-xs font-bold text-[#667085]">04</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">Output Dossier</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#111827] mb-3">
                Inspection Reports
              </h3>
              <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
                Keep evidence and generate structured inspection records formatted for official review, internal archives, or compliance notices.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. PRODUCT PREVIEW SECTION (Realistic Application Screen)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#D9DEE7] bg-[#E8F0FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#667085] mb-2">
              System Interface Preview
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111827] mb-3">
              See compliance at a glance.
            </h2>
            <p className="text-base text-[#667085]">
              A unified inspection console designed for rapid verification, clear evidence anchoring, and definitive compliance status.
            </p>
          </div>

          {/* Large Inspection Preview Workspace */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-sm overflow-hidden">
            
            {/* Top Workspace Toolbar */}
            <div className="bg-[#FAFAFC] border-b border-[#D9DEE7] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase font-bold text-[#111827]">
                  CASE #INSP-2026-4409
                </span>
                <span className="text-[#D9DEE7]">|</span>
                <span className="text-xs text-[#667085]">Packaged Food Commodity (500g Pouch)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveInteractiveTab('front')}
                  className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                    activeInteractiveTab === 'front'
                      ? 'bg-[#071B3A] text-[#FFFFFF] border-[#071B3A]'
                      : 'bg-[#FFFFFF] text-[#667085] border-[#D9DEE7]'
                  }`}
                >
                  Principal Display
                </button>
                <button
                  onClick={() => setActiveInteractiveTab('back')}
                  className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                    activeInteractiveTab === 'back'
                      ? 'bg-[#071B3A] text-[#FFFFFF] border-[#071B3A]'
                      : 'bg-[#FFFFFF] text-[#667085] border-[#D9DEE7]'
                  }`}
                >
                  Declaration Panel
                </button>
              </div>
            </div>

            {/* Split Screen: Left Package Visual / Right Declaration Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Side: Fictional Package Visual with Inspection Markings */}
              <div className="lg:col-span-6 p-6 sm:p-8 bg-[#FAFAFC]/40 border-b lg:border-b-0 lg:border-r border-[#D9DEE7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#667085] mb-4">
                    <span>EVIDENCE VIEWPORT</span>
                    <span>100% SCALE (VERIFIED)</span>
                  </div>

                  {/* Clean Vector Packaging Mockup */}
                  <div className="border border-[#D9DEE7] bg-[#FFFFFF] p-6 rounded-xs relative">
                    <div className="text-center pb-4 border-b border-[#D9DEE7]">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#667085] block">Generic Packaged Commodity</span>
                      <h4 className="text-lg font-serif font-bold text-[#111827]">ORGANIC TURMERIC POWDER</h4>
                      <span className="text-xs text-[#667085]">Grade A Pure Spice Powder</span>
                    </div>

                    <div className="py-5 space-y-3 font-mono text-xs">
                      {/* Highlighted MRP */}
                      <div className="p-2 border border-[#287A52]/30 bg-[#287A52]/10 rounded-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#287A52] block font-bold">MAX. RETAIL PRICE</span>
                          <span className="font-bold text-[#111827]">₹ 99.00 (INCL. OF ALL TAXES)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#287A52] text-[#FFFFFF] rounded-xs font-bold">
                          ✓ RULE 6(1)(e)
                        </span>
                      </div>

                      {/* Highlighted Net Quantity */}
                      <div className="p-2 border border-[#287A52]/30 bg-[#287A52]/10 rounded-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#287A52] block font-bold">NET QUANTITY</span>
                          <span className="font-bold text-[#111827]">500 g</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#287A52] text-[#FFFFFF] rounded-xs font-bold">
                          ✓ RULE 6(1)(d)
                        </span>
                      </div>

                      {/* Manufacturer Address Block */}
                      <div className="p-2 border border-[#287A52]/30 bg-[#287A52]/10 rounded-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#287A52] block font-bold">MANUFACTURED & PACKED BY</span>
                          <span className="text-[#111827]">ABC Foods Pvt. Ltd., Industrial Area, Phase II</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#287A52] text-[#FFFFFF] rounded-xs font-bold">
                          ✓ RULE 6(1)(a)
                        </span>
                      </div>

                      {/* Flagged Missing Consumer Care */}
                      <div className="p-2 border border-[#B7791F]/30 bg-[#B7791F]/10 rounded-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#B7791F] block font-bold">CONSUMER CARE CONTACT</span>
                          <span className="text-[#B7791F] italic">Helpline number missing from label</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#B7791F] text-[#FFFFFF] rounded-xs font-bold">
                          ⚠ REVIEW REQ.
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#667085] font-mono text-right pt-2 border-t border-[#D9DEE7]">
                      SURFACE: REAR PANEL (RESOLUTION: 300 DPI)
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-[#667085] font-mono">
                  Inspection Timestamp: 2026-08-22 • Inspector ID: INSP-902
                </div>
              </div>

              {/* Right Side: Declaration Checklist & Scorecard */}
              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[#FFFFFF]">
                <div>
                  <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-3 mb-5">
                    <h3 className="text-base font-serif font-bold text-[#111827]">
                      Mandatory Declaration Checklist
                    </h3>
                    <span className="text-[11px] font-mono text-[#667085]">
                      5 / 6 Items Detected
                    </span>
                  </div>

                  <div className="space-y-3">
                    
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                      <span className="text-sm font-medium text-[#111827]">Product Name</span>
                      <span className="text-xs font-mono font-semibold text-[#287A52] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Detected
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                      <span className="text-sm font-medium text-[#111827]">MRP (incl. all taxes)</span>
                      <span className="text-xs font-mono font-semibold text-[#287A52] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> ₹99
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                      <span className="text-sm font-medium text-[#111827]">Net Quantity</span>
                      <span className="text-xs font-mono font-semibold text-[#287A52] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> 500 g
                      </span>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                      <span className="text-sm font-medium text-[#111827]">Manufacturer Details</span>
                      <span className="text-xs font-mono font-semibold text-[#287A52] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Detected
                      </span>
                    </div>

                    {/* Item 5 */}
                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                      <span className="text-sm font-medium text-[#111827]">Manufacturing Date</span>
                      <span className="text-xs font-mono font-semibold text-[#287A52] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Detected
                      </span>
                    </div>

                    {/* Item 6 */}
                    <div className="flex items-center justify-between p-2.5 bg-[#B7791F]/10 border border-[#B7791F]/30 rounded-xs">
                      <span className="text-sm font-medium text-[#111827]">Consumer Care</span>
                      <span className="text-xs font-mono font-semibold text-[#B7791F] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Review Required
                      </span>
                    </div>

                  </div>
                </div>

                {/* Score and Status Panel */}
                <div className="mt-8 pt-5 border-t border-[#D9DEE7] grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#667085] block">Compliance Score</span>
                    <span className="text-2xl font-bold font-serif text-[#111827]">82%</span>
                  </div>
                  <div className="p-3 bg-[#B7791F]/10 border border-[#B7791F]/30 rounded-xs">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#B7791F] block">Inspection Status</span>
                    <span className="text-sm font-bold text-[#B7791F] block mt-1">Needs Review</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. EXPLAINABLE FINDINGS SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#D9DEE7] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#667085] mb-2">
              Evidence Clarity
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111827] mb-3">
              Don't just flag an issue. Show why.
            </h2>
            <p className="text-base text-[#667085]">
              Every flag includes contextual confidence ratings, localized visual evidence, and statutory justification.
            </p>
          </div>

          {/* Example Finding Demonstration Box */}
          <div className="border border-[#D9DEE7] bg-[#FAFAFC] p-6 sm:p-8 rounded-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D9DEE7]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#667085] block">Flagged Finding</span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#111827]">
                  MISSING CONSUMER CARE DETAILS
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2.5 py-1 bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30 rounded-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs Review
                </span>
                <span className="text-xs font-mono px-2.5 py-1 bg-[#FFFFFF] text-[#111827] border border-[#D9DEE7] rounded-xs font-medium">
                  Confidence: 94%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              
              <div className="p-4 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
                <span className="text-[11px] font-mono uppercase text-[#667085] font-bold block mb-1">
                  Evidence
                </span>
                <p className="text-sm text-[#111827]">
                  Package area requiring review
                </p>
                <div className="mt-3 p-2 bg-[#E8F0FC] border border-dashed border-[#D9DEE7] text-[11px] font-mono text-[#667085] text-center">
                  [ Rear Panel Address Bounding Box ]
                </div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs">
                <span className="text-[11px] font-mono uppercase text-[#667085] font-bold block mb-1">
                  Why this matters
                </span>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Required consumer care information was not detected during the inspection.
                </p>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#667085] font-bold block mb-1">
                    Applicable Requirement
                  </span>
                  <p className="text-xs font-mono text-[#111827]">
                    Rule 6(1)(f) — Legal Metrology (Packaged Commodities) Rules, 2011
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#D9DEE7]">
                  <span className="text-xs font-medium text-[#111827] inline-flex items-center gap-1 hover:underline">
                    View requirement →
                  </span>
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-[#D9DEE7] text-xs text-[#667085] font-mono">
              * Demonstration visual for informational workflow overview only.
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. INSPECTION INTELLIGENCE SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#D9DEE7] bg-[#FAFAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#667085] mb-2">
              Aggregated Quality Insights
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111827] mb-3">
              Turn inspection records into better decisions.
            </h2>
            <p className="text-base text-[#667085]">
              Historic inspection synthesis to spot recurring labeling anomalies across commodity batches.
            </p>
          </div>

          {/* Conceptual Summary Box */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 sm:p-8 rounded-xs shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9DEE7]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#667085] tracking-wider block">Packer / Manufacturer</span>
                <h3 className="text-xl font-serif font-bold text-[#111827]">
                  ABC Foods Pvt. Ltd.
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-[#667085]">Risk Classification:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/30 rounded-xs">
                  HIGH RISK
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-[#D9DEE7]">
              <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                <span className="text-[11px] font-mono uppercase text-[#667085] block">Total Inspections</span>
                <span className="text-2xl font-bold font-serif text-[#111827] mt-1 block">24</span>
              </div>
              <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                <span className="text-[11px] font-mono uppercase text-[#667085] block">Recorded Findings</span>
                <span className="text-2xl font-bold font-serif text-[#111827] mt-1 block">8</span>
              </div>
              <div className="p-4 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs">
                <span className="text-[11px] font-mono uppercase text-[#667085] block">Finding Rate</span>
                <span className="text-2xl font-bold font-serif text-[#C62828] mt-1 block">33%</span>
              </div>
            </div>

            <div className="pt-6">
              <div className="text-xs font-mono uppercase font-bold text-[#667085] mb-3">
                Common Flagged Areas Across Audits:
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-mono px-2.5 py-1 bg-[#E8F0FC] border border-[#D9DEE7] text-[#111827] rounded-xs">
                  MRP Syntax Formats
                </span>
                <span className="text-xs font-mono px-2.5 py-1 bg-[#E8F0FC] border border-[#D9DEE7] text-[#111827] rounded-xs">
                  Net Quantity Font Height
                </span>
                <span className="text-xs font-mono px-2.5 py-1 bg-[#E8F0FC] border border-[#D9DEE7] text-[#111827] rounded-xs">
                  Consumer Helpline Address
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. PROCESS STATEMENT
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-[#D9DEE7] bg-[#E8F0FC] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#111827] mb-8 font-normal">
            One platform for the complete inspection lifecycle.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono uppercase font-bold text-[#111827]">
            <span className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs">CAPTURE</span>
            <span className="text-[#667085]">→</span>
            <span className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs">ANALYZE</span>
            <span className="text-[#667085]">→</span>
            <span className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs">VERIFY</span>
            <span className="text-[#667085]">→</span>
            <span className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs">REVIEW</span>
            <span className="text-[#667085]">→</span>
            <span className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs shadow-2xs">REPORT</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. FINAL CTA SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#D9DEE7] bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#111827] mb-4">
            Ready to start an inspection?
          </h2>
          <p className="text-base sm:text-lg text-[#667085] max-w-2xl mx-auto mb-8">
            Bring product images, declarations and compliance checks into one structured workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] px-7 py-3.5 text-sm sm:text-base font-medium rounded-xs transition-colors border border-[#071B3A] shadow-xs text-center cursor-pointer"
            >
              Start an Inspection
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto inline-flex items-center justify-center text-sm sm:text-base font-medium text-[#111827] hover:text-[#071B3A] px-6 py-3.5 border border-[#D9DEE7] bg-[#FAFAFC] hover:bg-[#E8F0FC] rounded-xs transition-colors cursor-pointer text-center"
            >
              Explore the Platform →
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          12. INSTITUTIONAL FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer id="about" className="bg-[#FAFAFC] pt-12 pb-10 border-t border-[#D9DEE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#D9DEE7]">
            
            {/* Brand and Description */}
            <div className="max-w-md">
              <div className="flex items-center gap-2.5 mb-2">
                <YogyaLogo size="md" />
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                Legal Metrology Compliance Platform for packaged commodities inspection, declaration verification, and statutory reporting under Legal Metrology Rules, 2011.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#667085]">
              <button
                onClick={() => scrollToSection('platform')}
                className="hover:text-[#111827] transition-colors cursor-pointer"
              >
                Platform
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#111827] transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-[#111827] transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-[#111827] transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => navigate('/login')}
                className="hover:text-[#111827] transition-colors font-semibold cursor-pointer"
              >
                Inspector Login
              </button>
            </div>

          </div>

          {/* Bottom Copyright & Problem Statement */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#667085]">
            <div>
              SIH 2026 • Problem Statement 26034
            </div>
            <div>
              Digital Legal Metrology Verification System Prototype
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
