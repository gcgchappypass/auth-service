/* ──────────────────────────────────────────────────────────────── */
/*  场景 1： 当前待 Review 的 Pull Requests 列表数据                                  */
/*  GET /github/request-reviews                       */
/* ──────────────────────────────────────────────────────────────── */
app.get('/github/request-reviews', (_q, res) => {
  console.log('Getting request reviews');
  const prList = {
    total_count: 2,
    items: [
      {
        Id: '2456',
        CreatedBy: 'david_12345678',
        CreatedAt: '2025-03-10T09:15:00Z',
        LastModifiedAt: '2025-03-12T08:45:00Z',
        Url: 'https://github.com/gcgchappypass/auth-service/pull/2456',
        Title: 'Add token-based authentication',
        Description: 'Introduce JWT-based token login to replace session authentication.',
        State: 'Open',
        Labels: ['auth', 'enhancement'],
        Assignees: ['alice_99999999'],
        RepositoryName: 'auth-service',
        RepositoryURL: 'https://github.com/gcgchappypass/auth-service',
        CommitsCount: '5',
        FilesChangedCount: '4',
        MergeableState: 'Clean'
      },
      {
        Id: '2458',
        CreatedBy: 'carol_87654321',
        CreatedAt: '2025-03-11T12:05:00Z',
        LastModifiedAt: '2025-03-12T07:20:00Z',
        Url: 'https://github.com/gcgchappypass/data-pipeline/pull/2458',
        Title: 'Optimize DB query performance',
        Description: 'Refactor query logic and add indexes to reduce response time by 30%.',
        State: 'Open',
        Labels: ['performance', 'database'],
        Assignees: ['alice_99999999'],
        RepositoryName: 'data-pipeline',
        RepositoryURL: 'https://github.com/gcgchappypass/data-pipeline',
        CommitsCount: '1',
        FilesChangedCount: '3',
        MergeableState: 'Clean'
      }
    ]
  };

  res.json(prList);
});

/* ──────────────────────────────────────────────────────────────── */
/*  场景 2： PR 的 Commit 列表及每个 Commit 涉及的文件变更                                 */
/*  GET /github/commits-diff                     */
/* ──────────────────────────────────────────────────────────────── */
app.get('/github/commits-diff-initial', (_q, res) => {
  console.log('Getting initial commit diff data');

  const commitDiffData = {
    prId: '2456',
    repo: 'gcgchappypass/auth-service',
    commits: [
      {
        sha: 'abc123',
        message: 'feat: implement token-based auth',
        author: 'bob_12345678',
        committedAt: '2025-03-10T10:30:00Z',
        filesChanged: [
          {
            filename: 'src/controllers/authController.ts',
            status: 'modified',
            additions: 42,
            deletions: 15,
            changes: 57,
            patch: '...partial patch omitted...',
            summary: 'Added token-based login logic, replacing the old session login, calling generateToken and verifyToken for authentication.',
            codeSnippet: `
async function loginWithToken(req, res) {
  const token = req.headers['authorization'];
  try {
    const user = verifyToken(token);
    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}`
          },
          {
            filename: 'src/utils/tokenUtils.ts',
            status: 'added',
            additions: 78,
            deletions: 0,
            changes: 78,
            patch: '...added generateToken and verifyToken methods...',
            summary: 'Added utility methods for generating and verifying JWT tokens.',
            codeSnippet: `
import jwt from 'jsonwebtoken';

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}`
          },
          {
            filename: 'src/controllers/sessionController.ts',
            status: 'removed',
            additions: 0,
            deletions: 35,
            changes: 35,
            patch: '...removed session login logic...',
            summary: 'Removed the old session-based login logic to reduce redundant code.',
            codeSnippet: `// Session login related code removed`
          },
          {
            filename: 'package.json',
            status: 'modified',
            additions: 2,
            deletions: 0,
            changes: 2,
            patch: '...added jsonwebtoken dependency...',
            summary: 'Added the jsonwebtoken dependency to support JWT generation and verification.',
            codeSnippet: `
"dependencies": {
  "jsonwebtoken": "^9.0.0"
}`
          }
        ]
      },
      {
        sha: 'def456',
        message: 'test: add unit tests for auth service',
        author: 'bob_12345678',
        committedAt: '2025-03-11T14:10:00Z',
        filesChanged: [
          {
            filename: 'tests/authService.test.ts',
            status: 'added',
            additions: 95,
            deletions: 0,
            changes: 95,
            patch: '...covered token generation, verification, expiration and error handling...',
            summary: 'Added unit tests covering token generation, verification, expiration handling, and error throwing.',
            codeSnippet: `
describe('Auth Service Token Tests', () => {
  it('should generate a valid token', () => {
    const token = generateToken({ userId: 1 });
    expect(token).toBeDefined();
  });
  it('should throw on invalid token', () => {
    expect(() => verifyToken('invalid')).toThrow();
  });
});`
          }
        ]
      }
    ]
  };
  res.json(commitDiffData);
});

app.get('/github/commits-diff-latest', (_q, res) => {
  console.log('Getting latest commit diff data');

const latestCommitDiffData = {
  prId: '2456',
  repo: 'gcgchappypass/auth-service',
  commits: [
    {
      sha: 'ghi789',
      message: 'fix: handle token expiration and add fallback logic with logging and metrics',
      author: 'alice_dev',
      committedAt: '2025-03-12T09:00:00Z',
      filesChanged: [
        {
          filename: 'src/controllers/authController.ts',
          status: 'modified',
          additions: 14,
          deletions: 2,
          changes: 16,
          patch: '...added token expiration check, logging, and metrics tracking...',
          summary:
            'Improved error handling for token expiration by adding try-catch fallback, logging, and metrics tracking.',
          codeSnippet: `
async function loginWithToken(req, res) {
  const token = req.headers['authorization'];
  try {
    const user = verifyToken(token);
    return res.json({ user });  // 这里加 return
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.error('Token expired:', err);
      trackMetric('token_expired');

      try {
        const newToken = await refreshAuthToken(token);
        const user = verifyToken(newToken);
        return res.json({ user, tokenRefreshed: true });  // 加 return
      } catch (refreshErr) {
        console.error('Token refresh failed:', refreshErr);
        trackMetric('token_refresh_failed');
        return res.status(401).json({ error: 'Token expired and refresh failed' });
      }
    }

    console.error('Invalid token:', err);
    trackMetric('token_invalid');
    return res.status(401).json({ error: 'Invalid token' });  // 这里也加 return
  }
}
          `
        }
      ]
    }
  ]
};


  res.json(latestCommitDiffData);
});


/* ──────────────────────────────────────────────────────────────── */
/*  场景 3： 查询相关内容 的 Demo Response 示例                                */
/*  GET /github/related-discussions                     */
/* ──────────────────────────────────────────────────────────────── */
app.get('/github/related-discussions', (_q, res) => {
  console.log('Getting related GitHub discussions from Bob');
  res.json({
    total_count: 3,
    items: [
      {
        type: 'issue',
        title: 'Users unexpectedly logged out after inactivity',
        url: 'https://github.com/gcgchappypass/core-api/issues/234',
        commentSnippet: 'Root cause: the refresh token was silently expiring due to missing renewal logic in edge cases.',
        commentedAt: '2024-10-12T14:32:00Z',
        repository: 'core-api',
        createdBy: 'jane',
        commentBy: 'bob'
      },
      {
        type: 'pull_request',
        title: 'Fix silent logout by improving refresh token handling',
        url: 'https://github.com/gcgchappypass/core-api/pull/235',
        commentSnippet: 'Added fallback logic and manual verification for token expiration.',
        commentedAt: '2024-10-15T09:45:00Z',
        repository: 'core-api',
        createdBy: 'bob'
      },
      {
        type: 'wiki',
        title: 'Authentication Pitfalls and Best Practices',
        url: 'https://github.com/gcgchappypass/wiki/Authentication-Pitfalls',
        snippet: 'Ensure token validation happens both client-side and server-side. Be cautious with silent expiration behaviors.',
        updatedAt: '2024-10-20T08:00:00Z',
        repository: 'wiki',
        createdBy: 'bob'
      }
    ]
  });
});

/* ──────────────────────────────────────────────────────────────── */
/*  场景 4： 查询相关 PRs 的 Demo Response 示例                                */
/*  GET /github/commits-diff                     */
/* ──────────────────────────────────────────────────────────────── */
app.get('/github/generate-change-request-comment', (req, res) => {
  console.log('Generating change request review comment');

  const changeRequestComment = {
    reviewType: 'CHANGE_REQUESTED',
    comment: `Thanks for the update. However, it looks like Bob’s fix for token expiration hasn’t been addressed yet. The code still lacks explicit handling for expired tokens, which could lead to user login issues.

Also noticed from the code summary:
- The fallback behavior in case of token verification failure is still too generic.
- There’s no logging or metrics for token failures, which might make debugging harder.

Please address these before we proceed. Let me know if you have any questions.`,
    response: "The review was submitted successfully. You can view it at the link: https://github.com/acme-corp/project-x/pull/42#pullrequestreview-101"
  };

  res.json(changeRequestComment);
});

app.get('/github/generate-approve-comment', (req, res) => {
  console.log('Generating approval review comment');

  const approveComment = {
    reviewType: 'APPROVE',
    comment: `Looks good to me! The latest commit resolves the token expiration issue with proper fallback logic, error logging, and metrics tracking.

Great job improving reliability and observability. Approving the PR. 🚀`,
    response: "The review was submitted successfully. You can view it at the link: https://github.com/acme-corp/project-x/pull/42#pullrequestreview-102"
  };

  res.json(approveComment);
});
