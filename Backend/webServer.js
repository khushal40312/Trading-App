const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user.model");
const blacklistTokenModel = require("./models/blacklistToken.model");
const redisClient = require("./config/redisClient");

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 30,     // Max 30 messages per minute per user
  burstLimit: 10,      // Max 10 messages in 10 seconds (burst protection)
  burstWindowMs: 10 * 1000, // 10 seconds
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes if exceeded
};

class RateLimiter {
  constructor(config = RATE_LIMIT_CONFIG) {
    this.config = config;
  }

  async checkRateLimit(userId) {
    const now = Date.now();
    const windowKey = `rate_limit:${userId}:${Math.floor(now / this.config.windowMs)}`;
    const burstKey = `rate_limit_burst:${userId}:${Math.floor(now / this.config.burstWindowMs)}`;
    const blockKey = `rate_limit_block:${userId}`;

    // Check if user is currently blocked
    const isBlocked = await redisClient.get(blockKey);
    if (isBlocked) {
      const blockExpiry = parseInt(isBlocked);
      if (now < blockExpiry) {
        return {
          allowed: false,
          reason: "rate_limit_blocked",
          retryAfter: Math.ceil((blockExpiry - now) / 1000),
          message: `Too many requests. Try again in ${Math.ceil((blockExpiry - now) / 1000)} seconds.`
        };
      } else {
        // Block expired, clean it up
        await redisClient.del(blockKey);
      }
    }

    // Check burst limit (short-term)
    const burstCount = await redisClient.incr(burstKey);
    if (burstCount === 1) {
      await redisClient.expire(burstKey, Math.ceil(this.config.burstWindowMs / 1000));
    }

    if (burstCount > this.config.burstLimit) {
      // Block user for exceeding burst limit
      const blockUntil = now + this.config.blockDurationMs;
      await redisClient.setEx(blockKey, Math.ceil(this.config.blockDurationMs / 1000), blockUntil.toString());
      
      return {
        allowed: false,
        reason: "burst_limit_exceeded",
        retryAfter: Math.ceil(this.config.blockDurationMs / 1000),
        message: `Rate limit exceeded. Blocked for ${Math.ceil(this.config.blockDurationMs / 1000)} seconds.`
      };
    }

    // Check regular rate limit (longer-term)
    const requestCount = await redisClient.incr(windowKey);
    if (requestCount === 1) {
      await redisClient.expire(windowKey, Math.ceil(this.config.windowMs / 1000));
    }

    if (requestCount > this.config.maxRequests) {
      // Block user for exceeding regular limit
      const blockUntil = now + this.config.blockDurationMs;
      await redisClient.setEx(blockKey, Math.ceil(this.config.blockDurationMs / 1000), blockUntil.toString());
      
      return {
        allowed: false,
        reason: "rate_limit_exceeded",
        retryAfter: Math.ceil(this.config.blockDurationMs / 1000),
        message: `Rate limit exceeded. Blocked for ${Math.ceil(this.config.blockDurationMs / 1000)} seconds.`
      };
    }

    // Request allowed
    const remaining = Math.max(0, this.config.maxRequests - requestCount);
    const resetTime = Math.ceil(now / this.config.windowMs) * this.config.windowMs + this.config.windowMs;

    return {
      allowed: true,
      requestCount,
      remaining,
      resetTime,
      retryAfter: null
    };
  }

  async getRateLimitStatus(userId) {
    const now = Date.now();
    const windowKey = `rate_limit:${userId}:${Math.floor(now / this.config.windowMs)}`;
    const blockKey = `rate_limit_block:${userId}`;

    const requestCount = await redisClient.get(windowKey) || 0;
    const isBlocked = await redisClient.get(blockKey);
    
    return {
      requestCount: parseInt(requestCount),
      remaining: Math.max(0, this.config.maxRequests - parseInt(requestCount)),
      blocked: !!isBlocked,
      blockExpiresAt: isBlocked ? parseInt(isBlocked) : null
    };
  }
}

function initWSServer(server) {
  const wss = new WebSocket.Server({ server, path: "/ai" });
  const rateLimiter = new RateLimiter();

  wss.on("connection", (ws) => {
    // Track connection time for additional rate limiting context
    ws.connectedAt = Date.now();
    
    ws.on("message", async (raw) => {
      try {
        const { message, sessionId, token } = JSON.parse(raw);

        // --- 🔑 JWT AUTH ---
        if (!token) {
          ws.send(JSON.stringify({ event: "error", message: "Unauthorized: Token not provided" }));
          return ws.close();
        }

        // Remove "Bearer "
        const pureToken = token?.split(' ')[1].trim();

        // Check blacklist
        const isBlacklisted = await blacklistTokenModel.findOne({ token: pureToken });
        if (isBlacklisted) {
          ws.send(JSON.stringify({ event: "error", message: "Session expired, login again." }));
          return ws.close();
        }

        // Verify + decode
        let decoded;
        try {
          decoded = jwt.verify(pureToken, process.env.JWT_SECRET);
        } catch (err) {
          ws.send(JSON.stringify({ event: "error", message: "Invalid or expired token." }));
          return ws.close();
        }

        // Get user
        const user = await userModel.findById(decoded._id).populate("trades");
        if (!user) {
          ws.send(JSON.stringify({ event: "error", message: "User not found." }));
          return ws.close();
        }

        // ✅ Attach user to ws
        ws.user = user;

        // --- 🚦 RATE LIMITING ---
        const rateLimitResult = await rateLimiter.checkRateLimit(user._id.toString());
        
        if (!rateLimitResult.allowed) {
          ws.send(JSON.stringify({
            event: "rate_limit_exceeded",
            message: rateLimitResult.message,
            reason: rateLimitResult.reason,
            retryAfter: rateLimitResult.retryAfter,
            blocked: true
          }));
          
          // Log rate limit violation
          console.warn(`Rate limit exceeded for user ${user._id} (${user.email || 'unknown'}): ${rateLimitResult.reason}`);
          
          // Don't close connection, just reject this message
          return;
        }

      

        // --- SESSION MANAGEMENT ---
        let activeSessionId = sessionId;
        if (sessionId) {
          const exists = await redisClient.get(`session:${user.id}:${sessionId}`);
          if (exists) {
            await redisClient.expire(`session:${user.id}:${sessionId}`, 900);
          } else {
            activeSessionId = uuidv4();
            await redisClient.setEx(`session:${user.id}:${activeSessionId}`, 900, "active");
            ws.send(JSON.stringify({
              event: "session:new",
              sessionId: activeSessionId,
              notification: "Previous session expired, started new one."
            }));
          }
        } else {
          activeSessionId = uuidv4();
          await redisClient.setEx(`session:${user.id}:${activeSessionId}`, 900, "active");
          ws.send(JSON.stringify({
            event: "session:new",
            sessionId: activeSessionId,
            notification: "New session started."
          }));
        }

        // Show typing indicator
        ws.send(JSON.stringify({ event: "typing", status: true }));

        const { tradingAgent } = require("./agents/tradingAgent");
                
        const result = await tradingAgent.invoke({
          input: message,
          user,
          sessionId: activeSessionId,
          ws: ws
        });

        ws.send(JSON.stringify({
          event: "reply",
          reply: result.reply || "No response generated."
        }));

        ws.send(JSON.stringify({ event: "typing", status: false }));

      } catch (err) {
        console.error("WS Error:", err);
        ws.send(JSON.stringify({ event: "error", message: "Something went wrong." }));
      }
    });

    // Handle rate limit status requests
    ws.on("message", async (raw) => {
      try {
        const data = JSON.parse(raw);
        
        if (data.type === "get_rate_limit_status" && ws.user) {
          const status = await rateLimiter.getRateLimitStatus(ws.user._id.toString());
          ws.send(JSON.stringify({
            event: "rate_limit_status",
            ...status
          }));
        }
      } catch (err) {
        // Ignore parsing errors for rate limit status requests
      }
    });

    ws.on("close", () => {
      // console.log("❌ WebSocket disconnected");
    });

    
  });

  return wss;
}

module.exports = { initWSServer };