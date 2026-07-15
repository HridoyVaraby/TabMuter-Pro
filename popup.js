"use strict";

const STORAGE_KEY = "mutedDomains";
const HIDDEN_STORAGE_KEY = "hiddenDomains";
const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);
const MASKED_DOMAIN = "••••••••";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const toggleButton = document.querySelector("#toggle-button");
const statusMessage = document.querySelector("#status");
const domainList = document.querySelector("#domain-list");
const domainCount = document.querySelector("#domain-count");
const emptyState = document.querySelector("#empty-state");

let currentHostname = null;
let mutedDomains = [];
let hiddenDomains = [];
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

async function readSettings() {
  const stored = await chrome.storage.local.get([
    STORAGE_KEY,
    HIDDEN_STORAGE_KEY,
  ]);
  const storedMutedDomains = normalizeStoredDomains(stored[STORAGE_KEY]);
  const storedHiddenDomains = normalizeStoredDomains(
    stored[HIDDEN_STORAGE_KEY],
  ).filter((domain) => storedMutedDomains.includes(domain));

  return {
    mutedDomains: storedMutedDomains,
    hiddenDomains: storedHiddenDomains,
  };
}

async function saveSettings(domains, hidden = hiddenDomains) {
  mutedDomains = normalizeStoredDomains(domains);
  hiddenDomains = normalizeStoredDomains(hidden).filter((domain) =>
    mutedDomains.includes(domain),
  );

  await chrome.storage.local.set({
    [STORAGE_KEY]: mutedDomains,
    [HIDDEN_STORAGE_KEY]: hiddenDomains,
  });
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

function setBusy(nextBusy) {
  isBusy = nextBusy;
  updateToggleButton();

  for (const button of domainList.querySelectorAll("button")) {
    button.disabled = nextBusy;
  }
}

function createSvgIcon(paths) {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");

  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  for (const pathData of paths) {
    const path = document.createElementNS(SVG_NAMESPACE, "path");
    path.setAttribute("d", pathData);
    svg.append(path);
  }

  return svg;
}

function createPrivacyButton(domain, isHidden) {
  const button = document.createElement("button");
  const label = isHidden ? "Reveal hidden domain" : `Hide ${domain}`;
  const iconPaths = isHidden
    ? [
        "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z",
        "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
      ]
    : [
        "M3 3l18 18",
        "M10.6 10.6a2 2 0 0 0 2.8 2.8",
        "M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a17.7 17.7 0 0 1-2.1 3.2",
        "M6.6 6.6C3.5 8.7 2 12 2 12s3.5 8 10 8a10.4 10.4 0 0 0 5.4-1.6",
      ];

  button.className = "icon-button privacy-button";
  button.classList.toggle("is-hidden", isHidden);
  button.type = "button";
  button.dataset.domain = domain;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.append(createSvgIcon(iconPaths));

  return button;
}

function renderDomainList() {
  const fragment = document.createDocumentFragment();

  for (const domain of mutedDomains) {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const actions = document.createElement("div");
    const isHidden = hiddenDomains.includes(domain);
    const privacyButton = createPrivacyButton(domain, isHidden);
    const removeButton = document.createElement("button");

    name.className = "domain-name";
    name.classList.toggle("is-hidden", isHidden);
    name.textContent = isHidden ? MASKED_DOMAIN : domain;
    name.title = isHidden ? "Hidden domain" : domain;
    name.setAttribute("aria-label", isHidden ? "Hidden domain" : domain);

    actions.className = "domain-actions";

    removeButton.className = "icon-button remove-button";
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute(
      "aria-label",
      isHidden ? "Unmute and remove hidden domain" : `Unmute and remove ${domain}`,
    );
    removeButton.dataset.domain = domain;

    actions.append(privacyButton, removeButton);
    item.append(name, actions);
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

  if (isBusy) {
    setBusy(true);
  }
}

async function toggleCurrentDomain() {
  if (!currentHostname || isBusy) {
    return;
  }

  setBusy(true);
  setStatus("");

  const wasMuted = mutedDomains.includes(currentHostname);
  const wasHidden = hiddenDomains.includes(currentHostname);
  const nextDomains = wasMuted
    ? mutedDomains.filter((domain) => domain !== currentHostname)
    : [...mutedDomains, currentHostname];
  const nextHiddenDomains = wasMuted
    ? hiddenDomains.filter((domain) => domain !== currentHostname)
    : hiddenDomains;

  try {
    await saveSettings(nextDomains, nextHiddenDomains);
    const failedUpdates = await updateMatchingTabs(currentHostname, !wasMuted);

    renderDomainList();
    setStatus(
      failedUpdates === 0
        ? wasHidden
          ? "The hidden domain is now unmuted."
          : `${currentHostname} is now ${wasMuted ? "unmuted" : "muted"}.`
        : `Rule saved; ${failedUpdates} tab update failed.`,
      failedUpdates > 0,
    );
  } catch (error) {
    const settings = await readSettings().catch(() => null);

    if (settings) {
      ({ mutedDomains, hiddenDomains } = settings);
    }

    renderDomainList();
    setStatus("Could not update this website. Please try again.", true);
    console.error("Failed to toggle muted domain:", error);
  } finally {
    setBusy(false);
  }
}

async function toggleDomainVisibility(domain) {
  if (isBusy || !mutedDomains.includes(domain)) {
    return;
  }

  setBusy(true);
  setStatus("");

  const wasHidden = hiddenDomains.includes(domain);
  const nextHiddenDomains = wasHidden
    ? hiddenDomains.filter((item) => item !== domain)
    : [...hiddenDomains, domain];

  try {
    await saveSettings(mutedDomains, nextHiddenDomains);
    renderDomainList();
    setStatus(wasHidden ? "Domain revealed." : "Domain hidden.");
  } catch (error) {
    const settings = await readSettings().catch(() => null);

    if (settings) {
      ({ mutedDomains, hiddenDomains } = settings);
    }

    renderDomainList();
    setStatus("Could not change domain visibility. Please try again.", true);
    console.error("Failed to change domain visibility:", error);
  } finally {
    setBusy(false);
  }
}

async function removeDomain(domain, button) {
  if (isBusy || !mutedDomains.includes(domain)) {
    return;
  }

  const wasHidden = hiddenDomains.includes(domain);

  setBusy(true);
  button.disabled = true;
  setStatus("");

  try {
    await saveSettings(
      mutedDomains.filter((item) => item !== domain),
      hiddenDomains.filter((item) => item !== domain),
    );
    const failedUpdates = await updateMatchingTabs(domain, false);

    renderDomainList();
    setStatus(
      failedUpdates === 0
        ? wasHidden
          ? "The hidden domain was removed and unmuted."
          : `${domain} was removed and unmuted.`
        : `Domain removed; ${failedUpdates} tab update failed.`,
      failedUpdates > 0,
    );
  } catch (error) {
    const settings = await readSettings().catch(() => null);

    if (settings) {
      ({ mutedDomains, hiddenDomains } = settings);
    }

    renderDomainList();
    setStatus("Could not remove this website. Please try again.", true);
    console.error("Failed to remove muted domain:", error);
  } finally {
    setBusy(false);
  }
}

domainList.addEventListener("click", (event) => {
  const privacyButton = event.target.closest(".privacy-button");
  const removeButton = event.target.closest(".remove-button");

  if (privacyButton) {
    void toggleDomainVisibility(privacyButton.dataset.domain);
  } else if (removeButton) {
    void removeDomain(removeButton.dataset.domain, removeButton);
  }
});

toggleButton.addEventListener("click", () => {
  void toggleCurrentDomain();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  const mutedDomainsChanged = changes[STORAGE_KEY];
  const hiddenDomainsChanged = changes[HIDDEN_STORAGE_KEY];

  if (
    areaName !== "local" ||
    (!mutedDomainsChanged && !hiddenDomainsChanged) ||
    isBusy
  ) {
    return;
  }

  if (mutedDomainsChanged) {
    mutedDomains = normalizeStoredDomains(mutedDomainsChanged.newValue);
  }

  if (hiddenDomainsChanged) {
    hiddenDomains = normalizeStoredDomains(hiddenDomainsChanged.newValue);
  }

  hiddenDomains = hiddenDomains.filter((domain) => mutedDomains.includes(domain));
  renderDomainList();
});

async function initializePopup() {
  try {
    const [tabs, settings] = await Promise.all([
      chrome.tabs.query({ active: true, currentWindow: true }),
      readSettings(),
    ]);

    currentHostname = getHostname(tabs[0]?.url);
    ({ mutedDomains, hiddenDomains } = settings);
    renderDomainList();

    if (!currentHostname) {
      setStatus("Open a regular http or https page to use this action.");
    }
  } catch (error) {
    currentHostname = null;
    mutedDomains = [];
    hiddenDomains = [];
    renderDomainList();
    setStatus("The extension could not load its settings.", true);
    console.error("Failed to initialize popup:", error);
  }
}

void initializePopup();
