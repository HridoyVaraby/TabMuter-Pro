"use strict";

const STORAGE_KEY = "mutedDomains";
const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);

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

  return new Set(
    value
      .filter((domain) => typeof domain === "string")
      .map((domain) => domain.trim().toLowerCase().replace(/\.$/, ""))
      .filter(Boolean),
  );
}

async function applyMuteRule(tabId, rawUrl) {
  const hostname = getHostname(rawUrl);

  if (!hostname || !Number.isInteger(tabId)) {
    return;
  }

  try {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const mutedDomains = normalizeStoredDomains(stored[STORAGE_KEY]);

    if (mutedDomains.has(hostname)) {
      await chrome.tabs.update(tabId, { muted: true });
    }
  } catch (error) {
    // A tab can close between the event and the update; keep the worker healthy.
    console.warn(`Could not apply the mute rule for ${hostname}:`, error);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (typeof changeInfo.url === "string") {
    void applyMuteRule(tabId, changeInfo.url);
  }
});

// A newly created tab may already have a URL. If it does not, onUpdated handles
// it as soon as Chrome assigns one.
chrome.tabs.onCreated.addListener((tab) => {
  const initialUrl = tab.pendingUrl || tab.url;

  if (initialUrl) {
    void applyMuteRule(tab.id, initialUrl);
  }
});
