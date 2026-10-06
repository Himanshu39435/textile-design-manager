import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Search, Image as ImageIcon, ArrowRight, CheckCircle2, XCircle, Plus, X } from 'lucide-react';
import api from '../api/client';

export default function SearchPhotoPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = (selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResults([]);
    setHasSearched(false);
    setMessage('');
  };

  const handleSearch = async () => {
    if (!file) {
      setMessage('Please upload a garment photo first.');
      return;
    }

    setLoading(true);
    setMessage('');
    setResults([]);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/designs/search-by-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(data.data || []);
      setHasSearched(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Photo search failed. Please try again.');
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const createDesignWithPhoto = () => {
    navigate('/add-design', { state: { photoFile: file } });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-10 2xl:p-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700 sm:text-sm">Search</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Search By Photo</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Upload a garment photo to find matching designs already in your collection.
        </p>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-6 2xl:grid-cols-[minmax(380px,0.9fr)_minmax(0,1.1fr)] 2xl:gap-8">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5">
            {!preview ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Camera size={24} />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800 sm:text-lg">Upload a product photo</p>
                  <p className="mt-1 text-sm text-slate-500">Search your saved designs for a match.</p>
                </div>
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white">
                  <ImageIcon size={16} />
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => {
                      handleFile(event.target.files[0]);
                      event.target.value = '';
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:min-h-80 sm:rounded-2xl 2xl:min-h-[28rem]">
                  <img src={preview} alt="Photo to search" className="max-h-96 w-full object-contain 2xl:max-h-[28rem]" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                  >
                    <Search size={16} />
                    {loading ? 'Searching...' : 'Search Designs'}
                  </button>
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                    <ImageIcon size={16} />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(event) => {
                        handleFile(event.target.files[0]);
                        event.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview('');
                      setResults([]);
                      setHasSearched(false);
                      setMessage('');
                    }}
                    aria-label="Remove photo"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <X size={16} />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {message && (
            <div role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
              {message}
            </div>
          )}
        </section>

        <section aria-live="polite" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Search Results</h2>
              <p className="mt-1 text-sm text-slate-500">
                {results.length ? `${results.length} matching ${results.length === 1 ? 'design' : 'designs'} found` : 'Closest matching designs appear here'}
              </p>
            </div>
            {results.length > 0 && <CheckCircle2 size={20} className="shrink-0 text-emerald-600" aria-hidden="true" />}
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Searching designs">
              {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((design) => (
                <article key={design._id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-emerald-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                    <img src={design.imageUrl} alt={design.designNumber} loading="lazy" className="h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white shadow">
                      <CheckCircle2 size={13} />
                      Design Matched
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-base font-semibold text-slate-900 sm:text-lg">{design.designNumber}</p>
                      <p className="mt-1 text-base font-semibold text-primary-700">₹{Number(design.rate || 0).toLocaleString('en-IN')}</p>
                      <p className="mt-1 text-sm text-slate-600">{Math.round(design.similarity)}% match</p>
                    </div>
                    <Link
                      to={`/designs/${design._id}`}
                      className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 sm:w-auto"
                    >
                      View Design <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:min-h-80 sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <XCircle size={26} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">No matching design found</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                This photo did not match any saved design. You can add it as a new design.
              </p>
              <button
                type="button"
                onClick={createDesignWithPhoto}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                <Plus size={17} />
                Create New Design
              </button>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 sm:min-h-80">
              Upload a photo and select <strong className="ml-1 text-slate-700">Search Designs</strong> to see matches.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
