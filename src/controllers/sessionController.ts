import { Request } from 'express';

interface Session {
  id: string;
  userId: number;
  createdAt: Date;
  lastAccessed: Date;
  ipAddress: string;
  userAgent: string;
}

// In-memory session store (in production, this would be Redis or a database)
const sessions: Map<string, Session> = new Map();

/**
 * Start a new session for authenticated user
 */
export async function startSession(userId: number, req: Request): Promise<string> {
  const sessionId = generateSessionId();
  const now = new Date();
  
  const session: Session = {
    id: sessionId,
    userId,
    createdAt: now,
    lastAccessed: now,
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown'
  };

  sessions.set(sessionId, session);
  
  // Clean up expired sessions
  cleanupExpiredSessions();
  
  console.log(`Session started for user ${userId}: ${sessionId}`);
  return sessionId;
}

/**
 * Validate an existing session
 */
export async function validateSession(sessionId: string): Promise<Session | null> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if session is expired (24 hours)
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const now = new Date();
  
  if (now.getTime() - session.lastAccessed.getTime() > expirationTime) {
    sessions.delete(sessionId);
    console.log(`Session expired and removed: ${sessionId}`);
    return null;
  }

  // Update last accessed time
  session.lastAccessed = now;
  sessions.set(sessionId, session);
  
  return session;
}

/**
 * Destroy a session (logout)
 */
export async function destroySession(sessionId: string): Promise<boolean> {
  const existed = sessions.has(sessionId);
  sessions.delete(sessionId);
  
  if (existed) {
    console.log(`Session destroyed: ${sessionId}`);
  }
  
  return existed;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: number): Promise<Session[]> {
  const userSessions: Session[] = [];
  
  for (const session of sessions.values()) {
    if (session.userId === userId) {
      userSessions.push(session);
    }
  }
  
  return userSessions;
}

/**
 * Destroy all sessions for a user
 */
export async function destroyUserSessions(userId: number): Promise<number> {
  let destroyedCount = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(sessionId);
      destroyedCount++;
    }
  }
  
  console.log(`Destroyed ${destroyedCount} sessions for user ${userId}`);
  return destroyedCount;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `sess_${timestamp}_${randomPart}`;
}

/**
 * Clean up expired sessions periodically
 */
function cleanupExpiredSessions(): void {
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
  const now = new Date();
  let cleanedCount = 0;

  for (const [sessionId, session] of sessions.entries()) {
    if (now.getTime() - session.lastAccessed.getTime() > expirationTime) {
      sessions.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired sessions`);
  }
}

/**
 * Get session statistics
 */
export function getSessionStats(): { totalSessions: number; activeSessions: number } {
  const totalSessions = sessions.size;
  const expirationTime = 24 * 60 * 60 * 1000;
  const now = new Date();
  
  let activeSessions = 0;
  for (const session of sessions.values()) {
    if (now.getTime() - session.lastAccessed.getTime() <= expirationTime) {
      activeSessions++;
    }
  }

  return { totalSessions, activeSessions };
}
