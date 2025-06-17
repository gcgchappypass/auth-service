import { Request, Response } from 'express';
import { generateToken, verifyToken } from '../utils/tokenUtils';

export class AuthController {
  /**
   * Handle user login with token-based authentication
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

      // Generate JWT token for authenticated user
      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
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
      // With token-based auth, logout is typically handled client-side
      // by removing the token from storage
      return res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get current user profile using token authentication
   */
  async getProfile(req: Request, res: Response) {
    try {
      const token = req.headers['authorization'];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = verifyToken(token) as any;
      
      return res.json({
        user: {
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email
        }
      });
    } catch (error) {
      console.error('Profile error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  /**
   * Handle token-based authentication (from commit example)
   */
  async loginWithToken(req: Request, res: Response) {
    const token = req.headers['authorization'];
    try {
      const user = verifyToken(token!);
      return res.json({ user });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
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
