# Privacy Policy

**Effective date:** July 14, 2026

Auto Website Muter is designed to perform its single purpose entirely inside Google Chrome: automatically muting tabs whose hostnames the user has selected.

## Data processed

The extension processes the URLs of open and updated tabs locally to extract and compare their hostnames. It stores only the user's muted-hostname list in `chrome.storage.local`.

Examples of stored values include `music.example.com` or `www.example.com`. The extension does not store full browsing histories, page contents, search queries, account information, or audio data.

## Data collection and sharing

The extension:

- Does not transmit tab URLs, hostnames, or settings to the developer or any third party.
- Does not use analytics, telemetry, tracking, advertisements, or cookies.
- Does not sell personal information.
- Does not use data for credit decisions, advertising, or purposes unrelated to muting websites.
- Does not allow humans to read user browsing data.

All processing occurs locally in the user's browser.

## Permissions

- **`storage`** stores the muted-hostname list locally so rules persist across browser restarts.
- **`tabs`** allows the extension to inspect tab URLs locally, identify matching hostnames, and update the mute state of matching tabs.

These permissions are used only to provide the extension's disclosed muting functionality.

## Retention and deletion

Muted hostnames remain in Chrome local extension storage until the user removes them, clears the extension's data, or uninstalls the extension. Users can remove individual hostnames at any time from the popup.

## Network access and third parties

The extension does not make network requests and does not integrate with third-party services. Google Chrome provides the browser APIs and controls the underlying extension storage according to the user's browser configuration.

## Chrome Web Store Limited Use disclosure

The extension's use of information received from Chrome APIs adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq/), including the Limited Use requirements. Information is used only to provide the extension's prominent, user-facing website-muting feature.

## Changes to this policy

Material privacy changes will be documented in this file and the effective date will be updated. Changes that require new permissions or data practices should also be disclosed in release notes and the Chrome Web Store listing.

## Contact

For privacy questions, open an issue in the project's GitHub repository without including private browsing data. Report security-sensitive matters privately as described in [SECURITY.md](SECURITY.md).
