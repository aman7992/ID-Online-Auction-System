import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit2,
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  AlertCircle,
  Lock,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditUserAuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [auction, setAuction] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    startingPrice: '',
    minimumIncrement: '1000',
    endTime: '',
    imageUrls: [],
  });

  const [newUrlInput, setNewUrlInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, aucRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/auctions/${id}`),
        ]);

        setCategories(catRes.data || []);
        const a = aucRes.data;
        setAuction(a);

        setFormData({
          title: a.title,
          category: a.category?._id || a.category,
          description: a.description,
          startingPrice: a.startingPrice.toString(),
          minimumIncrement: a.minimumIncrement.toString(),
          endTime: new Date(a.endTime).toISOString().slice(0, 16),
          imageUrls: a.images || [],
        });
      } catch (err) {
        showToast('Failed to load auction lot details', 'error');
        navigate('/user/auctions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const hasBids = (auction?.bidCount || 0) > 0;

  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.imageUrls.length + files.length > 8) {
      showToast('Maximum 8 images allowed', 'warning');
      return;
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
      showToast('Failed to upload auction images', 'error');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (newUrlInput.trim()) {
      if (formData.imageUrls.length >= 8) {
        showToast('Maximum 8 images allowed', 'warning');
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

    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    if (!formData.description.trim()) {
      showToast('Description is required', 'error');
      return;
    }

    if (formData.imageUrls.length === 0) {
      showToast('At least one image is required', 'error');
      return;
    }

    const updatePayload = {
      title: formData.title,
      description: formData.description,
      images: formData.imageUrls,
    };

    // If no bids placed yet, allow changing category, increment, and endTime
    if (!hasBids) {
      updatePayload.category = formData.category;
      updatePayload.minimumIncrement = Number(formData.minimumIncrement);
      updatePayload.endTime = new Date(formData.endTime);
    }

    try {
      setSubmitting(true);
      await api.put(`/auctions/${id}`, updatePayload);
      showToast('Auction updated successfully!', 'success');
      navigate('/user/auctions');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update auction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading auction for editing..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/user/auctions')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Edit2 className="w-6 h-6 text-amber-500" />
            Edit Auction Lot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update description, images, or details for "{auction?.title}"
          </p>
        </div>
      </div>

      {/* Terms Locked Alert if bids exist */}
      {hasBids && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">Important Notice: Auction Terms are Protected</span>
            Bidding has already commenced on this lot ({auction.bidCount} bids placed; Current Bid:{' '}
            <strong>{formatINR(auction.currentBid)}</strong>). To safeguard fair bidding, the opening
            price, minimum increment, category, and timer cannot be altered. You may freely refine the
            title, description, and gallery photos.
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Auction Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Category</span>
              {hasBids && <span className="text-[10px] text-amber-600 font-semibold">(Locked)</span>}
            </label>
            <select
              disabled={hasBids}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>End Date & Time</span>
              {hasBids && <span className="text-[10px] text-amber-600 font-semibold">(Locked)</span>}
            </label>
            <input
              type="datetime-local"
              disabled={hasBids}
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Starting Price (₹ INR)</span>
              <span className="text-[10px] text-amber-600 font-semibold">(Permanent)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="text"
                disabled
                value={Number(formData.startingPrice).toLocaleString('en-IN')}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-mono font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Minimum Bid Increment (₹ INR)</span>
              {hasBids && <span className="text-[10px] text-amber-600 font-semibold">(Locked)</span>}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                disabled={hasBids}
                value={formData.minimumIncrement}
                onChange={(e) => setFormData({ ...formData, minimumIncrement: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
            Detailed Description & Provenance *
          </label>
          <textarea
            rows={5}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed transition-colors"
          />
        </div>

        {/* Gallery Image Manager */}
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Manage Images ({formData.imageUrls.length}/8)
            </span>

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

          <div className="flex gap-2">
            <input
              type="url"
              value={newUrlInput}
              onChange={(e) => setNewUrlInput(e.target.value)}
              placeholder="Paste direct image URL..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-amber-400 border border-slate-300 dark:border-slate-700"
            >
              Add URL
            </button>
          </div>

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

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{submitting ? 'Saving Changes...' : 'Save Auction Changes'}</span>
        </button>
      </form>
    </div>
  );
};

export default EditUserAuctionPage;
