// src/models/LineItem.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  LineItemType,
  LineItemAttributesMap,
  LineItemStatus,
  AuditInfo,
} from '../interfaces/LineItem';

const { ObjectId } = Schema.Types;

// Base Schema
const LineItemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    type: {
      type: String,
      required: true,
      enum: ['event', 'deathNotice', 'touristAttraction'],
    },
    phone: { type: String },
    email: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    images: {
      thumbnail: { type: String, required: true },
      feature: {
        mobile: { type: String, required: true },
        desktop: { type: String, required: true },
      },
      gallery: [{ type: String }],
    },
    status: { type: String, enum: ['active', 'inactive', 'archived'] },
    tags: [{ type: String }],
    authorId: { type: String },
    urlSlug: { type: String },
    visibility: { type: String, enum: ['public', 'private', 'restricted'] },
    metaDescription: { type: String },
    expirationDate: { type: Date, default: null },
    priority: { type: Number },
    externalLinks: [{ type: String }],
    audit: {
      createdBy: { type: String, required: true },
      modifiedBy: { type: String },
      deletedBy: { type: String },
      deletedAt: { type: Date },
    },
    categories: {
      primary: { type: String, required: true, index: true },
      secondary: [{ type: String, index: true }]
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      canonicalUrl: String,
      robots: String,
      ogImage: String,
      structuredData: Schema.Types.Mixed
    },
    metadata: {
      isTemplate: { type: Boolean, default: false },
      isFeatured: { type: Boolean, default: false },
      isSponsored: { type: Boolean, default: false },
      viewCount: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      customFields: Schema.Types.Mixed
    },
    attributes: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { discriminatorKey: 'type', timestamps: true, strict: false }
);

// Add text search index
LineItemSchema.index({
  title: 'text',
  description: 'text',
  'categories.primary': 'text',
  'categories.secondary': 'text',
  tags: 'text'
});

// Base Model
const LineItem: Model<Document> = mongoose.model('LineItem', LineItemSchema);

// Discriminator Schemas
const EventSchema = new Schema({
  attributes: {
    location: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    organizer: { type: String, required: true },
  },
});

const DeathNoticeSchema = new Schema({
  attributes: {
    deceasedName: { type: String, required: true },
    obituary: { type: String, required: true },
    funeralDate: { type: Date, required: true },
    funeralLocation: { type: String, required: true },
  },
});

const TouristAttractionSchema = new Schema({
  attributes: {
    address: { type: String, required: true },
    openingHours: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    contactInfo: { type: String, required: true },
  },
});

// Discriminators
LineItem.discriminator('event', EventSchema);
LineItem.discriminator('deathNotice', DeathNoticeSchema);
LineItem.discriminator('touristAttraction', TouristAttractionSchema);

export default LineItem;
