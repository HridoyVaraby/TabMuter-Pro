# Security Policy

## Supported versions

Security fixes are applied to the latest released version and the default branch. Older versions may not receive patches.

## Reporting a vulnerability

Please do not report a suspected vulnerability in a public issue.

Use the repository's **Security** tab to open a private vulnerability report through GitHub Security Advisories. If private reporting is unavailable, contact a maintainer through a private method listed on their GitHub profile.

Include:

- A concise description of the vulnerability and its impact.
- The affected extension version and Chrome version.
- Reproduction steps or a minimal proof of concept.
- Any suggested mitigation, if available.

Do not access data that is not yours, disrupt other users, or perform testing against systems without authorization. Maintainers will acknowledge valid reports and coordinate disclosure on a best-effort basis.

## Security design

TabMuter Pro:

- Uses Manifest V3 and a non-persistent service worker.
- Does not execute remote code.
- Does not inject scripts into websites.
- Does not send browsing activity or settings over the network.
- Stores only muted hostnames and their popup masking preferences in local extension storage.
- Uses the `storage` and `tabs` permissions for its user-facing feature.
