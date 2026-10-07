import assert from "node:assert/strict";
import test from "node:test";

test("rapid shortcuts serialize swaps, keep the triggering tab, and recover from errors", async () => {
  let onCommand;
  let onClick;
  let releaseFirstMove;
  let failNext = false;
  const order = [100, 101, 102, 103];
  const calls = [];
  const warnings = [];
  const originalWarn = console.warn;
  const originalChrome = globalThis.chrome;
  console.warn = (...args) => warnings.push(args);
  globalThis.chrome = {
    commands: { onCommand: { addListener: (fn) => { onCommand = fn; } } },
    action: { onClicked: { addListener: (fn) => { onClick = fn; } } },
    runtime: { openOptionsPage: async () => {} },
    storage: { local: { get: async () => ({ swap: true }) } },
    tabs: {
      get: async (id) => ({ id, windowId: 7 }),
      query: async () => order.map((id, index) => ({ id, index, pinned: false, windowId: 7 })),
      move: async (id, { index }) => {
        if (failNext) { failNext = false; throw new Error("Tab closed"); }
        calls.push(id);
        if (calls.length === 1) await new Promise((resolve) => { releaseFirstMove = resolve; });
        order.splice(index, 0, order.splice(order.indexOf(id), 1)[0]);
      },
    },
  };
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  try {
    await import("../extension/background.js");
    assert.equal(typeof onClick, "function");
    onCommand("move-to-1", { id: 103 });
    onCommand("move-to-2", { id: 102 });
    await flush();
    assert.deepEqual(calls, [103]);
    releaseFirstMove();
    await flush();
    assert.deepEqual(calls, [103, 100, 102, 101]);
    assert.deepEqual(order, [103, 102, 101, 100]);
    failNext = true;
    onCommand("move-to-1", { id: 100 });
    onCommand("move-to-1", { id: 101 });
    await flush();
    assert.equal(warnings.length, 1);
    assert.deepEqual(order, [101, 102, 103, 100]);
  } finally {
    globalThis.chrome = originalChrome;
    console.warn = originalWarn;
  }
});
