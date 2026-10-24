import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { loginSchema, signupSchema, forgotPasswordSchema } from "../../src/lib/validations/auth";
import { createProjectSchema, updateProjectSchema } from "../../src/lib/validations/project";
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from "../../src/lib/validations/task";
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema } from "../../src/lib/validations/column";
import { createNoteSchema, updateNoteSchema } from "../../src/lib/validations/note";
import { createDiagramSchema, updateDiagramSchema } from "../../src/lib/validations/diagram";
import { linkItemsSchema } from "../../src/lib/validations/relation";

describe("Zod Validation Schemas", () => {
  describe("Authentication Schemas", () => {
    it("should accept valid credentials for login", () => {
      const valid = loginSchema.parse({
        email: "elena.rostova@earth.org",
        password: "password123",
      });
      assert.equal(valid.email, "elena.rostova@earth.org");
    });

    it("should reject invalid login email or empty password", () => {
      assert.throws(() => loginSchema.parse({ email: "invalid-email", password: "123" }));
      assert.throws(() => loginSchema.parse({ email: "elena@earth.org", password: "" }));
    });

    it("should validate signup requirements and password rules", () => {
      const valid = signupSchema.parse({
        name: "Dr. Elena Rostova",
        email: "elena@earth.org",
        password: "securePassword1",
      });
      assert.equal(valid.name, "Dr. Elena Rostova");

      // Reject too short password (< 8 chars)
      assert.throws(() =>
        signupSchema.parse({
          name: "Dr. Elena",
          email: "elena@earth.org",
          password: "short1",
        })
      );

      // Reject password without numbers
      assert.throws(() =>
        signupSchema.parse({
          name: "Dr. Elena",
          email: "elena@earth.org",
          password: "passwordWithoutNumber",
        })
      );

      // Reject mismatched confirm password
      assert.throws(() =>
        signupSchema.parse({
          name: "Dr. Elena",
          email: "elena@earth.org",
          password: "securePassword1",
          confirmPassword: "differentPassword1",
        })
      );
    });

    it("should validate forgot password email", () => {
      const valid = forgotPasswordSchema.parse({ email: "elena@earth.org" });
      assert.equal(valid.email, "elena@earth.org");
      assert.throws(() => forgotPasswordSchema.parse({ email: "not-an-email" }));
    });
  });

  describe("Project Schemas", () => {
    it("should validate project creation input", () => {
      const valid = createProjectSchema.parse({
        name: "Subpolar Mire Ecology",
        description: "Peatland carbon balance",
        icon: "cloud-rain",
        accent: "olive",
        biome: "Subpolar Peatland",
      });
      assert.equal(valid.name, "Subpolar Mire Ecology");
      assert.equal(valid.accent, "olive");

      // Empty name is disallowed
      assert.throws(() => createProjectSchema.parse({ name: "   " }));
    });

    it("should validate project updates", () => {
      const valid = updateProjectSchema.parse({
        status: "completed",
        accent: "terracotta",
      });
      assert.equal(valid.status, "completed");

      // Invalid status rejected
      assert.throws(() => updateProjectSchema.parse({ status: "invalid_status" }));
    });
  });

  describe("Task & Column Schemas", () => {
    it("should validate task creation and default values", () => {
      const valid = createTaskSchema.parse({
        projectId: "proj-01",
        columnId: "col-todo",
        title: "Calibrate GPS transceivers",
        type: "research",
        priority: "urgent",
      });
      assert.equal(valid.priority, "urgent");
      assert.deepEqual(valid.labels, []);

      // Missing title rejected
      assert.throws(() =>
        createTaskSchema.parse({
          projectId: "proj-01",
          columnId: "col-todo",
          title: "",
        })
      );
    });

    it("should validate move task schema", () => {
      const valid = moveTaskSchema.parse({ columnId: "col-done", order: 2 });
      assert.equal(valid.columnId, "col-done");
      assert.equal(valid.order, 2);

      // Negative order rejected
      assert.throws(() => moveTaskSchema.parse({ columnId: "col-done", order: -1 }));
    });

    it("should validate column creation and reordering", () => {
      const validCol = createColumnSchema.parse({ title: "In Review", order: 3 });
      assert.equal(validCol.title, "In Review");

      const validReorder = reorderColumnsSchema.parse({
        columnIds: ["col-1", "col-2", "col-3"],
      });
      assert.equal(validReorder.columnIds.length, 3);

      // Empty columnIds array rejected
      assert.throws(() => reorderColumnsSchema.parse({ columnIds: [] }));
    });
  });

  describe("Note & Diagram Schemas", () => {
    it("should validate note creation and tags", () => {
      const validNote = createNoteSchema.parse({
        projectId: "proj-01",
        title: "Phenology Field Observations",
        content: "# Field Observations\n\nRecorded 12 sightings.",
        tags: ["Serengeti", "Wildlife"],
      });
      assert.equal(validNote.title, "Phenology Field Observations");
      assert.equal(validNote.tags.length, 2);

      assert.throws(() => createNoteSchema.parse({ projectId: "proj-01", title: "" }));
    });

    it("should validate diagram schema and serialized canvas structure", () => {
      const validDiag = createDiagramSchema.parse({
        projectId: "proj-01",
        title: "Telemetry Architecture",
        type: "architecture",
        canvasData: {
          nodes: [{ id: "n1", type: "systemNode", position: { x: 0, y: 0 }, data: {} }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      });
      assert.equal(validDiag.title, "Telemetry Architecture");
      assert.equal(validDiag.canvasData.nodes.length, 1);
    });
  });

  describe("Cross-Module Relationship Schemas", () => {
    it("should validate bidirectional item linking", () => {
      const validRel = linkItemsSchema.parse({
        sourceType: "task",
        sourceId: "task-01",
        targetType: "note",
        targetId: "note-01",
      });
      assert.equal(validRel.sourceType, "task");
      assert.equal(validRel.targetType, "note");

      // Disallow invalid item types
      assert.throws(() =>
        linkItemsSchema.parse({
          sourceType: "invalidType" as any,
          sourceId: "1",
          targetType: "note",
          targetId: "2",
        })
      );
    });
  });
});
