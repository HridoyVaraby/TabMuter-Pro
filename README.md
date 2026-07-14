# Auto Website Muter

> A lightweight Manifest V3 Chrome extension that automatically and persistently mutes websites you choose.

![Auto Website Muter promotional artwork](assets/store/promo-marquee-1400x560.png)

Auto Website Muter—developed under the project name **TabMuter Pro**—stores a list of hostnames locally in Chrome. When a matching website opens or navigates, the extension mutes that tab automatically. Removing a hostname restores audio to matching open tabs immediately.

## Features

- Mute or unmute the current website from a compact popup.
- Apply changes immediately to every matching open tab.
- Automatically mute matching tabs on future visits.
- Manage saved hostnames from one scrollable list.
- Keep preferences across browser restarts with local Chrome storage.
- Work without accounts, analytics, advertisements, or network requests.

## Install from source

1. Download this repository as a ZIP and extract it, or clone it using the URL shown in GitHub's **Code** menu.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository folder containing `manifest.json`.
6. Optionally pin **Auto Website Muter** from Chrome's extensions menu.

Chrome does not automatically update unpacked extensions. Pull or download new releases, then select **Reload** on the extension card.

## Usage

1. Visit a normal `http://` or `https://` website.
2. Open the extension popup.
3. Select **Mute This Website**.
4. Select **Unmute This Website**, or use the remove button beside a saved hostname, to restore audio.

Rules match exact hostnames. For example, `music.example.com` and `www.example.com` are managed independently.

## Permissions

| Permission | Why it is required |
| --- | --- |
| `storage` | Saves the muted-hostname list in `chrome.storage.local`. |
| `tabs` | Reads tab URLs locally to compare hostnames and changes matching tabs' mute state. |

The extension processes tab URLs locally and does not transmit them. See [PRIVACY.md](PRIVACY.md) for the complete privacy disclosure.

## How it works

- `popup.js` safely parses the active tab URL with the built-in `URL` API.
- Muted hostnames are stored under `mutedDomains` in `chrome.storage.local`.
- Popup actions query open tabs and update every exact-hostname match.
- `background.js` listens for tab URL changes and applies saved rules.
- System pages such as `chrome://` URLs and `about:blank` are intentionally unsupported.

## Project structure

```text
.
├── assets/                  Icons and store artwork
├── background.js           Manifest V3 service worker
├── manifest.json           Extension metadata and permissions
├── popup.html              Popup markup and styles
├── popup.js                Popup state and tab controls
├── scripts/validate.mjs    Dependency-free repository checks
├── CONTRIBUTING.md         Contribution workflow
├── PRIVACY.md              User-data disclosure
└── LICENSE                 MIT license
```

## Development

There is no build step and no package installation. Edit the source files, reload the unpacked extension from `chrome://extensions`, and test the popup in Chrome.

Run the repository checks with:

```bash
node --check popup.js
node --check background.js
node scripts/validate.mjs
```

## Contributing and security

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a pull request.

Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), not through a public issue.

## License

The source code, documentation, and project-owned artwork are available under the [MIT License](LICENSE). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for external tooling notices.
