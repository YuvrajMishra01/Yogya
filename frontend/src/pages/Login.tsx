/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  X,
  ShieldCheck,
} from 'lucide-react';
import { YogyaLogo } from '../components/common/YogyaLogo';
import { api } from '../lib/api';

interface LoginProps {
  navigate: (path: string) => void;
}

export function Login({ navigate }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = identifier.trim();
    const trimmedPw = password.trim();

    if (!trimmedId) {
      setErrorMessage('Please enter your inspector ID or email address.');
      return;
    }

    if (!trimmedPw) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (trimmedPw.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.login(trimmedId, trimmedPw);
      setIsSubmitting(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex flex-col font-sans selection:bg-[#D9DEE7] selection:text-[#111827]">
      {/* Top Focused Navigation Bar */}
      <header className="bg-[#FAFAFC] border-b border-[#D9DEE7] px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back to Yogya Link */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#667085] hover:text-[#111827] transition-colors cursor-pointer group py-1"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Yogya</span>
          </button>

          {/* Logo Brand Mark */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer focus:outline-hidden"
          >
            <YogyaLogo size="sm" />
          </button>

          {/* Institutional Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs text-[10px] font-mono uppercase font-semibold text-[#667085]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF7D]"></span>
            SECURE PORTAL
          </div>
        </div>
      </header>

      {/* Main Login Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Brand Context & Institutional Editorial Details */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 bg-[#E8F0FC]/70 border border-[#D9DEE7] rounded-xs relative overflow-hidden"
            >
              {/* Subtle abstract technical inspection/warehouse background treatment (5-7% opacity) */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.06] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="metrology-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#071B3A" strokeWidth="1" />
                    <circle cx="20" cy="20" r="1" fill="#071B3A" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#metrology-grid)" />
                  {/* Abstract isometric package geometry outlines */}
                  <path d="M280 80 L350 120 L350 200 L280 160 Z" stroke="#071B3A" strokeWidth="1.5" fill="none" />
                  <path d="M280 80 L210 120 L210 200 L280 160 Z" stroke="#071B3A" strokeWidth="1.5" fill="none" />
                  <path d="M280 80 L350 120 L280 160 L210 120 Z" stroke="#071B3A" strokeWidth="1.5" fill="none" />
                  <path d="M245 280 L315 320 L315 380 L245 340 Z" stroke="#071B3A" strokeWidth="1.2" fill="none" />
                  <path d="M245 280 L175 320 L175 380 L245 340 Z" stroke="#071B3A" strokeWidth="1.2" fill="none" />
                  <path d="M245 280 L315 320 L245 340 L175 320 Z" stroke="#071B3A" strokeWidth="1.2" fill="none" />
                  {/* Caliper / dimension tick marks */}
                  <line x1="40" y1="320" x2="140" y2="320" stroke="#071B3A" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="40" y1="312" x2="40" y2="328" stroke="#071B3A" strokeWidth="1.5" />
                  <line x1="140" y1="312" x2="140" y2="328" stroke="#071B3A" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10">
                {/* Brand Tag */}
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs text-[11px] font-mono font-semibold uppercase tracking-wider text-[#667085] mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#071B3A]"></span>
                  LEGAL METROLOGY COMPLIANCE
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#111827] leading-tight mb-6">
                  Your inspection workspace,<br className="hidden sm:inline" /> securely organized.
                </h1>

                {/* Institutional Security Notice / Access Register Box */}
                <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 sm:p-5 rounded-xs space-y-3 mb-6">
                  <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#111827] tracking-wider">
                      INSPECTION SYSTEM
                    </span>
                    <span className="text-[10px] font-mono uppercase text-[#667085] bg-[#FAFAFC] px-1.5 py-0.5 border border-[#D9DEE7] rounded-xs font-semibold">
                      SECURE ACCESS
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#667085] pt-1">
                    <div>
                      <span className="block text-[10px] text-[#667085]/80 uppercase">System Edition</span>
                      <span className="font-semibold text-[#111827]">YOGYA / 2026</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-[#667085]/80 uppercase">Access Protocol</span>
                      <span className="font-semibold text-[#111827]">SECURE AUTH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Column Bottom Institutional Meta */}
              <div className="mt-8 pt-4 border-t border-[#D9DEE7] flex items-center justify-between text-xs text-[#667085] relative z-10">
                <div>
                  <div className="font-bold text-[#111827] text-sm tracking-tight">YOGYA</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#667085]">DIGITAL INSPECTION PLATFORM</div>
                </div>
                <span className="text-[11px] font-mono text-[#667085] bg-[#FFFFFF] px-2 py-0.5 border border-[#D9DEE7] rounded-xs">
                  Authorized access only
                </span>
              </div>
            </motion.div>

            {/* Right Column: Sign In Form Box */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-6 sm:p-8 lg:p-10 rounded-[12px] shadow-xs">
                {/* Form Header */}
                <div className="mb-6 pb-4 border-b border-[#D9DEE7]">
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#111827] mb-1.5">
                    Welcome back.
                  </h2>
                  <p className="text-sm text-[#667085]">
                    Sign in to access your inspection workspace.
                  </p>
                  <div className="w-8 h-0.5 bg-[#071B3A] mt-3"></div>
                </div>

                {/* Inline Error Alert */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-5 p-3 bg-[#C62828]/10 border border-[#C62828]/30 text-[#C62828] rounded-xs text-xs flex items-start gap-2"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C62828]" />
                      <div className="font-medium">{errorMessage}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sign In Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Inspector ID or Email */}
                  <div>
                    <label
                      htmlFor="inspector-id"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1.5 font-mono"
                    >
                      INSPECTOR ID OR EMAIL
                    </label>
                    <div className="relative">
                      <input
                        id="inspector-id"
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="Enter your inspector ID or email address"
                        className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D9DEE7] focus:border-[#071B3A] focus:ring-1 focus:ring-[#071B3A] text-sm text-[#111827] rounded-xs outline-hidden placeholder-[#98A2B3]/50 transition-colors"
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#111827] font-mono"
                      >
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordModalOpen(true)}
                        className="text-xs text-[#526B86] hover:text-[#111827] hover:underline transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="Enter your password"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-[#FFFFFF] border border-[#D9DEE7] focus:border-[#071B3A] focus:ring-1 focus:ring-[#071B3A] text-sm text-[#111827] rounded-xs outline-hidden placeholder-[#98A2B3]/50 transition-colors"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#667085] hover:text-[#111827] transition-colors focus:outline-hidden"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded-[3px] border-[#CBD5E1] text-[#071B3A] focus:ring-[#071B3A] accent-[#071B3A]"
                      />
                      <span className="text-xs text-[#667085]">Remember me on this device</span>
                    </label>
                  </div>

                  {/* Primary Submit Button with Subtle Right Arrow */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A4A] py-3 text-sm font-medium rounded-xs transition-colors border border-[#071B3A] shadow-xs active:translate-y-px cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2 font-mono text-xs">
                          <span className="w-3.5 h-3.5 border-2 border-[#FAFAFC] border-t-transparent rounded-full animate-spin"></span>
                          AUTHENTICATING...
                        </span>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4 text-[#FFFFFF]/80" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Security Message */}
                  <div className="pt-2 text-center space-y-0.5">
                    <div className="text-[11px] font-medium text-[#526B86]">
                      Protected inspection workspace
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      Access is restricted to authorized personnel.
                    </div>
                  </div>
                </form>

                {/* Need access? Contact your system administrator */}
                <div className="mt-5 pt-4 border-t border-[#D9DEE7] text-center text-xs text-[#667085]">
                  <span>Need access? </span>
                  <button
                    type="button"
                    onClick={() => setAdminModalOpen(true)}
                    className="text-[#111827] hover:underline font-medium cursor-pointer ml-1"
                  >
                    Contact your system administrator
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Understated Bottom Security Message */}
          <div className="mt-10 pt-6 border-t border-[#D9DEE7] text-center text-xs font-mono text-[#667085]">
            <span>Your data and inspection records are protected</span>
            <span className="mx-2 text-[#667085]/50">•</span>
            <span>Secure. Private. Trusted.</span>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071B3A]/40 backdrop-blur-2xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-md w-full p-6 rounded-xs shadow-lg"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#667085]" />
                  <h3 className="text-sm font-serif font-bold text-[#111827]">
                    Password Recovery
                  </h3>
                </div>
                <button
                  onClick={() => setForgotPasswordModalOpen(false)}
                  className="p-1 text-[#667085] hover:text-[#111827] rounded-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed mb-6">
                Password recovery is currently managed through your system administrator.
              </p>

              <button
                onClick={() => setForgotPasswordModalOpen(false)}
                className="w-full bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] py-2.5 text-xs font-medium rounded-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Administrator Modal */}
      <AnimatePresence>
        {adminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071B3A]/40 backdrop-blur-2xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#FFFFFF] border border-[#D9DEE7] max-w-md w-full p-6 rounded-xs shadow-lg"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#667085]" />
                  <h3 className="text-sm font-serif font-bold text-[#111827]">
                    Access Request
                  </h3>
                </div>
                <button
                  onClick={() => setAdminModalOpen(false)}
                  className="p-1 text-[#667085] hover:text-[#111827] rounded-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed mb-6">
                Inspection workspaces are provisioned by your system administrator. Please reach out to your administrator to request access credentials.
              </p>

              <button
                onClick={() => setAdminModalOpen(false)}
                className="w-full bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] py-2.5 text-xs font-medium rounded-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
