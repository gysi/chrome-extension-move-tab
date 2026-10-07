const toggle = document.querySelector("#swap");
const status = document.querySelector("#status");

async function loadSettings() {
  try {
    const { swap } = await chrome.storage.local.get({ swap: false });
    toggle.checked = swap === true;
    toggle.disabled = false;
  } catch {
    status.textContent = "Could not load settings. Reopen this page to try again.";
  }
}

toggle.addEventListener("change", async () => {
  toggle.disabled = true;
  try {
    await chrome.storage.local.set({ swap: toggle.checked });
    status.textContent = "Saved.";
  } catch {
    toggle.checked = !toggle.checked;
    status.textContent = "Could not save. Please try again.";
  } finally {
    toggle.disabled = false;
  }
});

document.querySelector("#configure").addEventListener("click", async () => {
  try {
    await chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  } catch {
    status.textContent = "Open chrome://extensions/shortcuts in Chrome to configure shortcuts.";
  }
});

loadSettings();
