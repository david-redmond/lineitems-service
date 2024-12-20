// src/app.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import lineItemsRouter from './routes/lineItems';
import { logger, morganMiddleware } from './middleware/logger'; // Import logger and morgan middleware

// Initialize environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());

// Integrate Morgan middleware for HTTP request logging
app.use(morganMiddleware);

// Routes
app.use('/line-items', lineItemsRouter);

// Root Route
app.get('/', (req: Request, res: Response) => {
    res.send('LineItem Microservice is running.');
});

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Unhandled Error: ${err.stack}`);
    res.status(500).json({ message: 'Internal Server Error.' });
});

// Connect to MongoDB and Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        logger.info('Connected to MongoDB.');
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}.`);
        });
    })
    .catch((err) => {
        logger.error(`Failed to connect to MongoDB: ${err}`);
        process.exit(1);
    });

export default app;
