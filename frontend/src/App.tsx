/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { InspectionReport } from './types';
import { deriveProductCatalog } from './lib/compliance';
import { INITIAL_DEMO_REPORTS } from './data/demoData';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import { History } from './pages/History';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Report } from './pages/Report';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LogoutModal, GuidanceModal } from './components/common/Modals';

import { api, getToken, removeToken, ProductSummary } from './lib/api';

const STORAGE_KEY = 'yogya_inspection_reports';
const LEGACY_STORAGE_KEY = 'metriscan_inspection_reports';

export default function App() {
  // Client-side routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const validPaths = [
        '/login',
        '/dashboard',
        '/inspection',
        '/history',
        '/reports',
        '/products',
        '/settings',
        '/help',
      ];
      if (validPaths.includes(path)) {
        return path;
      }
    }
    return '/';
  });

  // Backend state
  const [reports, setReports] = useState<InspectionReport[]>(INITIAL_DEMO_REPORTS);
  const [backendProducts, setBackendProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchBackendData = async () => {
    const token = getToken();
    if (!token && currentPath !== '/' && currentPath !== '/login') {
      return;
    }
    if (token) {
      setIsLoading(true);
      setApiError(null);
      try {
        const [fetchedReports, fetchedProducts] = await Promise.all([
          api.getInspections(),
          api.getProducts(),
        ]);
        if (fetchedReports) {
          setReports(fetchedReports);
        }
        setBackendProducts(fetchedProducts);
      } catch (err: any) {
        setApiError(err.message || 'Failed to sync with backend');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [currentPath]);

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const validPaths = [
        '/login',
        '/dashboard',
        '/inspection',
        '/history',
        '/reports',
        '/products',
        '/settings',
        '/help',
      ];
      if (validPaths.includes(path)) {
        setCurrentPath(path);
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cross-view selection state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);

  // Shell modals state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false);

  // Derived Products Catalog (fallback to client-side if backendProducts not fetched yet)
  const derivedProducts = useMemo(() => {
    if (backendProducts.length > 0) return backendProducts;
    return deriveProductCatalog(reports);
  }, [reports, backendProducts]);

  const activeProduct = useMemo(
    () => derivedProducts.find((p) => p.name === selectedProductName),
    [derivedProducts, selectedProductName]
  );

  // Report handlers
  const handleSaveReport = async (newReport: InspectionReport) => {
    await fetchBackendData();
    setSelectedReportId(newReport.id);
    navigate('/reports');
  };

  const handleUpdateReportObservations = async (reportId: string, obs: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, observations: obs } : r))
    );
    try {
      await api.updateInspection(reportId, { observations: obs });
    } catch (err: any) {
      console.error('Failed to update observations on backend', err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (selectedInspectionId === reportId) setSelectedInspectionId(null);
    if (selectedReportId === reportId) setSelectedReportId(null);
    try {
      await api.deleteInspection(reportId);
      await fetchBackendData();
    } catch (err: any) {
      console.error('Failed to delete inspection on backend', err);
    }
  };

  // 1. Landing Page
  if (currentPath === '/') {
    return <Landing navigate={navigate} />;
  }

  // 2. Login Page
  if (currentPath === '/login') {
    return <Login navigate={navigate} />;
  }

  // 3. Workspace Routes
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111827] flex font-sans selection:bg-[#D9DEE7] selection:text-[#111827]">
      {/* Sidebar navigation */}
      <Sidebar
        currentPath={currentPath}
        navigate={navigate}
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
        onLogoutClick={() => setLogoutModalOpen(true)}
        onSelectReportsReset={() => setSelectedReportId(null)}
      />

      {/* Main content view area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          reports={reports}
          derivedProducts={derivedProducts}
          onSelectInspection={(id) => {
            setSelectedInspectionId(id);
            navigate('/history');
          }}
          onSelectProduct={(name) => {
            setSelectedProductName(name);
            navigate('/products');
          }}
          logoutModalOpen={logoutModalOpen}
          setLogoutModalOpen={setLogoutModalOpen}
          guidanceModalOpen={guidanceModalOpen}
          setGuidanceModalOpen={setGuidanceModalOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentPath === '/dashboard' && (
            <Dashboard
              navigate={navigate}
              reports={reports}
              onOpenGuidance={() => setGuidanceModalOpen(true)}
              onSelectInspection={(id) => {
                setSelectedInspectionId(id);
                navigate('/history');
              }}
              onSelectReport={(id) => {
                setSelectedReportId(id);
                navigate('/reports');
              }}
              onSelectProduct={(name) => {
                setSelectedProductName(name);
                navigate('/products');
              }}
            />
          )}

          {currentPath === '/inspection' && (
            <NewInspection
              navigate={navigate}
              onSaveReport={handleSaveReport}
            />
          )}

          {currentPath === '/history' && (
            <History
              navigate={navigate}
              reports={reports}
              selectedInspectionId={selectedInspectionId}
              onSelectInspection={setSelectedInspectionId}
              onSelectReport={(id) => {
                setSelectedReportId(id);
                navigate('/reports');
              }}
              onSelectProduct={(name) => {
                setSelectedProductName(name);
                navigate('/products');
              }}
              onDeleteInspection={handleDeleteReport}
              onUpdateObservation={handleUpdateReportObservations}
            />
          )}

          {currentPath === '/reports' && (
            <Report
              navigate={navigate}
              reports={reports}
              selectedReportId={selectedReportId}
              onSelectReport={setSelectedReportId}
              onDeleteReport={handleDeleteReport}
              onUpdateObservation={handleUpdateReportObservations}
            />
          )}

          {currentPath === '/products' && (
            selectedProductName && activeProduct ? (
              <ProductDetails
                navigate={navigate}
                product={activeProduct}
                onBack={() => setSelectedProductName(null)}
                onSelectInspection={(id) => {
                  setSelectedInspectionId(id);
                  navigate('/history');
                }}
                onSelectReport={(id) => {
                  setSelectedReportId(id);
                  navigate('/reports');
                }}
              />
            ) : (
              <Products
                navigate={navigate}
                products={derivedProducts}
                onSelectProduct={(name) => setSelectedProductName(name)}
              />
            )
          )}

          {currentPath === '/settings' && <Settings navigate={navigate} />}

          {currentPath === '/help' && <Help navigate={navigate} />}
        </main>
      </div>

      {/* Global Shell Modals */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          removeToken();
          setLogoutModalOpen(false);
          navigate('/login');
        }}
      />

      <GuidanceModal
        isOpen={guidanceModalOpen}
        onClose={() => setGuidanceModalOpen(false)}
      />
    </div>
  );
}
