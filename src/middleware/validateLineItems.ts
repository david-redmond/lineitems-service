// src/middleware/validateLineItems.ts

import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { LineItemType } from '../interfaces/LineItem';
import { log } from 'console';

/**
 * Validation rules for LineItems.
 * Since we're dealing with an array of LineItems, we'll validate each item in the array.
 */
const validateLineItems = [
    // Ensure that the request body is an array
    body().isArray({ min: 1 }).withMessage('Request body should be a non-empty array of LineItems.'),

    // Validate each LineItem in the array
    
    body('*.title')
        .isString().withMessage('title must be a string.'),

    body('*.description')
        .isString().withMessage('description must be a string.'),

    body('*.date')
        .isISO8601().withMessage('date must be a valid ISO8601 date.'),

    body('*.type')
        .isIn(['event', 'deathNotice', 'touristAttraction']).withMessage('type must be one of event, deathNotice, touristAttraction.'),
  

    // Final middleware to check for validation errors
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Format errors to indicate which item failed and why
            const formattedErrors = errors.array().map(err => ({
                message: err.msg,
            }));
            return res.status(400).json({ errors: formattedErrors });
        }
        next();
    },
];

export default validateLineItems;
