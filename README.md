# TabMuter Pro — Automatically Mute Websites and Chrome Tabs

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-007BFF)](manifest.json)
[![MIT License](https://img.shields.io/badge/License-MIT-28A745)](LICENSE)
[![Privacy Friendly](https://img.shields.io/badge/Privacy-No%20Tracking-18212F)](PRIVACY.md)

**TabMuter Pro is a free, open-source Chrome extension that automatically and persistently mutes audio from selected websites, domains, and browser tabs.** Stop autoplay audio and noisy tabs with private, local-only rules built on Chrome Manifest V3.

![TabMuter Pro Chrome extension automatically muting website and tab audio](assets/github-social-preview-1280x640.png)

[Install from source](#install-from-source) · [How it works](#how-it-works) · [Privacy](PRIVACY.md) · [Contributing](CONTRIBUTING.md) · [Report a bug](https://github.com/HridoyVaraby/TabMuter-Pro/issues/new/choose)

TabMuter Pro stores a list of exact hostnames locally in Chrome. When a matching website opens or navigates, the extension automatically mutes that tab. Removing a hostname restores audio to matching open tabs immediately.

## Features

- Mute or unmute the current website from a compact popup.
- Apply changes immediately to every matching open tab.
- Automatically mute matching tabs on future visits.
- Manage saved hostnames from one scrollable list.
- Hide sensitive hostnames behind password-style masking and reveal them with the eye button.
- Keep preferences across browser restarts with local Chrome storage.
- Work without accounts, analytics, advertisements, or network requests.

## Why use TabMuter Pro?

- **Stop autoplay audio:** silence websites that repeatedly start unwanted music, videos, or notification sounds.
- **Mute every matching tab:** one action updates all open tabs from the selected hostname.
- **Keep websites muted:** saved domain rules continue working after Chrome restarts.
- **Protect browsing privacy:** URLs are processed locally and no browsing data leaves the browser.
- **Stay lightweight:** plain JavaScript, no dependencies, no content scripts, and no remote code.

Common use cases include muting news sites with autoplay videos, silencing social media tabs, blocking unexpected notification sounds, and keeping selected streaming or game websites quiet while working.

## Install from source

1. Download this repository as a ZIP and extract it, or clone it using the URL shown in GitHub's **Code** menu.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository folder containing `manifest.json`.
6. Optionally pin **TabMuter Pro** from Chrome's extensions menu.

Chrome does not automatically update unpacked extensions. Pull or download new releases, then select **Reload** on the extension card.

## Usage

1. Visit a normal `http://` or `https://` website.
2. Open the extension popup.
3. Select **Mute This Website**.
4. Select **Unmute This Website**, or use the remove button beside a saved hostname, to restore audio.
5. Use the crossed-eye button beside a saved hostname to mask it. Select the eye button to reveal it again.

Rules match exact hostnames. For example, `music.example.com` and `www.example.com` are managed independently.

## TabMuter Pro vs. manual Chrome tab muting

| Capability | TabMuter Pro | Manual tab mute |
| --- | --- | --- |
| Mute every matching open tab | Yes | One tab at a time |
| Remember muted websites | Yes | No persistent domain list |
| Automatically mute future visits | Yes | No |
| Local-only settings | Yes | Not applicable |
| Accounts or subscriptions | None | None |

## Permissions

| Permission | Why it is required |
| --- | --- |
| `storage` | Saves the muted-hostname list in `chrome.storage.local`. |
| `tabs` | Reads tab URLs locally to compare hostnames and changes matching tabs' mute state. |

The extension processes tab URLs locally and does not transmit them. See [PRIVACY.md](PRIVACY.md) for the complete privacy disclosure.

## How it works

- `popup.js` safely parses the active tab URL with the built-in `URL` API.
- Muted hostnames are stored under `mutedDomains` in `chrome.storage.local`.
- Hidden-list preferences are stored under `hiddenDomains`; hiding a hostname only masks it in the popup and does not change its mute rule.
- Popup actions query open tabs and update every exact-hostname match.
- `background.js` listens for tab URL changes and applies saved rules.
- System pages such as `chrome://` URLs and `about:blank` are intentionally unsupported.

## Frequently asked questions

### How do I automatically mute a website in Chrome?

Open the website, select the TabMuter Pro extension icon, and choose **Mute This Website**. The hostname is saved locally and matching tabs are muted immediately and on future visits.

### Does it mute every tab from the same website?

Yes. Adding or removing a rule updates every open tab whose exact hostname matches the current website.

### Will muted websites stay muted after restarting Chrome?

Yes. TabMuter Pro stores domain rules in `chrome.storage.local`, so they persist until you remove them or uninstall the extension.

### Does the extension collect browsing history?

No. It reads open tab URLs only inside Chrome to compare hostnames. It does not transmit, sell, or analyze browsing activity.

### Does one rule include every subdomain?

No. Rules use exact hostnames for predictable behavior. `example.com`, `www.example.com`, and `music.example.com` can be controlled independently.

## Built with

- Google Chrome Extensions API
- Chrome Manifest V3 service worker
- Vanilla JavaScript, HTML5, and CSS3
- `chrome.tabs` and `chrome.storage.local`

## Project structure

```text
.
├── assets/                  Icons and store artwork
├── background.js           Manifest V3 service worker
├── manifest.json           Extension metadata and permissions
├── popup.html              Popup markup and styles
├── popup.js                Popup state and tab controls
├── scripts/validate.mjs    Dependency-free repository checks
├── codemeta.json           Search-friendly project metadata
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

All contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a pull request. Contributors whose work is merged will be acknowledged in this README.

Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), not through a public issue.

## Maintainer and contributors

TabMuter Pro was created and is maintained by **Hridoy Varaby** — [varabit.com](https://varabit.com).

Contributors are an important part of this open-source project. Every contribution is welcome, and contributors will be recognized in this section as the community grows.

### Contributors

- **Hridoy Varaby** — creator and maintainer

## License

The source code, documentation, and project-owned artwork are available under the [MIT License](LICENSE). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for external tooling notices.

## Repository topics

`chrome-extension` · `chrome-extension-mv3` · `manifest-v3` · `tab-muter` · `website-muter` · `mute-tabs` · `audio-control` · `browser-extension` · `javascript` · `privacy-friendly` · `open-source` · `productivity`
