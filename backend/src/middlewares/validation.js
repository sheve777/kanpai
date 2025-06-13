import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from './errorHandler.js';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));
        
        throw new ValidationError('Validation failed', errorMessages);
    }
    next();
};

// Common validation rules
export const validateStoreId = [
    param('storeId')
        .isUUID()
        .withMessage('Store ID must be a valid UUID'),
    handleValidationErrors
];

export const validateLogin = [
    body('storeId')
        .notEmpty()
        .withMessage('Store ID is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Store ID must be between 1 and 100 characters'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 1 })
        .withMessage('Password cannot be empty'),
    handleValidationErrors
];

export const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    handleValidationErrors
];

export const validateReservation = [
    body('customerName')
        .notEmpty()
        .withMessage('Customer name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Customer name must be between 1 and 100 characters'),
    body('customerPhone')
        .notEmpty()
        .withMessage('Customer phone is required')
        .matches(/^[\d\-\+\(\)\s]+$/)
        .withMessage('Invalid phone number format'),
    body('reservationDate')
        .isISO8601()
        .withMessage('Invalid date format'),
    body('reservationTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Invalid time format (HH:MM)'),
    body('partySize')
        .isInt({ min: 1, max: 50 })
        .withMessage('Party size must be between 1 and 50'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors
];

export const validateMenu = [
    body('name')
        .notEmpty()
        .withMessage('Menu name is required')
        .isLength({ min: 1, max: 200 })
        .withMessage('Menu name must be between 1 and 200 characters'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Category must be between 1 and 100 characters'),
    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),
    handleValidationErrors
];

export const validateLineBroadcast = [
    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Message must be between 1 and 5000 characters'),
    body('imageUrl')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL'),
    body('scheduledAt')
        .optional()
        .isISO8601()
        .withMessage('Invalid scheduled date format'),
    handleValidationErrors
];

export const validateChatMessage = [
    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message must be between 1 and 2000 characters'),
    body('sessionId')
        .optional()
        .isUUID()
        .withMessage('Session ID must be a valid UUID'),
    handleValidationErrors
];

export const validateReport = [
    body('reportMonth')
        .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
        .withMessage('Report month must be in YYYY-MM format'),
    body('planType')
        .isIn(['entry', 'standard', 'pro'])
        .withMessage('Plan type must be entry, standard, or pro'),
    handleValidationErrors
];

export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

export const validateDateRange = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be in ISO8601 format'),
    handleValidationErrors
];

// Custom validator for store existence
export const validateStoreExists = async (req, res, next) => {
    try {
        const { storeId } = req.params;
        
        // This would typically check the database
        // For now, we'll assume the store exists if storeId is provided
        if (!storeId) {
            throw new ValidationError('Store ID is required');
        }
        
        // Add store info to request for later use
        req.store = { id: storeId };
        next();
    } catch (error) {
        next(error);
    }
};