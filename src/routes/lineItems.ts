// src/routes/lineItems.ts

import express, { Request, Response, NextFunction } from 'express';
import LineItemModel from '../models/LineItem';
import { LineItemDocument } from '../interfaces/LineItem';
import validateLineItems from '../middleware/validateLineItems';

const router = express.Router();

/**
 * GET /line-items/:id
 * Fetch a single LineItem by its ID.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const lineItem = await LineItemModel.findOne({ _id:id });

        if (!lineItem) {
            return res.status(404).json({ message: 'LineItem not found.' });
        }

        res.json(lineItem);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /line-items
 * Fetch all LineItems with pagination.
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of items per page (default: 10)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    let { page = '1', limit = '10' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
        return res.status(400).json({ message: 'Invalid page number.' });
    }

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        return res.status(400).json({ message: 'Invalid limit number. Must be between 1 and 100.' });
    }

    try {
        const totalItems = await LineItemModel.countDocuments();
        const totalPages = Math.ceil(totalItems / limitNumber);
        const skip = (pageNumber - 1) * limitNumber;

        const lineItems = await LineItemModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        res.json({
            totalItems,
            totalPages,
            currentPage: pageNumber,
            pageSize: limitNumber,
            items: lineItems,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /line-items
 * Create multiple LineItems.
 * Body: Array of LineItems.
 * Validation: Each LineItem is validated. If any fail, respond with 400 and details.
 * If all pass, insert into DB and return list of id and title.
 */
router.post('/', validateLineItems, async (req: Request, res: Response, next: NextFunction) => {
    const lineItems = req.body;

    try {
        // Insert multiple LineItems
        const insertedLineItems: LineItemDocument[] = await LineItemModel.insertMany(lineItems, { ordered: true });

        // Map to return only id and title
        const response = insertedLineItems.map(item => ({
            id: item.id,
            title: item.title,
        }));

        res.status(201).json({ message: 'LineItems created successfully.', items: response });
    } catch (error: any) {
        // Handle duplicate key error (e.g., duplicate 'id')
        if (error.code === 11000) {
            const duplicateKey = Object.keys(error.keyValue)[0];
            const duplicateValue = error.keyValue[duplicateKey];
            return res.status(400).json({
                message: `Duplicate value for ${duplicateKey}: ${duplicateValue}. Each LineItem must have a unique ${duplicateKey}.`,
            });
        }

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err: any) => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ message: 'Validation failed.', errors: validationErrors });
        }

        next(error);
    }
});

/**
 * PUT /line-items/:id
 * Update a LineItem by its ID.
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Find the existing LineItem using _id
        const lineItem = await LineItemModel.findOne({ _id: id });

        if (!lineItem) {
            return res.status(404).json({ message: 'LineItem not found.' });
        }

        // Prevent modification of internal keys
        const { createdAt, updatedAt, audit, ...allowedUpdates } = updateData;

        // Update the LineItem with allowed fields
        Object.assign(lineItem, allowedUpdates);

        // Save the updated LineItem
        await lineItem.save();

        res.json({ message: 'LineItem updated successfully.', lineItem });
    } catch (error) {
        next(error);
    }
});

export default router;
