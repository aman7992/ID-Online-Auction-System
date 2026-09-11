import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an auction title'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Please provide auction description'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Auction must have at least one image',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Auction category is required'],
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [1, 'Starting price must be at least 1'],
    },
    currentBid: {
      type: Number,
      default: function () {
        return this.startingPrice;
      },
    },
    minimumIncrement: {
      type: Number,
      default: 10,
      min: [1, 'Minimum increment must be at least 1'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'ended', 'cancelled'],
      default: 'active',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Auction', auctionSchema);
