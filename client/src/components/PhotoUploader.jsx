import React from 'react';
import { UploadCloud, Camera, Image as ImageIcon, X } from 'lucide-react';

export default function PhotoUploader({ label, preview, onFileSelect, onClear, required = false, accept = 'image/*' }) {
  const inputId = `${label}-upload`;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && ' *'}
      </label>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        {!preview ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary-100 p-3 text-primary-700">
              <UploadCloud size={22} />
            </div>
            <div>
              <p className="font-medium text-slate-700">Upload or capture a photo</p>
              <p className="text-xs text-slate-500">PNG, JPG, JPEG, WEBP</p>
            </div>
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-600 px-3 py-2 text-sm font-medium text-white">
                <ImageIcon size={16} />
                Gallery
                <input type="file" accept={accept} className="hidden" onChange={(e) => onFileSelect(e.target.files[0])} />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                <Camera size={16} />
                Camera
                <input type="file" accept={accept} capture="environment" className="hidden" onChange={(e) => onFileSelect(e.target.files[0])} />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <img src={preview} alt="Preview" className="h-56 w-full rounded-xl object-cover shadow-sm" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Photo ready</span>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
