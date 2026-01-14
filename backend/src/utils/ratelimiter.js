class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  canMakeRequest(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const timestamps = this.requests.get(key);
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const resetTime = oldestTimestamp + windowMs;
      return {
        allowed: false,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return {
      allowed: true,
      remaining: maxRequests - validTimestamps.length
    };
  }

  reset(key) {
    this.requests.delete(key);
  }
}

export default new RateLimiter();