import React from 'react';
import { Pencil, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DesignCard({ design }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <img src={design.imageUrl} alt={design.designNumber} loading="lazy" className="h-36 w-full object-cover sm:h-48 xl:h-52" />

      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Design No</p>
          <h3 className="mt-1 break-words text-base font-semibold text-slate-800 sm:text-lg">{design.designNumber}</h3>
          {design.size && <p className="mt-1 text-sm text-slate-600">Size: {design.size}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1">
          <p className="text-sm font-semibold text-primary-700 sm:text-base">₹{Number(design.rate || 0).toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-500 sm:text-xs">{new Date(design.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Link to={`/designs/${design._id}`} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-primary-600 px-2 py-2 text-xs font-medium text-white sm:gap-2 sm:px-3 sm:text-sm">
            <Eye size={16} />
            View
          </Link>
          <Link to={`/designs/${design._id}/edit`} className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 sm:gap-2 sm:px-3 sm:text-sm">
            <Pencil size={16} />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
