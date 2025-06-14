import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// ログディレクトリの作成
import fs from 'fs';
import path from 'path';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { 
        service: 'kanpai-backend',
        environment: process.env.NODE_ENV,
        pid: process.pid
    },
    transports: [
        // Write errors to error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 10,
            handleExceptions: true,
            handleRejections: true
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10
        }),
        // 本番環境での重要なログのみを別ファイルに
        new winston.transports.File({
            filename: path.join(logDir, 'security.log'),
            level: 'warn',
            maxsize: 10485760, // 10MB
            maxFiles: 20
        })
    ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

export default logger;