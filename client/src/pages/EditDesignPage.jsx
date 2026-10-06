import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import PhotoUploader from '../components/PhotoUploader';

export default function EditDesignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [designNumber, setDesignNumber] = useState('');
  const [size, setSize] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await api.get(`/designs/${id}`);
      const item = data.data;
      setDesign(item);
      setDesignNumber(item.designNumber || '');
      setSize(item.size || '');
      setRate(String(item.rate || ''));
      setDescription(item.description || item.notes || '');
      setPreview(item.imageUrl || '');
    }
    load();
  }, [id]);

  const handleSave = async () => {
    const formData = new FormData();
    if (file) formData.append('image', file);
    formData.append('designNumber', designNumber);
    formData.append('size', size);
    formData.append('rate', rate);
    formData.append('description', description);

    try {
      await api.put(`/designs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/designs/${id}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    }
  };

  if (!design) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-10 2xl:p-12">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-700">Edit</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Edit Design</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
        <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:gap-8">
          <PhotoUploader label="Design Photo" preview={preview} onFileSelect={(selected) => { setFile(selected); setPreview(URL.createObjectURL(selected)); }} onClear={() => setPreview(design.imageUrl)} />

          <div className="min-w-0 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Design Number</label>
              <input value={designNumber} onChange={(e) => setDesignNumber(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Size *</label>
              <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. M, XL, 40" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Rate</label>
              <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 outline-none" />
            </div>
            <button onClick={handleSave} className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white">Save Changes</button>
            {message && <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
