# Agent instructions

## Working conventions

- Use English. Keep code, documentation, and UI small, clear, and useful. Avoid dependencies and unrelated features.
- Prefer git-related tooling in this order: **git → gh → GitHub MCP → browser-use MCP (`mcp__cua_repl`)**. Use the next option when the earlier one cannot do the job. An explicit user request for a particular tool takes precedence.
- Run `node --test` after behavior changes. Preserve the ten commands, default insert mode, saved swap setting, current-window scope, and pinned boundary.
- Do not add `tabs`, `activeTab`, host permissions, content scripts, analytics, or remote code for this feature. `chrome.tabs.query/get/move` can use tab IDs, indexes, and pinned state without access to titles or URLs.

## Chrome documentation reference

Reviewed **2026-10-07**: the relevant registration, account setup, preparation, listing, privacy, distribution, testing, publishing, review, update, and program policy guides below. This is a project-focused summary, not a copy of the entire Chrome documentation site.

Read this summary first. When it already covers the task, do not repeat the documentation scan or add duplicate notes. If coverage is missing, read the relevant official pages and summarize only the necessary additions. Update this reference when the user explicitly requests a documentation refresh. Before an actual store submission, verify current dashboard requirements and policies; do not silently rewrite these notes.

### Account and preparation

- [Register](https://developer.chrome.com/docs/webstore/register/): registration requires agreement to developer terms and a one-time fee. The user already has an account; do not register or pay again. The account email cannot be changed directly.
- [Account setup](https://developer.chrome.com/docs/webstore/set-up-account): verify the contact email and publisher name. A physical address is required in some circumstances, including paid functionality. Trusted testers are optional. Keep account details private.
- [Prepare](https://developer.chrome.com/docs/webstore/prepare): test locally first; check name, version, icons, and description (maximum 132 characters). ZIP all runtime files with `manifest.json` at its root. Every uploaded update needs a higher version.

### Development and policies

- [Commands](https://developer.chrome.com/docs/extensions/reference/api/commands): many commands are allowed, but only four suggested shortcuts. Leave all ten unassigned for manual binding. Browser/OS shortcuts can take priority; Ctrl+Alt is not permitted. Ctrl maps to Command on Mac.
- [Tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs): use native tab APIs without sensitive tab permissions; await moves and handle rejections. A drag or closed tab can prevent a move.
- [Service workers](https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers): register listeners synchronously; workers stop when idle. Persist preferences in storage, not global variables.
- [Program policies](https://developer.chrome.com/docs/webstore/program-policies/policies): keep one narrow, useful purpose, minimum permissions, readable packaged code, accurate disclosures, and meaningful support. No remote executable logic, deceptive behavior, keyword spam, impersonation, policy evasion, or unsolicited browsing changes. Handle data securely; publish an accurate privacy policy and obey Limited Use restrictions. Developer accounts need two-step verification before publishing or updating. Google can reject or remove noncompliant items; monitor developer emails and fix violations.

### Listing, release, and maintenance

- [Listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing), [listing quality](https://developer.chrome.com/docs/webstore/best-listing), and [images](https://developer.chrome.com/docs/webstore/images): describe behavior honestly, use English, and choose a relevant category. Supply a 128×128 PNG icon (96×96 artwork with transparent padding), a 440×280 promo tile, and 1–5 actual screenshots at 1280×800 or 640×400. Video and the 1400×560 marquee are optional. Use the repository as homepage, Issues as support, and PRIVACY.md as privacy URL. Verify requirements in the dashboard before upload.
- [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy): single purpose is moving/swapping the active tab by shortcut. Justify `storage` as saving the local swap preference. Declare no remote code; match data-use answers to the code and privacy policy.
- [Distribution](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution): public, unlisted, and private visibility all require review. Select visibility and regions deliberately; private trusted-tester publication still requires user approval.
- [Test instructions](https://developer.chrome.com/docs/webstore/cws-dashboard-test-instructions): no account or payment is needed to test this extension. Explain loading/binding shortcuts, both modes, and the pinned boundary.
- [Publish](https://developer.chrome.com/docs/webstore/publish): upload ZIP as a draft, complete listing/privacy/distribution fields, then submit for review. Deferred publishing prevents automatic publication; an approved staged item must be published within 30 days or returns to draft.
- [Review](https://developer.chrome.com/docs/webstore/review-process): new items and updates undergo review, which can take days or weeks. Respond to rejection reasons and developer notices; do not promise a release date.
- [Updates](https://developer.chrome.com/docs/webstore/update): increment the version, upload the complete package, update affected listing/privacy fields, and submit for another review.

## User approval and verification

Draft preparation and draft uploads are allowed. **Never submit for review, enable automatic publication, publish, or release an update without explicit user approval for that action and version.** First finish the package, run tests, and perform the README's real-Chrome checks, either yourself or with the user. Mock tests alone do not establish browser compatibility. Report what was tested and anything still unverified before requesting approval.

After the approved release is live, verify its real Chrome Web Store URL and add it to README.md and the GitHub About website field. Never invent a store URL or label a draft as published. Keep tokens, account data, and private dashboard screenshots out of the public repository.
