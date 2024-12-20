// src/middleware/logger.ts

import { createLogger, format, transports } from 'winston';
import morgan from 'morgan';
import path from 'path';

// Define the log format
const logFormat = format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// Create Winston logger
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // Capture stack trace
        format.splat(),
        format.json(),
        logFormat
    ),
    transports: [
        // Console transport for development
        new transports.Console({
            format: format.combine(format.colorize(), logFormat),
        }),

        // File transport for error logs
        // new transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),

        // File transport for combined logs
        // new transports.File({ filename: path.join('logs', 'combined.log') }),
    ],
    exitOnError: false, // Do not exit on handled exceptions
});

// Define stream for Morgan to use Winston
const stream = {
    write: (message: string) => {
        // Remove the newline character at the end of the message
        logger.info(message.trim());
    },
};

// Setup Morgan middleware
const morganMiddleware = morgan('combined', { stream });

export { logger, morganMiddleware };
