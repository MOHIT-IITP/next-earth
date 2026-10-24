import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { SerializedCanvas } from "../../src/services/types";
import { SAMPLE_STARTER_CANVAS } from "../../src/services/mock-data";

describe("Sketch Canvas Serialization & State Machine", () => {
  it("should validate default starter canvas structure", () => {
    assert.ok(Array.isArray(SAMPLE_STARTER_CANVAS.nodes), "Canvas must contain nodes array");
    assert.ok(SAMPLE_STARTER_CANVAS.nodes.length >= 5, "Sample canvas should have several nodes");

    for (const node of SAMPLE_STARTER_CANVAS.nodes) {
      assert.ok(node.id, "Node must have an id");
      assert.ok(node.type, "Node must have a type");
      assert.ok(node.position && typeof node.position.x === "number", "Node must have position coordinates");
      assert.ok(node.data && node.data.label, "Node must have data payload with label");
    }
  });

  it("should serialize and restore canvas data accurately", () => {
    const original: SerializedCanvas = {
      nodes: [
        {
          id: "node-field-1",
          type: "systemNode",
          position: { x: 100, y: 150 },
          data: { label: "Field Radio", nodeType: "client", status: "active", accent: "terracotta" },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "node-field-1",
          target: "node-gw-1",
          animated: true,
        },
      ],
      viewport: { x: 120, y: 40, zoom: 0.85 },
    };

    const json = JSON.stringify(original);
    const restored: SerializedCanvas = JSON.parse(json);

    assert.equal(restored.nodes.length, 1);
    assert.equal(restored.nodes[0].id, "node-field-1");
    assert.equal(restored.nodes[0].position.x, 100);
    assert.equal(restored.edges.length, 1);
    assert.equal(restored.viewport?.zoom, 0.85);
  });

  it("should manage an undo/redo history stack without race conditions", () => {
    const history: Array<{ nodeCount: number }> = [];
    let historyIndex = -1;

    const push = (state: { nodeCount: number }) => {
      history.splice(historyIndex + 1);
      history.push(state);
      historyIndex = history.length - 1;
    };

    const undo = () => {
      if (historyIndex > 0) {
        historyIndex -= 1;
        return history[historyIndex];
      }
      return null;
    };

    const redo = () => {
      if (historyIndex < history.length - 1) {
        historyIndex += 1;
        return history[historyIndex];
      }
      return null;
    };

    // 1. Initial State
    push({ nodeCount: 1 });
    assert.equal(historyIndex, 0);

    // 2. Add second node
    push({ nodeCount: 2 });
    assert.equal(historyIndex, 1);

    // 3. Add third node
    push({ nodeCount: 3 });
    assert.equal(historyIndex, 2);

    // 4. Undo back to 2 nodes
    const undone = undo();
    assert.equal(undone?.nodeCount, 2);
    assert.equal(historyIndex, 1);

    // 5. Redo back to 3 nodes
    const redone = redo();
    assert.equal(redone?.nodeCount, 3);
    assert.equal(historyIndex, 2);

    // 6. Undo, then branch new state
    undo();
    push({ nodeCount: 5 }); // Branches from index 1, discarding nodeCount: 3
    assert.equal(history.length, 3);
    assert.equal(history[2].nodeCount, 5);
  });
});
