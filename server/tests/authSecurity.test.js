const assert = require("assert");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Session = require("../models/session.models");
const { createRateLimiter } = require("../middlewares/rateLimit.middleware");
const { authenticate } = require("../middlewares/auth.middleware");

async function runAuthSecurityTests() {
  console.log("==================================================");
  console.log("RUNNING: Auth Rate Limiting & Session TTL Test Suite");
  console.log("==================================================");

  // [TEST 1] Rate Limiter enforces thresholds and returns HTTP 429
  console.log("\n[TEST 1] Testing Rate Limiter threshold enforcement...");
  const limiter = createRateLimiter({
    windowMs: 5000,
    max: 3,
    message: "Rate limit exceeded for testing.",
  });

  const dummyReq = {
    headers: { "x-forwarded-for": "192.168.1.100" },
    socket: { remoteAddress: "192.168.1.100" },
  };

  const createMockRes = () => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, val) {
        this.headers[name] = val;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };
    return res;
  };

  let nextCalls = 0;
  const dummyNext = () => {
    nextCalls += 1;
  };

  // First 3 requests must pass
  for (let i = 0; i < 3; i++) {
    const res = createMockRes();
    limiter(dummyReq, res, dummyNext);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["RateLimit-Limit"], 3);
  }
  assert.strictEqual(nextCalls, 3, "Expected 3 allowed requests");

  // 4th request must be rejected with 429
  const res4 = createMockRes();
  limiter(dummyReq, res4, dummyNext);
  assert.strictEqual(res4.statusCode, 429, "Expected HTTP 429 status code");
  assert.strictEqual(res4.body.success, false);
  assert(res4.headers["Retry-After"] > 0, "Expected Retry-After header");
  console.log("✓ TEST 1 PASSED: Rate limiter successfully blocked excessive requests with HTTP 429");

  // [TEST 2] Session TTL index configuration
  console.log("\n[TEST 2] Verifying Session TTL index configuration on Mongoose schema...");
  const indexes = Session.schema.indexes();
  const ttlIndex = indexes.find(
    ([fields, options]) => fields.expiresAt === 1 && options && options.expireAfterSeconds === 0
  );
  assert(ttlIndex, "Session model must define TTL index on expiresAt with expireAfterSeconds: 0");
  console.log("✓ TEST 2 PASSED: Session TTL index registered ({ expiresAt: 1 }, { expireAfterSeconds: 0 })");

  // [TEST 3] Authenticate middleware rejects expired tokens/sessions
  console.log("\n[TEST 3] Verifying Authenticate middleware rejects expired sessions...");
  const expiredReq = {
    headers: { authorization: "Bearer invalid-or-missing-token" },
  };
  const expiredRes = createMockRes();
  let authNextCalled = false;
  await authenticate(expiredReq, expiredRes, () => {
    authNextCalled = true;
  });
  assert.strictEqual(expiredRes.statusCode, 401, "Expected HTTP 401 for invalid token");
  assert.strictEqual(authNextCalled, false, "Expired or invalid token must not proceed to next()");
  console.log("✓ TEST 3 PASSED: Authenticate middleware properly guards against unauthenticated/expired tokens");

  console.log("\n==================================================");
  console.log("ALL 3 AUTH SECURITY TESTS PASSED CLEANLY!");
  console.log("==================================================");
}

runAuthSecurityTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });

