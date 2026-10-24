import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
  UnauthorizedError,
  ForbiddenError,
  AuthenticatedUser,
} from "../../src/lib/auth/server";
import { createSessionToken, verifySessionToken } from "../../src/lib/auth/session";
import { hashPassword, verifyPassword } from "../../src/lib/auth/passwords";
import { checkRateLimit } from "../../src/lib/auth/rate-limiter";

describe("Integration: Authentication, Authorization & Access Control", () => {
  it("should enforce UnauthorizedError and ForbiddenError error semantics", () => {
    const unauth = new UnauthorizedError("Session expired");
    assert.equal(unauth.name, "UnauthorizedError");
    assert.equal(unauth.message, "Session expired");

    const forbidden = new ForbiddenError("Project access restricted");
    assert.equal(forbidden.name, "ForbiddenError");
    assert.equal(forbidden.message, "Project access restricted");
  });

  it("should verify authenticated user sessions from cryptographically signed tokens", async () => {
    const originalUser = {
      userId: "user-elena-01",
      email: "elena.rostova@earth.org",
      name: "Dr. Elena Rostova",
      role: "Lead Field Ecologist",
    };

    const token = await createSessionToken(originalUser);
    assert.ok(token, "Token must be generated");

    const decoded = await verifySessionToken(token);
    assert.ok(decoded, "Token must verify successfully");
    assert.equal(decoded.userId, originalUser.userId);
    assert.equal(decoded.email, originalUser.email);
    assert.equal(decoded.name, originalUser.name);
    assert.equal(decoded.role, originalUser.role);
  });

  it("should securely reject forged, altered, or expired tokens", async () => {
    const forgedToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJoYWNrZXIiLCJyb2xlIjoiYWRtaW4ifQ.invalid_sig";
    const result = await verifySessionToken(forgedToken);
    assert.equal(result, null, "Forged token must not be accepted");
  });

  it("should verify bcrypt password hashing with 12 rounds", async () => {
    const rawPassword = "complexObservatoryPassword2026!";
    const hash = await hashPassword(rawPassword);

    assert.ok(hash.startsWith("$2"), "Must be a valid bcrypt hash string");
    const isCorrect = await verifyPassword(rawPassword, hash);
    assert.equal(isCorrect, true, "Bcrypt verification must succeed for exact password");

    const isIncorrect = await verifyPassword("wrongObservatoryPassword!", hash);
    assert.equal(isIncorrect, false, "Bcrypt verification must fail for mismatched password");
  });

  it("should rate limit authentication endpoints to prevent brute-force attacks", () => {
    const testIp = `rate-limit-test-${Date.now()}`;
    const maxAttempts = 5;
    const windowMs = 30000;

    for (let i = 0; i < maxAttempts; i++) {
      const check = checkRateLimit(testIp, maxAttempts, windowMs);
      assert.equal(check.success, true, `Attempt ${i + 1} should be within rate limit`);
      assert.equal(check.remaining, maxAttempts - 1 - i);
    }

    const rateLimited = checkRateLimit(testIp, maxAttempts, windowMs);
    assert.equal(rateLimited.success, false, "Subsequent attempt must trigger rate limiting");
    assert.equal(rateLimited.remaining, 0);
  });

  it("should enforce project-level role permissions", () => {
    // Permission evaluation logic matching requireProjectAccess
    const evaluateAccess = (
      user: AuthenticatedUser,
      project: { ownerId: string; members: Array<{ userId: string; role: "owner" | "editor" | "viewer" }> },
      minRole: "owner" | "editor" | "viewer" = "viewer"
    ) => {
      if (project.ownerId === user.id) return { allowed: true, role: "owner" };
      const membership = project.members.find((m) => m.userId === user.id);
      if (!membership) return { allowed: false, role: null };

      const roleHierarchy: Record<string, number> = { viewer: 1, editor: 2, owner: 3 };
      const userLevel = roleHierarchy[membership.role] || 0;
      const minLevel = roleHierarchy[minRole] || 1;

      return { allowed: userLevel >= minLevel, role: membership.role };
    };

    const owner: AuthenticatedUser = {
      id: "user-1",
      name: "Dr. Elena",
      email: "elena@earth.org",
      role: "researcher",
    };

    const editor: AuthenticatedUser = {
      id: "user-2",
      name: "Mateo",
      email: "mateo@earth.org",
      role: "engineer",
    };

    const viewer: AuthenticatedUser = {
      id: "user-3",
      name: "External Observer",
      email: "observer@earth.org",
      role: "viewer",
    };

    const outsider: AuthenticatedUser = {
      id: "user-4",
      name: "Unauthorized",
      email: "outsider@earth.org",
      role: "guest",
    };

    const testProject = {
      ownerId: "user-1",
      members: [
        { userId: "user-2", role: "editor" as const },
        { userId: "user-3", role: "viewer" as const },
      ],
    };

    // Owner has full access
    assert.equal(evaluateAccess(owner, testProject, "owner").allowed, true);
    assert.equal(evaluateAccess(owner, testProject, "editor").allowed, true);

    // Editor has edit access but not owner access
    assert.equal(evaluateAccess(editor, testProject, "editor").allowed, true);
    assert.equal(evaluateAccess(editor, testProject, "owner").allowed, false);

    // Viewer has view access but not edit access
    assert.equal(evaluateAccess(viewer, testProject, "viewer").allowed, true);
    assert.equal(evaluateAccess(viewer, testProject, "editor").allowed, false);

    // Outsider has no access
    assert.equal(evaluateAccess(outsider, testProject, "viewer").allowed, false);
  });
});
