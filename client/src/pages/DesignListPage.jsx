import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../api/client';
import DesignCard from '../components/DesignCard';

export default function DesignListPage() {
  const [designs, setDesigns] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minRate: '', maxRate: '', size: '', sort: 'newest' });
  const [appliedFilters, setAppliedFilters] = useState({ minRate: '', maxRate: '', size: '', sort: 'newest' });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { page, limit: 12, designNumber: search.trim(), ...appliedFilters };
        const { data } = await api.get('/designs', { params });
        setDesigns(data.data || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || 'Designs could not be loaded. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, appliedFilters]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  };

  const resetFilters = () => {
    const defaults = { minRate: '', maxRate: '', size: '', sort: 'newest' };
    setFilters(defaults);
    setAppliedFilters(defaults);
    setPage(1);
  };

  const activeFilterCount = [
    appliedFilters.minRate !== '',
    appliedFilters.maxRate !== '',
    appliedFilters.size.trim() !== '',
    appliedFilters.sort !== 'newest'
  ].filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-10 2xl:p-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft sm:rounded-3xl sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full min-w-0 md:max-w-xl">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search Design Number..." className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-3 outline-none focus:border-primary-500" />
          </div>
          <button
            type="button"
            aria-expanded={showFilters}
            onClick={() => setShowFilters((open) => !open)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 md:w-auto"
          >
            <SlidersHorizontal size={16} />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        {showFilters && (
          <form onSubmit={applyFilters} className="mt-4 border-t border-slate-200 pt-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label htmlFor="filter-size" className="mb-2 block text-sm font-medium text-slate-700">Size</label>
                <input
                  id="filter-size"
                  value={filters.size}
                  onChange={(event) => updateFilter('size', event.target.value)}
                  placeholder="e.g. M, XL, 40"
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="filter-min-rate" className="mb-2 block text-sm font-medium text-slate-700">Minimum Rate (₹)</label>
                <input
                  id="filter-min-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minRate}
                  onChange={(event) => updateFilter('minRate', event.target.value)}
                  placeholder="Any"
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="filter-max-rate" className="mb-2 block text-sm font-medium text-slate-700">Maximum Rate (₹)</label>
                <input
                  id="filter-max-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxRate}
                  onChange={(event) => updateFilter('maxRate', event.target.value)}
                  placeholder="Any"
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="filter-sort" className="mb-2 block text-sm font-medium text-slate-700">Sort By</label>
                <select
                  id="filter-sort"
                  value={filters.sort}
                  onChange={(event) => updateFilter('sort', event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-500"
                >
                  <option value="newest">Recently Added</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rate-low">Rate: Low to High</option>
                  <option value="rate-high">Rate: High to Low</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={resetFilters} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <X size={16} />
                Reset
              </button>
              <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white">
                <SlidersHorizontal size={16} />
                Apply Filters
              </button>
            </div>
          </form>
        )}
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {!loading && !error && (
        <p className="text-sm text-slate-600">
          {total} {total === 1 ? 'design' : 'designs'} found
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : designs.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {designs.map((design) => (
              <DesignCard key={design._id} design={design} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
            <span className="text-sm text-slate-600">Page {page} of {Math.max(1, Math.ceil(total / 12))}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">Prev</button>
              <button disabled={page >= Math.max(1, Math.ceil(total / 12))} onClick={() => setPage(page + 1)} className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No designs found.</div>
      )}
    </div>
  );
}
