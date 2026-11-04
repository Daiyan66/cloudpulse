'use strict';

const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Monitor name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'URL must start with http:// or https://'],
    },
    intervalSeconds: {
      type: Number,
      default: 60,
      min: [30, 'Interval must be at least 30 seconds'],
      max: [86400, 'Interval cannot exceed 24 hours'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    alertWebhookUrl: {
      type: String,
      trim: true,
      default: null,
    },
    alertEmail: {
      type: String,
      trim: true,
      default: null,
    },
    // ─── Denormalized stats (updated on each ping) ────────────────────────────
    lastCheckedAt: { type: Date, default: null },
    lastStatusCode: { type: Number, default: null },
    lastResponseTimeMs: { type: Number, default: null },
    isUp: { type: Boolean, default: null },       // current status
    uptimePercentage: { type: Number, default: null }, // rolling 24-hour uptime %
  },
  {
    timestamps: true,
  }
);

monitorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Monitor = mongoose.model('Monitor', monitorSchema);
module.exports = Monitor;
