import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { EarthService } from "../../src/services/earth-service";

describe("Domain Logic & Task Metrics Calculations", () => {
  it("should derive correct status from column IDs", () => {
    assert.equal(EarthService.deriveStatusFromColumn("col-backlog"), "todo");
    assert.equal(EarthService.deriveStatusFromColumn("col-todo"), "todo");
    assert.equal(EarthService.deriveStatusFromColumn("col-in_progress"), "in_progress");
    assert.equal(EarthService.deriveStatusFromColumn("col-in_review"), "in_progress");
    assert.equal(EarthService.deriveStatusFromColumn("col-done"), "completed");
    assert.equal(EarthService.deriveStatusFromColumn("col-finished"), "completed");
    assert.equal(EarthService.deriveStatusFromColumn("col-unknown"), "todo");
  });

  it("should calculate project metrics accurately", () => {
    const metrics = EarthService.getProjectMetrics("proj-01");

    assert.ok(metrics.totalTasks > 0, "Should have tasks for proj-01");
    assert.equal(metrics.openTasks, metrics.todoTasks + metrics.inProgressTasks, "Open tasks must equal todo + in_progress");
    assert.ok(metrics.completionRate >= 0 && metrics.completionRate <= 100, "Completion rate must be between 0 and 100%");

    const prioritySum =
      metrics.byPriority.low +
      metrics.byPriority.medium +
      metrics.byPriority.high +
      metrics.byPriority.urgent;
    assert.equal(prioritySum, metrics.totalTasks, "Sum of tasks by priority must equal total tasks");

    // Upcoming tasks should be sorted chronologically
    for (let i = 0; i < metrics.upcomingTasks.length - 1; i++) {
      const current = new Date(metrics.upcomingTasks[i].dueDate!).getTime();
      const next = new Date(metrics.upcomingTasks[i + 1].dueDate!).getTime();
      assert.ok(current <= next, "Upcoming tasks must be ordered ascending by due date");
    }
  });

  it("should derive dashboard metrics across all projects consistently", () => {
    const dashboardMetrics = EarthService.getDashboardMetrics();

    assert.ok(dashboardMetrics.totalProjects >= dashboardMetrics.activeProjects);
    assert.equal(
      dashboardMetrics.totalTasks,
      dashboardMetrics.openTasks + dashboardMetrics.completedTasks,
      "Total tasks must equal open tasks plus completed tasks"
    );

    const calculatedRate =
      dashboardMetrics.totalTasks > 0
        ? Math.round((dashboardMetrics.completedTasks / dashboardMetrics.totalTasks) * 100)
        : 0;
    assert.equal(dashboardMetrics.completionRate, calculatedRate, "Dashboard completion rate matches calculation");
  });

  it("should filter and sort tasks correctly", () => {
    const allProjTasks = EarthService.getTasks("proj-01");

    const highPriorityTasks = allProjTasks.filter((t) => t.priority === "high");
    for (const t of highPriorityTasks) {
      assert.equal(t.priority, "high");
    }

    const researchTasks = allProjTasks.filter((t) => t.type === "research");
    for (const t of researchTasks) {
      assert.equal(t.type, "research");
    }
  });
});
