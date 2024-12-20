// src/interfaces/LineItem.ts

import mongoose from "mongoose";

export type LineItemType = 'event' | 'deathNotice' | 'touristAttraction';

export interface LineItemBase {
    id: string;
    title: string;
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    type: LineItemType;
    attributes: LineItemAttributesMap[LineItemType];
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    images: Images;
    status?: LineItemStatus;
    tags?: string[];
    authorId?: string;
    urlSlug?: string;
    visibility?: 'public' | 'private' | 'restricted';
    metaDescription?: string;
    expirationDate?: Date | null;
    priority?: number;
    externalLinks?: string[];
    audit?: AuditInfo;
}

export type LineItemStatus = 'active' | 'inactive' | 'archived';

export interface AuditInfo {
    createdBy: string;
    modifiedBy?: string;
    deletedBy?: string;
    deletedAt?: Date;
}

export interface FeatureImages {
    mobile: string;
    desktop: string;
}

export interface Images {
    thumbnail: string;
    feature: FeatureImages;
    gallery: string[];
}

export interface EventAttributes {
    type: 'event';
    location: string;
    startTime: string;
    endTime: string;
    organizer: string;
}

export interface DeathNoticeAttributes {
    type: 'deathNotice';
    deceasedName: string;
    obituary: string;
    funeralDate: Date;
    funeralLocation: string;
}

export interface TouristAttractionAttributes {
    type: 'touristAttraction';
    address: string;
    openingHours: string;
    ticketPrice: number;
    contactInfo: string;
}

export interface LineItemAttributesMap {
    event: EventAttributes;
    deathNotice: DeathNoticeAttributes;
    touristAttraction: TouristAttractionAttributes;
}

export type LineItemDocument = LineItemBase & mongoose.Document;
