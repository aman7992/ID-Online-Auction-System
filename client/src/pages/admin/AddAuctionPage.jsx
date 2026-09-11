import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image, Calendar, IndianRupee, ArrowLeft, Trash2, Upload } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AddAuctionPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Set default end time to 3 days in the future
  const defaultEndTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    startingPrice: '',
    minimumIncrement: '50',
    endTime: defaultEndTime,
    featured: false,
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    ],
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
        if (res.data?.length > 0) {
          setFormData((prev) => ({ ...prev, category: res.data[0]._id }));
        }
      } catch (err) {
        showToast('Failed to load categories', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImages(true);
      const data = new FormData();
      files.forEach((file) => data.append('images', file));

      const res = await api.post('/upload/auction-images', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.urls?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...res.data.urls],
        }));
        showToast(`Uploaded ${res.data.urls.length} images successfully!`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload images', 'error');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (idx) => {
    if (formData.imageUrls.length <= 1) {
      showToast('Auction must have at least one image', 'warning');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.startingPrice || !formData.endTime) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auctions', {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        startingPrice: Number(formData.startingPrice),
        minimumIncrement: Number(formData.minimumIncrement) || 10,
        endTime: new Date(formData.endTime),
        featured: formData.featured,
        images: formData.imageUrls,
      });

      showToast('Auction item created successfully!', 'success');
      navigate(`/auctions/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create auction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-amber-400" />
            Add New Auction Lot
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Publish a vetted luxury item or rare collectible to the live marketplace
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Auction Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 1974 Rolex Submariner Ref. 1680 Red Sub"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Auction End Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Starting Price (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                required
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                placeholder="5000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Minimum Bid Increment (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                required
                value={formData.minimumIncrement}
                onChange={(e) => setFormData({ ...formData, minimumIncrement: e.target.value })}
                placeholder="50"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Full Description & Provenance *
          </label>
          <textarea
            rows={5}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed specs, condition report, certifications, and history..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
          />
        </div>

        {/* Image URLs Gallery Manager */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">
              Item Images (Add at least one)
            </label>
            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingImages ? 'Uploading...' : 'Upload Files'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImages}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Or paste image URL here..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 border border-slate-700 transition-colors"
            >
              Add URL
            </button>
          </div>

          {/* Image Previews */}
          <div className="flex flex-wrap gap-3 pt-2">
            {formData.imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700 group"
              >
                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Checkbox */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-800">
          <input
            type="checkbox"
            id="featuredCheck"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="featuredCheck" className="text-xs font-semibold text-slate-200 cursor-pointer">
            Mark as Featured (Highlights on Homepage showcase)
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{submitting ? 'Publishing Lot...' : 'Publish Auction to Live Marketplace'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddAuctionPage;
