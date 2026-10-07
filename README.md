# Tab Position

Move the active Chrome tab to positions **1–10** with your own keyboard shortcuts.

- **Move** (default): insert the tab at the destination; tabs in between shift.
- **Swap**: exchange the active and destination tabs; other tabs stay in place.

For example, moving tab 10 to position 1 shifts tabs 1–9 right. With Swap enabled, tabs 1 and 10 exchange places.

## Install locally

1. Download this repository using **Code → Download ZIP** and extract it, or clone it.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and select the **extension** folder inside this repository.
4. Open `chrome://extensions/shortcuts` and assign each command, for example `Ctrl+Shift+1` through `Ctrl+Shift+9`, then `Ctrl+Shift+0` for position 10. On Mac, use Command.

Shortcuts start unassigned. Chrome or your operating system may reserve some combinations; choose alternatives if needed. Keep shortcut scope **In Chrome**.

Click the extension's toolbar icon (or **Details → Extension options**) to toggle **Swap with the destination tab**. Changes save automatically on this device. After updating local files, click **Reload** on `chrome://extensions`.

Positions count from the left in the current window, including pinned tabs. A position beyond the tab count targets the last tab. Moves across the pinned/unpinned boundary do nothing. Chrome controls tab group membership when tabs move; check grouped tabs before relying on a particular group layout.

## Chrome Web Store

Not published yet. After an approved release goes live, add its verified store URL here and to the repository's About website field. Publishing requires testing in Chrome and explicit user approval; see [AGENTS.md](AGENTS.md).

Store screenshots: [Settings](screenshots/settings.png) · [Keyboard shortcuts](screenshots/shortcuts.png).

## Development and testing

No dependencies or build step. Run `node --test` with Node.js 18+.

Before publishing, load it in Chrome and check:

- With ten tabs, move tab 10 to 1, then back to 10. Check both directions and intermediate positions.
- Enable Swap; exchange tabs 10 and 1. Confirm all other tabs stay in order and the active tab stays active.
- Check saved settings after restarting Chrome, all ten shortcuts, rapid repeated shortcuts, two windows, fewer than ten tabs, pinned tabs, and tab groups.
- Confirm `chrome://extensions` shows no extension errors, including after the service worker becomes idle.

After testing, create an upload ZIP containing only the contents of the `extension` folder, with `manifest.json` at the ZIP root.

Only the `storage` permission is requested. No page access, analytics, external requests, or browsing data collection. See [PRIVACY.md](PRIVACY.md). Report problems through [GitHub Issues](https://github.com/gysi/chrome-extension-move-tab/issues).
