import { Request, Response } from 'express';
import { startSession, validateSession, destroySession } from './sessionController';

export class AuthController {
  /**
   * Handle user login with session-based authentication
   */
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Simulate user validation (in real app, this would check database)
      const user = await this.validateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session for authenticated user
      const sessionId = await startSession(user.id, req);
      
      // Set session cookie
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Handle user logout
   */
  async logout(req: Request, res: Response) {
    try {
      const sessionId = req.cookies.sessionId;
      
      if (sessionId) {
        await destroySession(sessionId);
      }

      res.clearCookie('sessionId');
      return res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const sessionId = req.cookies.sessionId;
      
      if (!sessionId) {
        return res.status(401).json({ error: 'No session found' });
      }

      const session = await validateSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      const user = await this.getUserById(session.userId);
      
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Validate user credentials (mock implementation)
   */
  private async validateUser(username: string, password: string) {
    // Mock user database
    const users = [
      { id: 1, username: 'alice', password: 'alice123', email: 'alice@example.com' },
      { id: 2, username: 'bob', password: 'bob456', email: 'bob@example.com' },
      { id: 3, username: 'carol', password: 'carol789', email: 'carol@example.com' }
    ];

    return users.find(user => user.username === username && user.password === password);
  }

  /**
   * Get user by ID (mock implementation)
   */
  private async getUserById(userId: number) {
    const users = [
      { id: 1, username: 'alice', email: 'alice@example.com' },
      { id: 2, username: 'bob', email: 'bob@example.com' },
      { id: 3, username: 'carol', email: 'carol@example.com' }
    ];

    return users.find(user => user.id === userId);
  }
}
