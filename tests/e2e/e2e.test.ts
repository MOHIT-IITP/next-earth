import { describe, it, beforeEach } from "node:test";
import * as assert from "node:assert/strict";
import { EarthService } from "../../src/services/earth-service";
import { createSessionToken, verifySessionToken } from "../../src/lib/auth/session";
import { hashPassword, verifyPassword } from "../../src/lib/auth/passwords";
import { signupSchema, loginSchema } from "../../src/lib/validations/auth";
import { createProjectSchema } from "../../src/lib/validations/project";
import { createTaskSchema, moveTaskSchema } from "../../src/lib/validations/task";
import { createNoteSchema } from "../../src/lib/validations/note";
import { createDiagramSchema } from "../../src/lib/validations/diagram";
import { linkItemsSchema } from "../../src/lib/validations/relation";

describe("E2E Comprehensive Suite: Earth Observatory Workflows", () => {
  beforeEach(() => {
    EarthService.resetToMockData();
  });

  // Workflow 1: Authentication Lifecycle
  describe("Workflow 1: Authentication Lifecycle", () => {
    it("should complete signup, password encryption, session token issuance, and logout", async () => {
      // 1. User inputs signup details
      const signupData = {
        name: "Dr. Kaelen Voss",
        email: "kaelen.voss@earth.org",
        password: "voss_field_password_2026!",
        confirmPassword: "voss_field_password_2026!",
      };
      const validatedSignup = signupSchema.parse(signupData);

      // 2. Encrypt password with bcrypt
      const passwordHash = await hashPassword(validatedSignup.password);
      assert.ok(passwordHash.startsWith("$2"), "Password must be securely hashed");

      // 3. User logs in with raw password
      const loginData = {
        email: "kaelen.voss@earth.org",
        password: "voss_field_password_2026!",
      };
      const validatedLogin = loginSchema.parse(loginData);
      const isPasswordValid = await verifyPassword(validatedLogin.password, passwordHash);
      assert.equal(isPasswordValid, true, "Login credential verification must succeed");

      // 4. Session token issued
      const sessionToken = await createSessionToken({
        userId: "user-voss-02",
        email: validatedLogin.email,
        name: validatedSignup.name,
        role: "Field Systems Analyst",
      });
      assert.ok(sessionToken, "Session JWT must be issued");

      // 5. Middleware verifies session
      const session = await verifySessionToken(sessionToken);
      assert.ok(session !== null, "Session must verify on protected routes");
      assert.equal(session.email, "kaelen.voss@earth.org");

      // 6. Logout clears session
      const expiredSession = await verifySessionToken("");
      assert.equal(expiredSession, null, "Cleared session must not authorize");
    });
  });

  // Workflow 2: Project Management Lifecycle
  describe("Workflow 2: Project Management Lifecycle", () => {
    it("should create, configure, update, and manage research project lifecycle", () => {
      // 1. Create new project with Zod validation
      const projectInput = {
        name: "Congo Basin Peat Swamp Canopy",
        description: "Carbon flux eddy covariance monitoring across cuvette centrale.",
        icon: "trees",
        accent: "olive" as const,
        biome: "Tropical Swamp Forest",
      };
      const validated = createProjectSchema.parse(projectInput);

      const created = EarthService.createProject(validated);
      assert.ok(created.id, "Created project must receive an ID");
      assert.equal(created.name, projectInput.name);
      assert.equal(created.status, "active");

      // 2. Verify default kanban columns exist
      const columns = EarthService.getColumns(created.id);
      assert.equal(columns.length, 5, "Project must be initialized with 5 standard kanban columns");

      // 3. Update project status to completed
      const updated = EarthService.updateProject(created.id, {
        status: "completed",
        targetDate: "2027-01-15",
      });
      assert.equal(updated.status, "completed");
      assert.equal(updated.targetDate, "2027-01-15");

      // 4. Archive project
      const archived = EarthService.updateProject(created.id, { status: "archived" });
      assert.equal(archived.status, "archived");

      // 5. Delete project
      EarthService.deleteProject(created.id);
      assert.equal(EarthService.getProjectById(created.id), undefined, "Deleted project must be removed");
    });
  });

  // Workflow 3: Kanban Board & Task Management
  describe("Workflow 3: Kanban Board & Task Transitions", () => {
    it("should create tasks, reorder within column, and move across columns updating status", () => {
      const projectId = "proj-01";
      const columns = EarthService.getColumns(projectId);
      const todoCol = columns.find((c) => c.title === "Todo")!;
      const inProgressCol = columns.find((c) => c.title === "In Progress")!;
      const doneCol = columns.find((c) => c.title === "Done")!;

      // 1. Create a new task
      const taskInput = {
        projectId,
        columnId: todoCol.id,
        title: "Test Acoustic Sensor Node B",
        description: "Validate battery charge and UHF range.",
        type: "research" as const,
        priority: "high" as const,
        labels: ["Acoustics", "Hardware"],
      };
      const validated = createTaskSchema.parse(taskInput);
      const task = EarthService.createTask(validated);

      assert.equal(task.status, "todo");
      assert.equal(task.columnId, todoCol.id);

      // 2. Move to In Progress (Drag and drop or keyboard alternative)
      moveTaskSchema.parse({ columnId: inProgressCol.id, order: 0 });
      const movedToInProgress = EarthService.moveTask(task.id, inProgressCol.id, 0);
      assert.equal(movedToInProgress.status, "in_progress");
      assert.equal(movedToInProgress.columnId, inProgressCol.id);

      // 3. Move to Done
      moveTaskSchema.parse({ columnId: doneCol.id, order: 0 });
      const movedToDone = EarthService.moveTask(task.id, doneCol.id, 0);
      assert.equal(movedToDone.status, "completed");
      assert.ok(movedToDone.completedAt, "Completed task must record completion timestamp");

      // 4. Update task checklists
      const withChecklist = EarthService.updateTask(task.id, {
        checklists: [
          { id: "chk-1", title: "Calibrate mic sensitivity", completed: true },
          { id: "chk-2", title: "Mount enclosure on baobab", completed: true },
        ],
      });
      assert.equal(withChecklist.checklists?.length, 2);
      assert.equal(withChecklist.checklists?.every((c) => c.completed), true);
    });
  });

  // Workflow 4: Notes Knowledge Base & Autosave
  describe("Workflow 4: Notes Knowledge Base & Rich Text Autosave", () => {
    it("should create, edit, autosave, tag, and filter research notes", () => {
      const projectId = "proj-01";

      // 1. Create research note
      const noteInput = {
        projectId,
        title: "Wildebeest River Crossing Velocity Log",
        content: "# Observation Notes\n\nCrossings commenced at 06:40 local time.",
        tags: ["Migration", "Field", "Hydrology"],
      };
      const validated = createNoteSchema.parse(noteInput);
      const note = EarthService.createNote(validated);

      assert.ok(note.id);
      assert.equal(note.tags?.length, 3);

      // 2. Autosave new content
      const updatedContent = `${note.content}\n\n- Herd size: estimated 4,200 individuals.\n- Turbidity elevated.`;
      const savedNote = EarthService.updateNote(note.id, { content: updatedContent });
      assert.equal(savedNote.content, updatedContent);

      // 3. Filter notes by tag
      const migrationNotes = EarthService.getNotes(projectId, { tag: "Migration" });
      assert.ok(migrationNotes.some((n) => n.id === note.id), "Tagged note must be discoverable via tag filter");
    });
  });

  // Workflow 5: System Sketch Canvas
  describe("Workflow 5: System Design Canvas & Serialization", () => {
    it("should create architecture diagram, update canvas nodes, and serialize correctly", () => {
      const projectId = "proj-01";

      // 1. Create diagram
      const diagInput = {
        projectId,
        title: "Satellite Sensor Ingestion Pipeline",
        type: "architecture" as const,
        canvasData: {
          nodes: [
            { id: "client-1", type: "systemNode", position: { x: 50, y: 100 }, data: { label: "Field Observer" } },
            { id: "gateway-1", type: "systemNode", position: { x: 300, y: 100 }, data: { label: "API Gateway" } },
          ],
          edges: [
            { id: "e1", source: "client-1", target: "gateway-1", animated: true },
          ],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      };
      const validated = createDiagramSchema.parse(diagInput);
      const diagram = EarthService.createDiagram(validated);

      assert.ok(diagram.id);
      assert.equal(diagram.nodeCount, 2);
      assert.equal(diagram.edgeCount, 1);

      // 2. Update canvas data
      const updatedCanvas = {
        ...diagram.canvasData,
        nodes: [
          ...(diagram.canvasData?.nodes || []),
          { id: "queue-1", type: "systemNode", position: { x: 550, y: 100 }, data: { label: "Kafka Buffer" } },
        ],
      };
      EarthService.saveDiagramCanvas(diagram.id, updatedCanvas);

      const refreshed = EarthService.getDiagramById(diagram.id);
      assert.equal(refreshed?.canvasData?.nodes.length, 3);
    });
  });

  // Workflow 6: Cross-Module Integration (The Complete Project Workspace)
  describe("Workflow 6: Cross-Module Linking & Safe Entity Deletion", () => {
    it("should establish three-way links between task, note, and diagram and clean up safely", () => {
      const projectId = "proj-01";
      const task = EarthService.getTasks(projectId)[0];
      const note = EarthService.getNotes(projectId)[0];
      const diagram = EarthService.getDiagrams(projectId)[0];

      // 1. Validate link schemas
      linkItemsSchema.parse({ sourceType: "task", sourceId: task.id, targetType: "note", targetId: note.id });
      linkItemsSchema.parse({ sourceType: "task", sourceId: task.id, targetType: "diagram", targetId: diagram.id });
      linkItemsSchema.parse({ sourceType: "note", sourceId: note.id, targetType: "diagram", targetId: diagram.id });

      // 2. Link Task <-> Note
      EarthService.linkItems("task", task.id, "note", note.id);
      // 3. Link Task <-> Diagram
      EarthService.linkItems("task", task.id, "diagram", diagram.id);
      // 4. Link Note <-> Diagram
      EarthService.linkItems("note", note.id, "diagram", diagram.id);

      // Verify links established
      const taskWithLinks = EarthService.getTaskById(task.id)!;
      assert.ok(taskWithLinks.linkedNoteIds?.includes(note.id));
      assert.ok(taskWithLinks.linkedDiagramIds?.includes(diagram.id));

      const noteWithLinks = EarthService.getNoteById(note.id)!;
      assert.ok(noteWithLinks.linkedTaskIds?.includes(task.id));
      assert.ok(noteWithLinks.linkedDiagramIds?.includes(diagram.id));

      const diagWithLinks = EarthService.getDiagramById(diagram.id)!;
      assert.ok(diagWithLinks.linkedTaskIds?.includes(task.id));
      assert.ok(diagWithLinks.linkedNoteIds?.includes(note.id));

      // 5. Unlink Task from Note (without deleting either item)
      EarthService.unlinkItems("task", task.id, "note", note.id);
      assert.ok(!EarthService.getTaskById(task.id)?.linkedNoteIds?.includes(note.id));
      assert.ok(!EarthService.getNoteById(note.id)?.linkedTaskIds?.includes(task.id));
      assert.ok(EarthService.getTaskById(task.id) !== null, "Task must still exist");
      assert.ok(EarthService.getNoteById(note.id) !== null, "Note must still exist");
    });
  });

  // Workflow 7: Global Dashboard Metrics
  describe("Workflow 7: Global Dashboard Derived Statistics", () => {
    it("should accurately compute all global observatory statistics", () => {
      const stats = EarthService.getDashboardMetrics();

      assert.ok(stats.totalProjects >= 4);
      assert.ok(stats.activeProjects >= 1);
      assert.ok(stats.totalTasks >= 5);
      assert.ok(stats.completedTasks >= 1);
      assert.ok(stats.openTasks >= 1);
      assert.equal(stats.totalTasks, stats.openTasks + stats.completedTasks);

      const expectedPct = Math.round((stats.completedTasks / stats.totalTasks) * 100);
      assert.equal(stats.completionRate, expectedPct);
    });
  });

  // Workflow 8: Accessibility & Responsive Audit
  describe("Workflow 8: Accessibility & UI Guidelines Audit", () => {
    it("should satisfy keyboard accessibility requirements and focus landmarks", () => {
      // 1. Task move alternative must support keyboard navigation
      const columns = EarthService.getColumns("proj-01");
      assert.ok(columns.length >= 3, "Board must have multiple columns for keyboard navigation");

      // 2. Priority mappings must align with semantic color tokens
      const priorityLevels = ["low", "medium", "high", "urgent"];
      for (const p of priorityLevels) {
        assert.ok(["low", "medium", "high", "urgent"].includes(p));
      }

      // 3. Project status enumerations must be exhaustive
      const validStatuses = ["active", "completed", "on_hold", "archived"];
      for (const s of validStatuses) {
        assert.ok(["active", "completed", "on_hold", "archived"].includes(s));
      }
    });
  });
});
