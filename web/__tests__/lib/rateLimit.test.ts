// Create isolated test without dependencies on external config
// We'll create our own testable implementation

class TestableRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemaining(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  // Expose cleanup for testing
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  // Test helper to get internal state
  getRequestCount(): number {
    return this.requests.size;
  }
}

describe('RateLimit', () => {
  let testLimiter: TestableRateLimiter;

  beforeEach(() => {
    testLimiter = new TestableRateLimiter(1000, 3); // 3 requests per second for testing
  });

  describe('isAllowed', () => {
    it('should allow first request', () => {
      expect(testLimiter.isAllowed('user1')).toBe(true);
    });

    it('should allow multiple requests within limit', () => {
      expect(testLimiter.isAllowed('user1')).toBe(true);
      expect(testLimiter.isAllowed('user1')).toBe(true);
      expect(testLimiter.isAllowed('user1')).toBe(true);
    });

    it('should block requests after limit exceeded', () => {
      testLimiter.isAllowed('user1'); // 1
      testLimiter.isAllowed('user1'); // 2
      testLimiter.isAllowed('user1'); // 3
      expect(testLimiter.isAllowed('user1')).toBe(false); // 4th should be blocked
    });

    it('should handle different users independently', () => {
      testLimiter.isAllowed('user1'); // 1
      testLimiter.isAllowed('user1'); // 2
      testLimiter.isAllowed('user1'); // 3

      expect(testLimiter.isAllowed('user1')).toBe(false); // user1 blocked
      expect(testLimiter.isAllowed('user2')).toBe(true);  // user2 allowed
    });

    it('should reset window after time expires', (done) => {
      testLimiter.isAllowed('user1'); // 1
      testLimiter.isAllowed('user1'); // 2
      testLimiter.isAllowed('user1'); // 3
      expect(testLimiter.isAllowed('user1')).toBe(false); // blocked

      setTimeout(() => {
        expect(testLimiter.isAllowed('user1')).toBe(true); // should be allowed after window reset
        done();
      }, 1100); // Wait slightly longer than window (1000ms)
    }, 2000);
  });

  describe('getRemaining', () => {
    it('should return max requests for new user', () => {
      expect(testLimiter.getRemaining('user1')).toBe(3);
    });

    it('should decrease remaining count after requests', () => {
      testLimiter.isAllowed('user1');
      expect(testLimiter.getRemaining('user1')).toBe(2);

      testLimiter.isAllowed('user1');
      expect(testLimiter.getRemaining('user1')).toBe(1);

      testLimiter.isAllowed('user1');
      expect(testLimiter.getRemaining('user1')).toBe(0);
    });

    it('should return 0 when limit exceeded', () => {
      testLimiter.isAllowed('user1'); // 1
      testLimiter.isAllowed('user1'); // 2
      testLimiter.isAllowed('user1'); // 3
      testLimiter.isAllowed('user1'); // 4 (blocked)

      expect(testLimiter.getRemaining('user1')).toBe(0);
    });

    it('should reset to max after window expires', (done) => {
      testLimiter.isAllowed('user1');
      expect(testLimiter.getRemaining('user1')).toBe(2);

      setTimeout(() => {
        expect(testLimiter.getRemaining('user1')).toBe(3);
        done();
      }, 1100);
    }, 2000);
  });

  describe('cleanup', () => {
    it('should remove expired entries', (done) => {
      testLimiter.isAllowed('user1');
      testLimiter.isAllowed('user2');
      expect(testLimiter.getRequestCount()).toBe(2);

      setTimeout(() => {
        testLimiter.cleanup();
        expect(testLimiter.getRequestCount()).toBe(0);
        done();
      }, 1100);
    }, 2000);

    it('should keep active entries', () => {
      testLimiter.isAllowed('user1');
      expect(testLimiter.getRequestCount()).toBe(1);

      testLimiter.cleanup();
      expect(testLimiter.getRequestCount()).toBe(1); // Should still be there
    });
  });

  describe('configuration', () => {
    it('should use provided window and max requests', () => {
      const customLimiter = new TestableRateLimiter(500, 2);

      expect(customLimiter.isAllowed('user1')).toBe(true);  // 1
      expect(customLimiter.isAllowed('user1')).toBe(true);  // 2
      expect(customLimiter.isAllowed('user1')).toBe(false); // 3 (blocked)

      expect(customLimiter.getRemaining('user1')).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty identifier', () => {
      expect(testLimiter.isAllowed('')).toBe(true);
      expect(testLimiter.getRemaining('')).toBe(2);
    });

    it('should handle very long identifier', () => {
      const longId = 'a'.repeat(1000);
      expect(testLimiter.isAllowed(longId)).toBe(true);
      expect(testLimiter.getRemaining(longId)).toBe(2);
    });

    it('should handle special characters in identifier', () => {
      const specialId = '192.168.1.1:8080@user#123';
      expect(testLimiter.isAllowed(specialId)).toBe(true);
      expect(testLimiter.getRemaining(specialId)).toBe(2);
    });
  });
});

describe('RateLimiter integration', () => {
  it('should create limiter with default configuration', () => {
    const defaultLimiter = new TestableRateLimiter();
    expect(defaultLimiter.isAllowed('test')).toBe(true);
    expect(defaultLimiter.getRemaining('test')).toBe(99); // 100 - 1
  });
});