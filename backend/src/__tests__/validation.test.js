import request from 'supertest';
import express from 'express';
import { validateLogin, validateReservation, handleValidationErrors } from '../middlewares/validation.js';

// Test app setup
const createTestApp = (middleware) => {
    const app = express();
    app.use(express.json());
    app.post('/test', middleware, (req, res) => {
        res.json({ success: true });
    });
    
    // Error handler
    app.use((err, req, res, next) => {
        res.status(err.statusCode || 500).json({
            error: err.message,
            errors: err.errors
        });
    });
    
    return app;
};

describe('Validation Middleware', () => {
    describe('validateLogin', () => {
        const app = createTestApp(validateLogin);

        it('should pass validation with valid data', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    storeId: 'test-store',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should fail validation with missing storeId', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'storeId',
                    message: 'Store ID is required'
                })
            );
        });

        it('should fail validation with empty password', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    storeId: 'test-store',
                    password: ''
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'password',
                    message: 'Password cannot be empty'
                })
            );
        });

        it('should fail validation with storeId too long', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    storeId: 'a'.repeat(101), // 101 characters
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'storeId',
                    message: 'Store ID must be between 1 and 100 characters'
                })
            );
        });
    });

    describe('validateReservation', () => {
        const app = createTestApp(validateReservation);

        it('should pass validation with valid reservation data', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    customerName: 'John Doe',
                    customerPhone: '090-1234-5678',
                    reservationDate: '2024-12-25',
                    reservationTime: '19:30',
                    partySize: 4,
                    notes: 'Birthday celebration'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should fail validation with invalid phone number', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    customerName: 'John Doe',
                    customerPhone: 'invalid-phone',
                    reservationDate: '2024-12-25',
                    reservationTime: '19:30',
                    partySize: 4
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'customerPhone',
                    message: 'Invalid phone number format'
                })
            );
        });

        it('should fail validation with invalid time format', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    customerName: 'John Doe',
                    customerPhone: '090-1234-5678',
                    reservationDate: '2024-12-25',
                    reservationTime: '25:30', // Invalid time
                    partySize: 4
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'reservationTime',
                    message: 'Invalid time format (HH:MM)'
                })
            );
        });

        it('should fail validation with party size too large', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    customerName: 'John Doe',
                    customerPhone: '090-1234-5678',
                    reservationDate: '2024-12-25',
                    reservationTime: '19:30',
                    partySize: 100 // Too large
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'partySize',
                    message: 'Party size must be between 1 and 50'
                })
            );
        });

        it('should fail validation with notes too long', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    customerName: 'John Doe',
                    customerPhone: '090-1234-5678',
                    reservationDate: '2024-12-25',
                    reservationTime: '19:30',
                    partySize: 4,
                    notes: 'a'.repeat(501) // Too long
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'notes',
                    message: 'Notes cannot exceed 500 characters'
                })
            );
        });
    });
});