import { AuthController } from '../src/controllers/authController';
import { startSession, validateSession, destroySession } from '../src/controllers/sessionController';

// Mock Express request and response objects
const mockRequest = (overrides = {}) => ({
  body: {},
  cookies: {},
  ip: '127.0.0.1',
  connection: { remoteAddress: '127.0.0.1' },
  get: jest.fn(),
  ...overrides
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Service Session Tests', () => {
  let authController: AuthController;

  beforeEach(() => {
    authController = new AuthController();
    jest.clearAllMocks();
  });

  describe('Session Management', () => {
    it('should create a new session on login', async () => {
      const req = mockRequest({
        body: { username: 'alice', password: 'alice123' }
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).not.toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          user: expect.objectContaining({
            username: 'alice'
          })
        })
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'sessionId',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true
        })
      );
    });

    it('should reject invalid credentials', async () => {
      const req = mockRequest({
        body: { username: 'invalid', password: 'wrong' }
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    it('should validate session correctly', async () => {
      // Create a session first
      const sessionId = await startSession(1, mockRequest());
      
      // Validate the session
      const session = await validateSession(sessionId);
      
      expect(session).toBeTruthy();
      expect(session?.userId).toBe(1);
    });

    it('should destroy session on logout', async () => {
      const sessionId = await startSession(1, mockRequest());
      const req = mockRequest({
        cookies: { sessionId }
      });
      const res = mockResponse();

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Logout successful'
      });
      expect(res.clearCookie).toHaveBeenCalledWith('sessionId');

      // Verify session is destroyed
      const session = await validateSession(sessionId);
      expect(session).toBeNull();
    });

    it('should return user profile for valid session', async () => {
      const sessionId = await startSession(1, mockRequest());
      const req = mockRequest({
        cookies: { sessionId }
      });
      const res = mockResponse();

      await authController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 1,
          username: 'alice'
        })
      });
    });

    it('should reject profile request without session', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No session found'
      });
    });
  });

  describe('Session Controller Tests', () => {
    it('should generate unique session IDs', async () => {
      const sessionId1 = await startSession(1, mockRequest());
      const sessionId2 = await startSession(2, mockRequest());

      expect(sessionId1).not.toBe(sessionId2);
      expect(sessionId1).toMatch(/^sess_/);
      expect(sessionId2).toMatch(/^sess_/);
    });

    it('should handle session expiration', async () => {
      // This is a simplified test - in real scenario we'd mock Date
      const sessionId = await startSession(1, mockRequest());
      
      // Session should be valid immediately
      let session = await validateSession(sessionId);
      expect(session).toBeTruthy();

      // Manually destroy to simulate expiration
      await destroySession(sessionId);
      session = await validateSession(sessionId);
      expect(session).toBeNull();
    });

    it('should handle multiple sessions per user', async () => {
      const userId = 1;
      const sessionId1 = await startSession(userId, mockRequest());
      const sessionId2 = await startSession(userId, mockRequest());

      const session1 = await validateSession(sessionId1);
      const session2 = await validateSession(sessionId2);

      expect(session1?.userId).toBe(userId);
      expect(session2?.userId).toBe(userId);
      expect(session1?.id).not.toBe(session2?.id);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing username or password', async () => {
      const req = mockRequest({
        body: { username: 'alice' } // missing password
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username and password are required'
      });
    });

    it('should handle invalid session ID', async () => {
      const session = await validateSession('invalid-session-id');
      expect(session).toBeNull();
    });
  });
});
