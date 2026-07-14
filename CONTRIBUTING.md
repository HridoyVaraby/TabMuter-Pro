# Contributing

Thank you for helping improve Auto Website Muter. Contributions of code, documentation, tests, accessibility fixes, and design refinements are welcome.

## Before starting

- Search existing issues to avoid duplicating work.
- Open an issue before making a large architectural or permission change.
- Keep the extension's single purpose: automatically managing audio mute rules by hostname.
- Do not add analytics, advertising, remote code, or new permissions without prior discussion.

## Local development

1. Fork and clone the repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** and select **Load unpacked**.
4. Choose the repository root.
5. After code changes, select **Reload** on the extension card.

No dependencies or build tools are required.

## Required checks

Run these commands before submitting a pull request:

```bash
node --check popup.js
node --check background.js
node scripts/validate.mjs
```

Manually verify at least the behavior affected by your change:

- Muting the current hostname updates every matching open tab.
- Unmuting or removing a hostname restores matching tabs.
- Saved rules survive closing and reopening Chrome.
- New navigation to a saved hostname is muted automatically.
- Restricted pages keep the primary action disabled.
- The popup remains keyboard accessible at 260 pixels wide.

## Code guidelines

- Use plain JavaScript and browser-native APIs.
- Prefer small functions with explicit names and early returns.
- Parse URLs with the standard `URL` API and handle invalid input.
- Treat values read from extension storage as untrusted data.
- Avoid `innerHTML`, inline event handlers, and remote scripts.
- Preserve exact-hostname matching unless a behavior change is approved.
- Add comments only where they explain a non-obvious decision.

## Pull requests

- Keep each pull request focused on one change.
- Explain the problem, the solution, and how you tested it.
- Include before-and-after images for visible popup changes.
- Update the README, privacy policy, or permission explanations when behavior changes.
- Link the related issue when one exists.

By contributing, you agree that your contribution is licensed under the repository's [MIT License](LICENSE).
