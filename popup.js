"use strict";

const STORAGE_KEY = "mutedDomains";
const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);

const toggleButton = document.querySelector("#toggle-button");
const statusMessage = document.querySelector("#status");
const domainList = document.querySelector("#domain-list");
const domainCount = document.querySelector("#domain-count");
const emptyState = document.querySelector("#empty-state");

let currentHostname = null;
let mutedDomains = [];
let isBusy = false;

/**
 * Returns a normalized hostname for a standard web URL, or null when the URL
 * cannot represent a website that Chrome allows this extension to manage.
 */
function getHostname(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.length === 0) {
    return null;
  }

  try {
    const parsedUrl = new URL(rawUrl);

    if (!SUPPORTED_PROTOCOLS.has(parsedUrl.protocol) || !parsedUrl.hostname) {
      return null;
    }

    return parsedUrl.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

function normalizeStoredDomains(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(
    value
      .filter((domain) => typeof domain === "string")
      .map((domain) => domain.trim().toLowerCase().replace(/\.$/, ""))
      .filter(Boolean),
  )].sort((first, second) => first.localeCompare(second));
}

async function readMutedDomains() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return normalizeStoredDomains(stored[STORAGE_KEY]);
}

async function saveMutedDomains(domains) {
  mutedDomains = normalizeStoredDomains(domains);
  await chrome.storage.local.set({ [STORAGE_KEY]: mutedDomains });
}

/** Applies a mute state to every open tab whose hostname matches exactly. */
async function updateMatchingTabs(hostname, muted) {
  const tabs = await chrome.tabs.query({});
  const matchingTabs = tabs.filter(
    (tab) =>
      Number.isInteger(tab.id) &&
      [tab.url, tab.pendingUrl].some(
        (candidateUrl) => getHostname(candidateUrl) === hostname,
      ),
  );

  const results = await Promise.allSettled(
    matchingTabs.map((tab) => chrome.tabs.update(tab.id, { muted })),
  );

  return results.filter((result) => result.status === "rejected").length;
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#dc3545" : "";
}

function updateToggleButton() {
  const isMuted = currentHostname !== null && mutedDomains.includes(currentHostname);

  toggleButton.classList.toggle("is-unmute", isMuted);

  if (!currentHostname) {
    toggleButton.textContent = "Can’t Mute This Page";
    toggleButton.disabled = true;
    return;
  }

  toggleButton.textContent = isMuted
    ? "Unmute This Website"
    : "Mute This Website";
  toggleButton.disabled = isBusy;
}

function renderDomainList() {
  const fragment = document.createDocumentFragment();

  for (const domain of mutedDomains) {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const removeButton = document.createElement("button");

    name.className = "domain-name";
    name.textContent = domain;
    name.title = domain;

    removeButton.className = "remove-button";
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Unmute and remove ${domain}`);
    removeButton.dataset.domain = domain;

    item.append(name, removeButton);
    fragment.append(item);
  }

  domainList.replaceChildren(fragment);
  emptyState.hidden = mutedDomains.length > 0;
  domainCount.textContent = String(mutedDomains.length);
  domainCount.setAttribute(
    "aria-label",
    `${mutedDomains.length} muted ${mutedDomains.length === 1 ? "domain" : "domains"}`,
  );
  updateToggleButton();
}

async function toggleCurrentDomain() {
  if (!currentHostname || isBusy) {
    return;
  }

  isBusy = true;
  updateToggleButton();
  setStatus("");

  const wasMuted = mutedDomains.includes(currentHostname);
  const nextDomains = wasMuted
    ? mutedDomains.filter((domain) => domain !== currentHostname)
    : [...mutedDomains, currentHostname];

  try {
    await saveMutedDomains(nextDomains);
    const failedUpdates = await updateMatchingTabs(currentHostname, !wasMuted);

    renderDomainList();
    setStatus(
      failedUpdates === 0
        ? `${currentHostname} is now ${wasMuted ? "unmuted" : "muted"}.`
        : `Rule saved; ${failedUpdates} tab update failed.`,
      failedUpdates > 0,
    );
  } catch (error) {
    mutedDomains = await readMutedDomains().catch(() => mutedDomains);
    renderDomainList();
    setStatus("Could not update this website. Please try again.", true);
    console.error("Failed to toggle muted domain:", error);
  } finally {
    isBusy = false;
    updateToggleButton();
  }
}

async function removeDomain(domain, button) {
  if (isBusy || !mutedDomains.includes(domain)) {
    return;
  }

  isBusy = true;
  button.disabled = true;
  toggleButton.disabled = true;
  setStatus("");

  try {
    await saveMutedDomains(mutedDomains.filter((item) => item !== domain));
    const failedUpdates = await updateMatchingTabs(domain, false);

    renderDomainList();
    setStatus(
      failedUpdates === 0
        ? `${domain} was removed and unmuted.`
        : `Domain removed; ${failedUpdates} tab update failed.`,
      failedUpdates > 0,
    );
  } catch (error) {
    mutedDomains = await readMutedDomains().catch(() => mutedDomains);
    renderDomainList();
    setStatus("Could not remove this website. Please try again.", true);
    console.error("Failed to remove muted domain:", error);
  } finally {
    isBusy = false;
    updateToggleButton();
  }
}

domainList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-button");

  if (removeButton) {
    void removeDomain(removeButton.dataset.domain, removeButton);
  }
});

toggleButton.addEventListener("click", () => {
  void toggleCurrentDomain();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[STORAGE_KEY] || isBusy) {
    return;
  }

  mutedDomains = normalizeStoredDomains(changes[STORAGE_KEY].newValue);
  renderDomainList();
});

async function initializePopup() {
  try {
    const [tabs, storedDomains] = await Promise.all([
      chrome.tabs.query({ active: true, currentWindow: true }),
      readMutedDomains(),
    ]);

    currentHostname = getHostname(tabs[0]?.url);
    mutedDomains = storedDomains;
    renderDomainList();

    if (!currentHostname) {
      setStatus("Open a regular http or https page to use this action.");
    }
  } catch (error) {
    currentHostname = null;
    mutedDomains = [];
    renderDomainList();
    setStatus("The extension could not load its settings.", true);
    console.error("Failed to initialize popup:", error);
  }
}

void initializePopup();
