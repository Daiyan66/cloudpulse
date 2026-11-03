'use strict';

const mongoose = require('mongoose');

const pingResultSchema = new mongoose.Schema(
  {
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitor',
      required: true,
      index: true,
    },
    statusCode: { type: Number, default: null },
    responseTimeMs: { type: Number, required: true },
    isUp: { type: Boolean, required: true },
    error: { type: String, default: null },       // e.g. "ECONNREFUSED"
  },
  {
    timestamps: { createdAt: 'checkedAt', updatedAt: false }, // only createdAt
  }
);

// Compound index for fast "get history for monitor" queries, sorted newest-first
pingResultSchema.index({ monitor: 1, checkedAt: -1 });

// Auto-delete ping results older than 30 days
pingResultSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

pingResultSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const PingResult = mongoose.model('PingResult', pingResultSchema);
module.exports = PingResult;
