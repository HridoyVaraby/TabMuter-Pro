# TabMuter Pro
## Product Requirements Document (PRD)

## 1. Overview
TabMuter Pro is a lightweight Chrome Extension built with Manifest V3 that helps users automatically mute audio from selected websites or domains. The extension is designed for users who want a simple, persistent way to silence distracting or unwanted audio across tabs without manually muting each site.

### Product Goal
Allow users to manage a personal list of muted domains and ensure that all matching tabs are automatically muted, both immediately and on future visits.

### Product Name
- Canonical name: TabMuter Pro

---

## 2. Problem Statement
Many websites play audio unexpectedly, especially when multiple tabs are open. Users often need a fast and reliable way to mute specific sites without interrupting their browsing experience. TabMuter Pro solves this by providing a simple domain-based muting workflow that is persistent and automatic.

---

## 3. Objectives
The extension should:
- Provide a quick way to mute or unmute the current website.
- Automatically mute all current and future tabs matching a saved domain.
- Persist muted-domain preferences across browser restarts.
- Keep the experience lightweight, fast, and privacy-conscious.

---

## 4. Core Features
### 4.1 Domain-Based Toggle
A single action in the extension popup should allow the user to add or remove the current tab's domain from the muted list.

### 4.2 Real-Time Muting
A background service worker should monitor tab updates and apply mute state automatically when a matching domain is detected.

### 4.3 Immediate Effect
When a domain is added:
- All currently open tabs matching that domain should be muted immediately.

When a domain is removed:
- Matching tabs should be unmuted immediately.

### 4.4 Managed Domain List
The popup should display a scrollable list of all currently muted domains, with a remove action for each entry.

### 4.5 Persistent Storage
Muted domains should be stored locally in Chrome storage so they remain available after browser restarts.

---

## 5. User Stories
- As a user, I want to mute a website from the popup so I can silence unwanted audio quickly.
- As a user, I want my muted domains to persist across browser restarts so I do not need to reconfigure them.
- As a user, I want future tabs from muted domains to be muted automatically so I do not need to repeat the action.
- As a user, I want to remove a domain from the list whenever I no longer want it muted.

---

## 6. Functional Requirements
### 6.1 Manifest
- The extension must use Manifest V3.
- It must request the required permissions for storage and tab management.

### 6.2 Background Script
- The extension must run a non-persistent service worker.
- It must listen for tab updates and tab creation events.
- It must safely parse URLs using the standard URL API.
- It must match the extracted hostname against stored muted domains.
- It must apply mute state using the Chrome tabs API.

### 6.3 Popup Interface
- The popup should have a fixed width of 260px.
- It should use clean, modern typography and a simple layout.
- If the current page is not a normal web page, the primary action should be disabled and display a message such as “Can’t mute this page”.
- If the current domain is not muted, the button should read “Mute This Website”.
- If the current domain is already muted, the button should read “Unmute This Website”.
- The popup should render a scrollable list of saved domains dynamically from storage.

---

## 7. Non-Functional Requirements
- The extension should remain lightweight and fast.
- It should use minimal permissions and avoid unnecessary complexity.
- The implementation should be reliable under normal browsing activity.
- The user experience should be simple and intuitive for first-time users.

---

## 8. Technical Stack
- Platform: Google Chrome Extension
- Manifest Version: V3
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Extension APIs: chrome.storage.local, chrome.tabs, chrome.runtime
- Package Management: pnpm-friendly setup is preferred if build tooling is introduced later

---

## 9. Out of Scope
The initial version does not need to include:
- Per-tab custom mute rules beyond domain-based matching
- Cross-browser support
- Advanced scheduling or automation features
- Cloud sync or account-based configuration

---

## 10. Success Criteria
The feature is considered successful if:
- Users can mute and unmute a website from the popup in a few clicks.
- Matching tabs are muted automatically after a domain is added.
- Saved domains remain available after browser restarts.
- The extension performs reliably without noticeable lag during browsing.
