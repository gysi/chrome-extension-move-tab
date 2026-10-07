import { moveActiveTab, positionFromCommand } from "./tab-mover.js";

// Serialize shortcuts so the two moves of a swap cannot overlap another command.
let pending = Promise.resolve();
chrome.commands.onCommand.addListener((command, tab) => {
  if (positionFromCommand(command) === null) return;
  // Capture the triggering tab before waiting for earlier commands to finish.
  const active = tab?.id !== undefined
    ? Promise.resolve(tab)
    : chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(([current]) => current)
      .catch((error) => {
        console.warn("Tab Position could not find the active tab:", error.message);
        return undefined;
      });
  pending = pending.then(async () => {
    await moveActiveTab(chrome, command, (await active)?.id);
  }).catch((error) => console.warn("Tab Position could not move the tab:", error.message));
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage().catch((error) => console.warn(error.message));
});
