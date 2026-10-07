import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("../extension/options.js", import.meta.url), "utf8");
const flush = () => new Promise((resolve) => setImmediate(resolve));

async function settingsPage({ saved = {}, failLoad = false, failSave = false } = {}) {
  const listeners = {};
  const toggle = { checked: false, disabled: true, addEventListener: (name, fn) => { listeners[name] = fn; } };
  const status = { textContent: "" };
  const configure = { addEventListener: (name, fn) => { listeners.configure = fn; } };
  const opened = [];
  const api = {
    storage: { local: {
      get: async () => { if (failLoad) throw new Error("Load failed"); return saved; },
      set: async (value) => { if (failSave) throw new Error("Save failed"); Object.assign(saved, value); },
    } },
    tabs: { create: async (value) => { opened.push(value); } },
  };
  vm.runInNewContext(script, {
    chrome: api,
    document: { querySelector: (selector) => ({ "#swap": toggle, "#status": status, "#configure": configure })[selector] },
  });
  await flush();
  return { toggle, status, saved, opened, listeners };
}

test("settings default to move mode, persist toggles, and reload swap mode", async () => {
  const page = await settingsPage();
  assert.equal(page.toggle.disabled, false);
  assert.equal(page.toggle.checked, false);
  page.toggle.checked = true;
  await page.listeners.change();
  assert.equal(page.saved.swap, true);
  assert.equal(page.status.textContent, "Saved.");
  assert.equal((await settingsPage({ saved: page.saved })).toggle.checked, true);
  page.toggle.checked = false;
  await page.listeners.change();
  assert.equal(page.saved.swap, false);
  await page.listeners.configure();
  assert.equal(page.opened[0].url, "chrome://extensions/shortcuts");
});

test("failed saves restore the old setting and allow retry", async () => {
  const page = await settingsPage({ failSave: true });
  page.toggle.checked = true;
  await page.listeners.change();
  assert.equal(page.toggle.checked, false);
  assert.equal(page.toggle.disabled, false);
  assert.match(page.status.textContent, /Could not save/);
});

test("failed loads keep the setting disabled and show a recovery message", async () => {
  const page = await settingsPage({ failLoad: true });
  assert.equal(page.toggle.disabled, true);
  assert.match(page.status.textContent, /Could not load/);
});
