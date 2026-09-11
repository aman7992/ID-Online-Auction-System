import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, ArrowLeft, Save, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditAuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    minimumIncrement: '50',
    endTime: '',
    status: 'active',
    featured: false,
    imageUrls: [],
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, aucRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/auctions/${id}`),
        ]);

        setCategories(catRes.data || []);
        const auc = aucRes.data;

        setFormData({
          title: auc.title,
          category: auc.category?._id || auc.category,
          description: auc.description,
          minimumIncrement: auc.minimumIncrement.toString(),
          endTime: new Date(auc.endTime).toISOString().slice(0, 16),
          status: auc.status,
          featured: auc.featured || false,
          imageUrls: auc.images || [],
        });
      } catch (err) {
        showToast('Failed to load auction data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, newImageUrl.trim()],
      }));
      setNewImageUrl('');
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
    try {
      setSubmitting(true);
      await api.put(`/auctions/${id}`, {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        minimumIncrement: Number(formData.minimumIncrement),
        endTime: new Date(formData.endTime),
        status: formData.status,
        featured: formData.featured,
        images: formData.imageUrls,
      });

      showToast('Auction details updated successfully!', 'success');
      navigate('/admin/auctions');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update auction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading auction details for editing..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
            <Edit2 className="w-6 h-6 text-amber-400" />
            Edit Auction Lot
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify details, status, or timer settings for this lot
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Auction Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Category
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
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer capitalize"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Auction End Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Minimum Bid Increment (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                required
                value={formData.minimumIncrement}
                onChange={(e) => setFormData({ ...formData, minimumIncrement: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Full Description
          </label>
          <textarea
            rows={5}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
          />
        </div>

        {/* Images */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Item Image Gallery URLs
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Add image URL..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 border border-slate-700 transition-colors"
            >
              Add
            </button>
          </div>

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

        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-800">
          <input
            type="checkbox"
            id="editFeaturedCheck"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="editFeaturedCheck" className="text-xs font-semibold text-slate-200 cursor-pointer">
            Mark as Featured Lot
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-xl font-bold text-sm text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{submitting ? 'Saving Changes...' : 'Update Auction Details'}</span>
        </button>
      </form>
    </div>
  );
};

export default EditAuctionPage;
