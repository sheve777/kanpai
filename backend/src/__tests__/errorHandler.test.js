import { AppError, ValidationError, AuthenticationError, catchAsync } from '../middlewares/errorHandler.js';

describe('Error Classes', () => {
    describe('AppError', () => {
        it('should create an AppError with correct properties', () => {
            const error = new AppError('Test error', 400);
            
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.status).toBe('fail');
            expect(error.isOperational).toBe(true);
        });

        it('should set status to "error" for 5xx status codes', () => {
            const error = new AppError('Server error', 500);
            
            expect(error.status).toBe('error');
        });
    });

    describe('ValidationError', () => {
        it('should create a ValidationError with 400 status code', () => {
            const errors = [{ field: 'email', message: 'Invalid email' }];
            const error = new ValidationError('Validation failed', errors);
            
            expect(error.statusCode).toBe(400);
            expect(error.errors).toEqual(errors);
        });
    });

    describe('AuthenticationError', () => {
        it('should create an AuthenticationError with 401 status code', () => {
            const error = new AuthenticationError();
            
            expect(error.statusCode).toBe(401);
            expect(error.message).toBe('Authentication required');
        });

        it('should accept custom message', () => {
            const error = new AuthenticationError('Custom auth error');
            
            expect(error.message).toBe('Custom auth error');
        });
    });
});

describe('catchAsync', () => {
    it('should catch async errors and pass to next', async () => {
        const asyncFn = async () => {
            throw new Error('Async error');
        };

        const wrappedFn = catchAsync(asyncFn);
        const mockNext = jest.fn();

        await wrappedFn({}, {}, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect(mockNext.mock.calls[0][0].message).toBe('Async error');
    });

    it('should not call next if no error occurs', async () => {
        const asyncFn = async (req, res) => {
            res.json({ success: true });
        };

        const wrappedFn = catchAsync(asyncFn);
        const mockNext = jest.fn();
        const mockRes = { json: jest.fn() };

        await wrappedFn({}, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
});