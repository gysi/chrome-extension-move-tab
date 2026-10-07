import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { moveActiveTab, planMoves, positionFromCommand } from "../extension/tab-mover.js";

function tabs(count, pinnedCount = 0) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 100, index, pinned: index < pinnedCount, windowId: 7,
  }));
}

function applyMoves(order, moves) {
  const result = [...order];
  for (const { id, index } of moves) {
    result.splice(index, 0, result.splice(result.indexOf(id), 1)[0]);
  }
  return result;
}

test("move and swap match the expected order across all positions and pinned boundaries", () => {
  for (let count = 1; count <= 14; count++) {
    for (let pinned = 0; pinned <= count; pinned++) {
      const snapshot = tabs(count, pinned);
      const original = snapshot.map((tab) => tab.id);
      for (let source = 0; source < count; source++) {
        for (let position = 1; position <= 10; position++) {
          for (const swap of [false, true]) {
            const destination = Math.min(position, count) - 1;
            const expected = [...original];
            if (snapshot[source].pinned === snapshot[destination].pinned) {
              if (swap) {
                [expected[source], expected[destination]] = [expected[destination], expected[source]];
              } else {
                expected.splice(destination, 0, expected.splice(source, 1)[0]);
              }
            }
            const moves = planMoves([...snapshot].reverse(), original[source], position, swap);
            assert.deepEqual(applyMoves(original, moves), expected);
            assert.deepEqual(snapshot.map((tab) => tab.id), original);
          }
        }
      }
    }
  }
});

test("only the ten declared position commands are accepted", () => {
  for (let position = 1; position <= 10; position++) {
    assert.equal(positionFromCommand(`move-to-${position}`), position);
  }
  for (const command of ["move-to-0", "move-to-11", "move-to-01", "move-to-1-extra", "_execute_action"]) {
    assert.equal(positionFromCommand(command), null);
  }
  assert.deepEqual(planMoves([], 100, 1, false), []);
  assert.deepEqual(planMoves(tabs(3), 999, 1, false), []);
  for (const position of [0, 11, 1.5, NaN]) {
    assert.deepEqual(planMoves(tabs(3), 100, position, false), []);
  }
});

function fakeChrome(snapshot, setting) {
  const calls = [];
  return {
    calls,
    tabs: {
      get: async (id) => snapshot.find((tab) => tab.id === id),
      query: async (query) => {
        assert.deepEqual(query, { windowId: 7 });
        return snapshot;
      },
      move: async (id, properties) => { calls.push({ id, ...properties }); },
    },
    storage: { local: { get: async () => setting } },
  };
}

test("runtime defaults to insert mode and confines moves to the source window", async () => {
  const api = fakeChrome(tabs(10), {});
  await moveActiveTab(api, "move-to-1", 109);
  assert.deepEqual(api.calls, [{ id: 109, windowId: 7, index: 0 }]);
});

test("runtime reads saved swap mode and awaits both moves in order", async () => {
  const api = fakeChrome(tabs(10), { swap: true });
  await moveActiveTab(api, "move-to-1", 109);
  assert.deepEqual(api.calls, [
    { id: 109, windowId: 7, index: 0 },
    { id: 100, windowId: 7, index: 9 },
  ]);
});

test("an API failure stops a swap and propagates to the command error handler", async () => {
  const api = fakeChrome(tabs(10), { swap: true });
  api.tabs.move = async () => { throw new Error("Tab was closed"); };
  await assert.rejects(moveActiveTab(api, "move-to-1", 109), /Tab was closed/);
});

test("unknown commands and missing active tabs do not call Chrome", async () => {
  await moveActiveTab({}, "unknown", 100);
  await moveActiveTab({}, "move-to-1", undefined);
});

test("manifest exposes ten manually assignable commands and only storage permission", async () => {
  const manifest = JSON.parse(await readFile(new URL("../extension/manifest.json", import.meta.url)));
  assert.equal(manifest.manifest_version, 3);
  assert.ok(manifest.description.length <= 132);
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.equal(Object.keys(manifest.commands).length, 10);
  assert.equal(manifest.host_permissions, undefined);
  for (const [command, config] of Object.entries(manifest.commands)) {
    assert.ok(positionFromCommand(command));
    assert.ok(config.description);
    assert.equal(config.suggested_key, undefined);
  }
  for (const path of [manifest.background.service_worker, manifest.options_ui.page, ...Object.values(manifest.icons)]) {
    assert.ok((await readFile(new URL(`../extension/${path}`, import.meta.url))).length > 0);
  }
});
