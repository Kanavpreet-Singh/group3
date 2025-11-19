/**
 * White Box Testing - Testing Actual Backend Function
 * Tests internal logic of the authentication middleware
 */

const jwt = require('jsonwebtoken');

// Import the actual authentication middleware from backend
const userAuth = require('../../middleware/authentication/user');

// WHITE BOX TEST - Testing Real Backend Function
describe('White Box Testing - Authentication Middleware', () => {
  const TEST_JWT_SECRET = 'test_secret_for_testing';
  
  beforeAll(() => {
    // Set test environment variable
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  describe('userAuth middleware - Internal Logic Testing', () => {
    let req, res, next;

    beforeEach(() => {
      // Mock Express request, response, next objects
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should return 401 when no token provided (missing header path)', () => {
      // Test the internal condition: if (!token)
      req.headers = {}; // No token header
      
      userAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not signed in" });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when token is null (null check path)', () => {
      // Test the internal condition: if (!token)
      req.headers.token = null;
      
      userAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not signed in" });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token (catch block path)', () => {
      // Test the internal try-catch logic with invalid token
      req.headers.token = 'invalid_token_string';
      
      userAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not signed in" });
      expect(next).not.toHaveBeenCalled();
    });

    test('should set req.user and call next for valid token (success path)', () => {
      // Test the internal successful verification path
      const userData = { id: 1, name: 'John Doe', role: 'student' };
      const validToken = jwt.sign(userData, TEST_JWT_SECRET, { expiresIn: '1d' });
      
      req.headers.token = validToken;
      
      userAuth(req, res, next);
      
      // Verify the internal logic worked correctly
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userData.id);
      expect(req.user.name).toBe(userData.name);
      expect(req.user.role).toBe(userData.role);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle expired token (JWT verification failure path)', () => {
      // Test internal JWT verification with expired token
      const userData = { id: 1, name: 'John Doe', role: 'student' };
      const expiredToken = jwt.sign(userData, TEST_JWT_SECRET, { expiresIn: '-1s' });
      
      req.headers.token = expiredToken;
      
      userAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not signed in" });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle malformed token (internal JWT decode error)', () => {
      // Test internal error handling for malformed token
      req.headers.token = 'malformed.token.here';
      
      userAuth(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not signed in" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Internal Logic Flow Analysis', () => {
    test('should test complete middleware execution flow', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Test the complete internal flow:
      // 1. Check for token presence
      // 2. Try JWT verification  
      // 3. Handle success/error paths

      userAuth(req, res, next);

      // Verify the middleware followed the correct internal path
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not signed in" });
      
      // Verify the middleware stopped execution (didn't call next)
      expect(next).not.toHaveBeenCalled();
    });
  });
});
