/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Package,
  Search,
  X,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { ProductSummary } from '../types';

interface ProductsProps {
  products: ProductSummary[];
  onSelectProduct: (productName: string) => void;
  navigate: (path: string) => void;
}

export function Products({
  products,
  onSelectProduct,
  navigate,
}: ProductsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT'>('ALL');
  const [sortBy, setSortBy] = useState<'MOST_INSPECTED' | 'NEWEST' | 'NAME'>('MOST_INSPECTED');

  // Filter & sort products
  const filteredProducts = products
    .filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.manufacturer.toLowerCase().includes(q) ||
        prod.address.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'NEEDS REVIEW'
          ? prod.latestStatus === 'NEEDS REVIEW' || prod.latestStatus === 'INCONCLUSIVE'
          : prod.latestStatus === statusFilter);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'MOST_INSPECTED') {
        return b.stats.totalInspections - a.stats.totalInspections;
      }
      if (sortBy === 'NEWEST') {
        const timeA = new Date(a.latestInspectionDate).getTime() || 0;
        const timeB = new Date(b.latestInspectionDate).getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'NAME') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const totalCommodities = products.length;
  const totalAudits = products.reduce((acc, p) => acc + p.stats.totalInspections, 0);
  const compliantProducts = products.filter((p) => p.latestStatus === 'COMPLIANT').length;
  const flaggedProducts = products.filter((p) => p.stats.failed > 0 || p.latestStatus === 'NON-COMPLIANT').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="pb-4 border-b border-[#D9DEE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111827]">
            Product repository
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Catalog of inspected packaged commodities, manufacturer declarations, and compliance track records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/inspection')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        /* Empty State */
        <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-8 sm:p-14 rounded-xs text-center max-w-xl mx-auto shadow-2xs space-y-4">
          <div className="w-12 h-12 bg-[#E8F0FC] border border-[#D9DEE7] rounded-xs flex items-center justify-center mx-auto text-[#111827]">
            <Package className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-serif font-bold text-[#111827]">
            No cataloged commodities yet.
          </h3>

          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Packaged commodities are automatically indexed into your repository when you conduct and save legal metrology inspections.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/inspection')}
              className="px-4 py-2 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
            >
              Start First Inspection
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-[#D9DEE7] bg-[#FFFFFF] hover:bg-[#E8F0FC] text-xs font-medium text-[#111827] rounded-xs transition-colors cursor-pointer"
            >
              Back to Overview
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#667085] mb-1">
                Cataloged Commodities
              </div>
              <div className="text-2xl font-serif font-bold text-[#111827]">
                {totalCommodities}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#667085] mb-1">
                Total Inspections
              </div>
              <div className="text-2xl font-serif font-bold text-[#111827]">
                {totalAudits}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#287A52] mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#287A52]"></span>
                <span>Fully Compliant</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#287A52]">
                {compliantProducts}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#C62828] mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C62828]"></span>
                <span>Flagged Deficiencies</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#C62828]">
                {flaggedProducts}
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-4 rounded-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search commodity by name, manufacturer or address..."
                  className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#D9DEE7] focus:border-[#071B3A] focus:ring-1 focus:ring-[#071B3A] text-xs text-[#111827] rounded-xs outline-hidden placeholder-[#98A2B3]/50 transition-colors font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#111827]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#667085] shrink-0">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#FAFAFC] border border-[#D9DEE7] text-xs font-mono text-[#111827] rounded-xs outline-hidden cursor-pointer"
                >
                  <option value="MOST_INSPECTED">Most Audited</option>
                  <option value="NEWEST">Recently Inspected</option>
                  <option value="NAME">Commodity Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D9DEE7]">
              <span className="text-[11px] font-mono text-[#667085] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Latest Status:</span>
              </span>
              {(['ALL', 'COMPLIANT', 'NEEDS REVIEW', 'NON-COMPLIANT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-[#071B3A] text-[#FFFFFF] font-semibold'
                      : 'bg-[#FAFAFC] text-[#667085] hover:bg-[#E8F0FC] hover:text-[#111827]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid / Cards */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#D9DEE7] p-12 text-center text-[#667085] rounded-xs space-y-2">
              <p className="text-sm font-medium text-[#111827]">
                No commodities match the selected search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="mt-2 text-xs font-mono underline text-[#111827] cursor-pointer"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#FFFFFF] border border-[#D9DEE7] rounded-xs p-5 hover:border-[#071B3A] transition-colors space-y-4 shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-xs border ${
                              prod.latestStatus === 'COMPLIANT'
                                ? 'bg-[#EAF5EF] text-[#287A52] border-[#287A52]'
                                : prod.latestStatus === 'NON-COMPLIANT'
                                ? 'bg-[#FDF2F2] text-[#C62828] border-[#C62828]'
                                : 'bg-[#FEF8EC] text-[#B7791F] border-[#B7791F]'
                            }`}
                          >
                            Latest: {prod.latestStatus}
                          </span>

                          <span className="text-[10px] font-mono text-[#667085] px-1.5 py-0.5 bg-[#E8F0FC] rounded-2xs">
                            {prod.stats.totalInspections} {prod.stats.totalInspections === 1 ? 'Audit' : 'Audits'}
                          </span>
                        </div>

                        <h3
                          className="text-base font-serif font-bold text-[#111827] hover:underline cursor-pointer"
                          onClick={() => onSelectProduct(prod.name)}
                        >
                          {prod.name}
                        </h3>
                      </div>

                      <div className="w-8 h-8 rounded-xs bg-[#FAFAFC] border border-[#D9DEE7] flex items-center justify-center text-[#667085] shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Manufacturer & Specifications */}
                    <div className="space-y-1 text-xs">
                      <p className="text-[#667085] font-mono line-clamp-1">
                        <strong className="text-[#111827]">Mfr:</strong> {prod.manufacturer || 'Unspecified'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#667085]">
                        <span>Qty: <strong className="text-[#111827]">{prod.netQuantity || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>MRP: <strong className="text-[#111827]">{prod.mrp || 'N/A'}</strong></span>
                        {prod.countryOfOrigin && (
                          <>
                            <span>•</span>
                            <span>Origin: <strong className="text-[#111827]">{prod.countryOfOrigin}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Compliance Track Record Bar */}
                    <div className="p-2.5 bg-[#FAFAFC] border border-[#D9DEE7] rounded-xs space-y-1.5 text-[11px] font-mono">
                      <div className="flex items-center justify-between text-[#667085]">
                        <span>Compliance History:</span>
                        <span className="text-[#111827] font-bold">
                          {prod.stats.passed} Pass / {prod.stats.needsReview} Review / {prod.stats.failed} Violations
                        </span>
                      </div>

                      <div className="w-full bg-[#E8F0FC] h-1.5 rounded-full overflow-hidden flex">
                        {prod.stats.passed > 0 && (
                          <div
                            style={{ width: `${(prod.stats.passed / prod.stats.totalInspections) * 100}%` }}
                            className="bg-[#287A52] h-full"
                            title={`${prod.stats.passed} Compliant`}
                          />
                        )}
                        {prod.stats.needsReview > 0 && (
                          <div
                            style={{ width: `${(prod.stats.needsReview / prod.stats.totalInspections) * 100}%` }}
                            className="bg-[#B7791F] h-full"
                            title={`${prod.stats.needsReview} Needs Review`}
                          />
                        )}
                        {prod.stats.failed > 0 && (
                          <div
                            style={{ width: `${(prod.stats.failed / prod.stats.totalInspections) * 100}%` }}
                            className="bg-[#C62828] h-full"
                            title={`${prod.stats.failed} Violations`}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-[#D9DEE7] flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#667085]">
                      Last inspected: {prod.latestInspectionDate}
                    </span>

                    <button
                      onClick={() => onSelectProduct(prod.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#071B3A] text-[#FFFFFF] hover:bg-[#0D2A55] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
