import { describe, it, beforeEach } from "node:test";
import * as assert from "node:assert/strict";
import { EarthService } from "../../src/services/earth-service";

describe("Cross-Module Relationship Model & Integrity", () => {
  beforeEach(() => {
    EarthService.resetToMockData();
  });

  it("should establish a bidirectional link between a task and a note", () => {
    const task = EarthService.getTasks("proj-01")[0];
    const note = EarthService.getNotes("proj-01")[0];

    EarthService.linkItems("task", task.id, "note", note.id);

    const updatedTask = EarthService.getTaskById(task.id);
    const updatedNote = EarthService.getNoteById(note.id);

    assert.ok(updatedTask?.linkedNoteIds?.includes(note.id), "Task must reference linked note");
    assert.ok(updatedNote?.linkedTaskIds?.includes(task.id), "Note must reference linked task");
  });

  it("should prevent duplicate links between the same items", () => {
    const task = EarthService.getTasks("proj-01")[0];
    const note = EarthService.getNotes("proj-01")[0];

    EarthService.linkItems("task", task.id, "note", note.id);
    // Re-link same items
    EarthService.linkItems("task", task.id, "note", note.id);

    const updatedTask = EarthService.getTaskById(task.id);
    const noteCount = updatedTask?.linkedNoteIds?.filter((id) => id === note.id).length;
    assert.equal(noteCount, 1, "Linked notes list must not contain duplicates");
  });

  it("should remove link without deleting the underlying item", () => {
    const task = EarthService.getTasks("proj-01")[0];
    const note = EarthService.getNotes("proj-01")[0];

    EarthService.linkItems("task", task.id, "note", note.id);
    EarthService.unlinkItems("task", task.id, "note", note.id);

    const taskAfterUnlink = EarthService.getTaskById(task.id);
    const noteAfterUnlink = EarthService.getNoteById(note.id);

    // Both items must still exist
    assert.ok(taskAfterUnlink !== null, "Task should still exist after unlinking");
    assert.ok(noteAfterUnlink !== null, "Note should still exist after unlinking");
    assert.ok(!taskAfterUnlink?.linkedNoteIds?.includes(note.id), "Task should no longer reference note");
    assert.ok(!noteAfterUnlink?.linkedTaskIds?.includes(task.id), "Note should no longer reference task");
  });

  it("should safely clear references when a task is deleted", () => {
    const task = EarthService.createTask({
      projectId: "proj-01",
      title: "Temporary Observation Task",
      columnId: "col-todo",
      type: "research",
      priority: "medium",
      labels: [],
    });

    const note = EarthService.getNotes("proj-01")[0];
    EarthService.linkItems("task", task.id, "note", note.id);

    // Delete task
    EarthService.deleteTask(task.id);

    const noteAfterTaskDelete = EarthService.getNoteById(note.id);
    assert.ok(
      !noteAfterTaskDelete?.linkedTaskIds?.includes(task.id),
      "Note must not hold dangling reference to deleted task"
    );
  });

  it("should retrieve related item references with enriched metadata", () => {
    const task = EarthService.getTasks("proj-01")[0];
    const refs = EarthService.getRelatedItems("proj-01", "task", task.id);

    assert.ok(Array.isArray(refs), "Should return array of related items");
    for (const ref of refs) {
      assert.ok(ref.id, "Reference must have an id");
      assert.ok(ref.title, "Reference must have a title");
      assert.ok(ref.href, "Reference must have a navigation href");
      assert.ok(["task", "note", "diagram"].includes(ref.type), "Type must be task, note, or diagram");
    }
  });

  it("should enforce project isolation and prohibit cross-project relationships", () => {
    const proj1Task = EarthService.getTasks("proj-01")[0];
    const proj2Note = EarthService.getNotes("proj-02")[0];

    assert.throws(
      () => EarthService.linkItems("task", proj1Task.id, "note", proj2Note.id),
      /Cross-project relationships are prohibited/
    );
  });
});
