import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../../src/lib/auth/passwords";
import { createSessionToken, verifySessionToken } from "../../src/lib/auth/session";
import { checkRateLimit } from "../../src/lib/auth/rate-limiter";

describe("Authentication & Session Logic", () => {
  describe("Password Hashing (bcryptjs)", () => {
    it("should hash a raw password with salt factor 12", async () => {
      const raw = "telemetry_access_key_99";
      const hash = await hashPassword(raw);
      assert.ok(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$"), "Hash should reflect bcrypt 12 salt rounds");
    });

    it("should correctly verify matching and mismatched passwords", async () => {
      const password = "mySecurePassword123!";
      const hash = await hashPassword(password);

      const match = await verifyPassword(password, hash);
      assert.equal(match, true, "Valid password must verify successfully");

      const wrongMatch = await verifyPassword("wrongPassword", hash);
      assert.equal(wrongMatch, false, "Invalid password must be rejected");
    });
  });

  describe("Session JWT Tokens (jose)", () => {
    it("should generate and verify HS256 JWT session tokens", async () => {
      const user = {
        userId: "user-test-01",
        email: "elena.rostova@earth.org",
        name: "Dr. Elena Rostova",
        role: "Lead Field Ecologist",
      };

      const token = await createSessionToken(user);
      assert.ok(typeof token === "string");
      assert.equal(token.split(".").length, 3, "JWT must consist of header, payload, and signature");

      const verified = await verifySessionToken(token);
      assert.ok(verified !== null);
      assert.equal(verified.userId, user.userId);
      assert.equal(verified.email, user.email);
      assert.equal(verified.name, user.name);
      assert.equal(verified.role, user.role);
    });

    it("should reject tampered or invalid JWT tokens", async () => {
      const tampered = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered_signature";
      const verified = await verifySessionToken(tampered);
      assert.equal(verified, null, "Tampered JWT should verify as null");
    });
  });

  describe("Rate Limiting", () => {
    it("should allow calls under limit and block excessive calls", () => {
      const ip = `test-ip-${Date.now()}`;
      const limit = 3;
      const windowMs = 5000;

      for (let i = 0; i < limit; i++) {
        const res = checkRateLimit(ip, limit, windowMs);
        assert.equal(res.success, true);
        assert.equal(res.remaining, limit - 1 - i);
      }

      // Limit exceeded
      const blocked = checkRateLimit(ip, limit, windowMs);
      assert.equal(blocked.success, false);
      assert.equal(blocked.remaining, 0);
    });
  });
});
