import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2, Copy, Download } from 'lucide-react';
import api from '../api/client';

export default function DesignDetailPage() {
  const { id } = useParams();
  const [design, setDesign] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await api.get(`/designs/${id}`);
      setDesign(data.data || null);
    }
    load();
  }, [id]);

  if (!design) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6 lg:space-y-8 lg:p-10 2xl:p-12">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start lg:gap-6 2xl:gap-8">
      <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-soft sm:min-h-80 lg:min-h-[28rem] lg:rounded-3xl 2xl:min-h-[36rem]">
        <img src={design.imageUrl} alt={design.designNumber} className="max-h-[70vh] w-full object-contain lg:max-h-[78vh]" />
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Design Number</p>
            <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">{design.designNumber}</h1>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link to={`/designs/${id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-3 py-2 text-sm font-medium text-white"><Pencil size={16} /> Edit</Link>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 sm:px-3 sm:text-sm"><Copy size={16} /> Copy Number</button>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 sm:px-3 sm:text-sm"><Download size={16} /> Download</button>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"><Trash2 size={16} /> Delete</button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-1 2xl:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Size</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{design.size || 'Not specified'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rate</p>
            <p className="mt-2 text-2xl font-bold text-primary-700">₹{Number(design.rate || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Created Date</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{new Date(design.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Modified</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{new Date(design.updatedAt || design.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</p>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">{design.description || design.notes || 'No description added.'}</p>
        </div>
      </div>
      </div>
    </div>
  );
}
