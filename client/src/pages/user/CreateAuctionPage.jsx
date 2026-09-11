import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gavel,
  IndianRupee,
  Calendar,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  Upload,
  ArrowLeft,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Default times: start now, end in 3 days
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const defaultEndTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    startingPrice: '',
    minimumIncrement: '1000',
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    ],
  });

  const [newUrlInput, setNewUrlInput] = useState('');

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

  // Multiple files upload via Multer (/api/upload/auction-images)
  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.imageUrls.length + files.length > 8) {
      showToast('Maximum 8 images allowed per auction', 'warning');
      return;
    }

    // Check size & formats
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        showToast(`File ${f.name} exceeds 5MB limit`, 'error');
        return;
      }
    }

    const uploadData = new FormData();
    files.forEach((f) => uploadData.append('images', f));

    try {
      setUploadingImages(true);
      const res = await api.post('/upload/auction-images', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrls = res.data.urls || [];
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls],
      }));
      showToast(`${uploadedUrls.length} image(s) uploaded successfully`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload auction images', 'error');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (newUrlInput.trim()) {
      if (formData.imageUrls.length >= 8) {
        showToast('Maximum 8 images allowed per auction', 'warning');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, newUrlInput.trim()],
      }));
      setNewUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    if (formData.imageUrls.length <= 1) {
      showToast('Auction must have at least one image', 'warning');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!formData.title.trim()) {
      setErrorMessage('Please provide an item title');
      return;
    }

    if (!formData.category) {
      setErrorMessage('Please select a category');
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage('Please provide an item description');
      return;
    }

    const numPrice = Number(formData.startingPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Starting price must be a valid amount greater than ₹0');
      return;
    }

    const numIncrement = Number(formData.minimumIncrement);
    if (isNaN(numIncrement) || numIncrement <= 0) {
      setErrorMessage('Minimum bid increment must be a valid amount greater than ₹0');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (isNaN(endDate.getTime()) || endDate <= startDate) {
      setErrorMessage('End time must be after the start time');
      return;
    }

    if (formData.imageUrls.length === 0) {
      setErrorMessage('Please upload or provide at least one image for your auction item');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auctions', {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        startingPrice: numPrice,
        minimumIncrement: numIncrement,
        startTime: startDate,
        endTime: endDate,
        images: formData.imageUrls,
      });

      showToast('Your auction has been created successfully!', 'success');
      navigate(`/auctions/${res.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create auction lot';
      setErrorMessage(msg);
      showToast(msg, 'error');
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
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Gavel className="w-6 h-6 text-amber-500" />
            Sell an Item & Create Auction
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            List your luxury collectible, timepiece, artwork, or vehicle for live bidding across India
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors"
      >
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Auction Title *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 1974 Rolex Submariner Date 1680 Red Sub"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Auction End Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Pricing in INR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Starting Price (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                required
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                placeholder="25000"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum opening bid required from participants (in Indian Rupees)
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Minimum Bid Increment (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                required
                value={formData.minimumIncrement}
                onChange={(e) => setFormData({ ...formData, minimumIncrement: e.target.value })}
                placeholder="1000"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Each new bid must exceed current bid by at least this increment
            </p>
          </div>
        </div>

        {/* Start Time (Optional override) */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
            Auction Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full sm:w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
            Detailed Description & Provenance *
          </label>
          <textarea
            rows={5}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Include condition report, provenance, serial numbers, box/papers, certificates..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed transition-colors"
          />
        </div>

        {/* Images Upload Gallery */}
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Item Images ({formData.imageUrls.length}/8) *
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Upload photos from your computer or paste image URLs
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleMultipleFilesUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages || formData.imageUrls.length >= 8}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingImages ? 'Uploading...' : 'Upload Photos'}</span>
            </button>
          </div>

          {/* Add Image URL option */}
          <div className="flex gap-2">
            <input
              type="url"
              value={newUrlInput}
              onChange={(e) => setNewUrlInput(e.target.value)}
              placeholder="Or paste an image URL (e.g. https://images.unsplash.com/...)"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-amber-400 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              Add URL
            </button>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {formData.imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src={url}
                  alt={`Lot preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploadingImages}
          className="w-full py-4 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{submitting ? 'Creating Auction Lot...' : 'Publish Auction for Live Bidding'}</span>
        </button>
      </form>
    </div>
  );
};

export default CreateAuctionPage;
