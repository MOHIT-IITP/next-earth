import { db, schema } from "./index";
import { hashPassword } from "../auth/passwords";
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_NOTES,
  INITIAL_DIAGRAMS,
  INITIAL_ACTIVITIES,
  DEFAULT_KANBAN_COLUMNS,
} from "../../services/mock-data";

export async function seed() {
  console.log("🌱 Starting Earth database seeding...");

  try {
    // 1. Seed Users
    const passwordHash = await hashPassword("password123");

    console.log("Creating default researchers...");
    await db
      .insert(schema.users)
      .values([
        {
          id: "user-earth-01",
          name: "Dr. Elena Rostova",
          email: "elena.rostova@earth.org",
          passwordHash,
          role: "Lead Field Ecologist",
          organization: "Global Biosphere Survey",
          bio: "Specialist in ungulate migratory dynamics and African savanna phenology.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        },
        {
          id: "user-earth-02",
          name: "Dr. Mateo Silva",
          email: "mateo.silva@earth.org",
          passwordHash,
          role: "Telemetry Systems Engineer",
          organization: "Earth Environmental Observatory",
          bio: "Hardware architect for remote sensor networks and low-power satellite mesh telemetry.",
          avatarUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        },
      ])
      .onConflictDoNothing();

    // 2. Seed Projects & Memberships
    console.log("Seeding research projects...");
    for (const proj of INITIAL_PROJECTS) {
      await db
        .insert(schema.projects)
        .values({
          id: proj.id,
          ownerId: "user-earth-01",
          name: proj.name,
          slug: proj.slug,
          description: proj.description,
          icon: proj.icon,
          status: proj.status,
          targetDate: proj.targetDate || null,
          accent: proj.accent,
          biome: proj.biome,
          createdAt: new Date(proj.createdAt),
          updatedAt: new Date(proj.updatedAt),
        })
        .onConflictDoNothing();

      // Add owner membership
      await db
        .insert(schema.projectMembers)
        .values({
          projectId: proj.id,
          userId: "user-earth-01",
          role: "owner",
        })
        .onConflictDoNothing();

      // Add collaborator membership
      await db
        .insert(schema.projectMembers)
        .values({
          projectId: proj.id,
          userId: "user-earth-02",
          role: "editor",
        })
        .onConflictDoNothing();

      // 3. Seed Kanban Columns for project
      for (const col of DEFAULT_KANBAN_COLUMNS) {
        await db
          .insert(schema.taskColumns)
          .values({
            id: col.id,
            projectId: proj.id,
            title: col.title,
            order: col.order,
          })
          .onConflictDoNothing();
      }
    }

    // 4. Seed Tasks & Task Labels
    console.log("Seeding tasks and labels...");
    for (const task of INITIAL_TASKS) {
      await db
        .insert(schema.tasks)
        .values({
          id: task.id,
          projectId: task.projectId,
          columnId: task.columnId,
          order: task.order || 0,
          title: task.title,
          description: task.description || "",
          type: task.type,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate || null,
          assigneeName: task.assigneeName || "Dr. Elena Rostova",
          assigneeId: "user-earth-01",
          checklists: task.checklists || [],
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        })
        .onConflictDoNothing();

      if (task.labels && task.labels.length > 0) {
        for (const label of task.labels) {
          await db
            .insert(schema.taskLabels)
            .values({
              taskId: task.id,
              label,
            })
            .onConflictDoNothing();
        }
      }
    }

    // 5. Seed Notes & Tags
    console.log("Seeding research notes...");
    for (const note of INITIAL_NOTES) {
      await db
        .insert(schema.notes)
        .values({
          id: note.id,
          projectId: note.projectId,
          title: note.title,
          content: note.content,
          authorId: "user-earth-01",
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        })
        .onConflictDoNothing();

      if (note.tags && note.tags.length > 0) {
        for (const tag of note.tags) {
          await db
            .insert(schema.noteTags)
            .values({
              noteId: note.id,
              tag,
            })
            .onConflictDoNothing();
        }
      }
    }

    // 6. Seed Diagrams
    console.log("Seeding system architecture diagrams...");
    for (const diag of INITIAL_DIAGRAMS) {
      await db
        .insert(schema.diagrams)
        .values({
          id: diag.id,
          projectId: diag.projectId,
          title: diag.title,
          description: diag.description || "",
          type: diag.type,
          nodeCount: diag.nodeCount,
          edgeCount: diag.edgeCount,
          canvasData: diag.canvasData || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
          authorId: "user-earth-01",
          createdAt: new Date(diag.createdAt),
          updatedAt: new Date(diag.updatedAt),
        })
        .onConflictDoNothing();
    }

    // 7. Seed Cross-Module Item Relationships
    console.log("Seeding cross-module item relationships...");
    const relationshipEntries: Array<{
      projectId: string;
      sourceType: string;
      sourceId: string;
      targetType: string;
      targetId: string;
    }> = [];

    // From tasks:
    for (const t of INITIAL_TASKS) {
      if (t.linkedNoteIds) {
        for (const noteId of t.linkedNoteIds) {
          relationshipEntries.push(
            { projectId: t.projectId, sourceType: "task", sourceId: t.id, targetType: "note", targetId: noteId },
            { projectId: t.projectId, sourceType: "note", sourceId: noteId, targetType: "task", targetId: t.id }
          );
        }
      }
      if (t.linkedDiagramIds) {
        for (const diagId of t.linkedDiagramIds) {
          relationshipEntries.push(
            { projectId: t.projectId, sourceType: "task", sourceId: t.id, targetType: "diagram", targetId: diagId },
            { projectId: t.projectId, sourceType: "diagram", sourceId: diagId, targetType: "task", targetId: t.id }
          );
        }
      }
    }

    // From notes:
    for (const n of INITIAL_NOTES) {
      if (n.linkedDiagramIds) {
        for (const diagId of n.linkedDiagramIds) {
          relationshipEntries.push(
            { projectId: n.projectId, sourceType: "note", sourceId: n.id, targetType: "diagram", targetId: diagId },
            { projectId: n.projectId, sourceType: "diagram", sourceId: diagId, targetType: "note", targetId: n.id }
          );
        }
      }
    }

    // Deduplicate and insert
    const seenRel = new Set<string>();
    for (const rel of relationshipEntries) {
      const key = `${rel.sourceType}:${rel.sourceId}:${rel.targetType}:${rel.targetId}`;
      if (!seenRel.has(key)) {
        seenRel.add(key);
        await db
          .insert(schema.itemRelationships)
          .values({
            id: `rel-${rel.sourceId}-${rel.targetId}`,
            projectId: rel.projectId,
            sourceType: rel.sourceType,
            sourceId: rel.sourceId,
            targetType: rel.targetType,
            targetId: rel.targetId,
          })
          .onConflictDoNothing();
      }
    }

    // 8. Seed Activity Events
    console.log("Seeding activity events...");
    for (const act of INITIAL_ACTIVITIES) {
      let eventDate = new Date(act.timestamp);
      if (isNaN(eventDate.getTime())) {
        const now = Date.now();
        if (act.timestamp.includes("hour")) {
          const hours = parseInt(act.timestamp, 10) || 1;
          eventDate = new Date(now - hours * 3600 * 1000);
        } else if (act.timestamp.toLowerCase().includes("yesterday")) {
          eventDate = new Date(now - 24 * 3600 * 1000);
        } else if (act.timestamp.includes("day")) {
          const days = parseInt(act.timestamp, 10) || 1;
          eventDate = new Date(now - days * 24 * 3600 * 1000);
        } else {
          eventDate = new Date();
        }
      }

      await db
        .insert(schema.activityEvents)
        .values({
          id: act.id,
          projectId: act.projectId,
          userId: "user-earth-01",
          userName: act.user,
          action: act.action,
          target: act.target,
          iconType: act.iconType || "project",
          details: act.details || null,
          createdAt: eventDate,
        })
        .onConflictDoNothing();
    }

    console.log("✅ Seeding completed successfully!");
    console.log(`- Users: 2`);
    console.log(`- Projects: ${INITIAL_PROJECTS.length}`);
    console.log(`- Tasks: ${INITIAL_TASKS.length}`);
    console.log(`- Notes: ${INITIAL_NOTES.length}`);
    console.log(`- Diagrams: ${INITIAL_DIAGRAMS.length}`);
    console.log(`- Relationships: ${seenRel.size}`);
    console.log(`- Activities: ${INITIAL_ACTIVITIES.length}`);
  } catch (error: any) {
    console.error("❌ Database seeding failed:", error.message || error);
    process.exit(1);
  }
}

// Execute directly if run as main script
if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
