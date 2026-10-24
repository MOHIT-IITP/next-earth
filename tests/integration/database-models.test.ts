import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { schema } from "../../src/lib/db";
import { getTableColumns } from "drizzle-orm";

describe("Integration: PostgreSQL Drizzle Schema & Relational Integrity", () => {
  it("should verify users table schema definition", () => {
    const cols = getTableColumns(schema.users);
    assert.ok(cols.id, "Users table must have id primary key");
    assert.ok(cols.email, "Users table must have email column");
    assert.ok(cols.passwordHash, "Users table must have passwordHash column");
    assert.ok(cols.name, "Users table must have name column");
    assert.ok(cols.role, "Users table must have role column");
    assert.ok(cols.createdAt, "Users table must have createdAt timestamp");
  });

  it("should verify projects and project_members schema definitions", () => {
    const projCols = getTableColumns(schema.projects);
    assert.ok(projCols.id, "Projects table must have id");
    assert.ok(projCols.ownerId, "Projects table must have ownerId foreign key");
    assert.ok(projCols.name, "Projects table must have name");
    assert.ok(projCols.status, "Projects table must have status");
    assert.ok(projCols.biome, "Projects table must have biome");
    assert.ok(projCols.accent, "Projects table must have accent");

    const memberCols = getTableColumns(schema.projectMembers);
    assert.ok(memberCols.projectId, "Project members table must have projectId");
    assert.ok(memberCols.userId, "Project members table must have userId");
    assert.ok(memberCols.role, "Project members table must have role");
  });

  it("should verify tasks and task_columns schema definitions", () => {
    const taskCols = getTableColumns(schema.tasks);
    assert.ok(taskCols.id, "Tasks table must have id");
    assert.ok(taskCols.projectId, "Tasks table must have projectId");
    assert.ok(taskCols.columnId, "Tasks table must have columnId");
    assert.ok(taskCols.title, "Tasks table must have title");
    assert.ok(taskCols.priority, "Tasks table must have priority");
    assert.ok(taskCols.status, "Tasks table must have status");
    assert.ok(taskCols.checklists, "Tasks table must have checklists JSONB");

    const colCols = getTableColumns(schema.taskColumns);
    assert.ok(colCols.id, "TaskColumns must have id");
    assert.ok(colCols.projectId, "TaskColumns must have projectId");
    assert.ok(colCols.title, "TaskColumns must have title");
    assert.ok(colCols.order, "TaskColumns must have order");
  });

  it("should verify notes and diagrams schema definitions", () => {
    const noteCols = getTableColumns(schema.notes);
    assert.ok(noteCols.id, "Notes table must have id");
    assert.ok(noteCols.projectId, "Notes table must have projectId");
    assert.ok(noteCols.title, "Notes table must have title");
    assert.ok(noteCols.content, "Notes table must have content");

    const diagCols = getTableColumns(schema.diagrams);
    assert.ok(diagCols.id, "Diagrams table must have id");
    assert.ok(diagCols.projectId, "Diagrams table must have projectId");
    assert.ok(diagCols.title, "Diagrams table must have title");
    assert.ok(diagCols.canvasData, "Diagrams table must have canvasData JSONB");
    assert.ok(diagCols.nodeCount, "Diagrams table must have nodeCount");
    assert.ok(diagCols.edgeCount, "Diagrams table must have edgeCount");
  });

  it("should verify item_relationships schema definitions", () => {
    const relCols = getTableColumns(schema.itemRelationships);
    assert.ok(relCols.id, "Item relationships must have id");
    assert.ok(relCols.projectId, "Item relationships must have projectId");
    assert.ok(relCols.sourceType, "Item relationships must have sourceType");
    assert.ok(relCols.sourceId, "Item relationships must have sourceId");
    assert.ok(relCols.targetType, "Item relationships must have targetType");
    assert.ok(relCols.targetId, "Item relationships must have targetId");
  });

  it("should verify activity_events schema definitions", () => {
    const actCols = getTableColumns(schema.activityEvents);
    assert.ok(actCols.id, "Activity events must have id");
    assert.ok(actCols.projectId, "Activity events must have projectId");
    assert.ok(actCols.action, "Activity events must have action");
    assert.ok(actCols.target, "Activity events must have target");
    assert.ok(actCols.iconType, "Activity events must have iconType");
    assert.ok(actCols.createdAt, "Activity events must have createdAt timestamp");
  });
});
