# Mizuki upstream audit

- Source: https://github.com/matsuzaka-yuki/Mizuki.git
- Imported commit: 14da4262d8aa1d93dc8cff11705f14918ed7369f
- Commit metadata: GitHub merge commit dated 2026-08-10, RSA signature present; local GPG key database was unavailable, so trust verification is incomplete.
- License: Apache-2.0, with original Fuwari MIT license and third-party notices retained.
- Runtime: Node 20+ upstream; this machine uses Node 26.7.0.
- Package manager: pnpm 11.5.3, lockfile version 9.
- Direct dependencies: 50 runtime and 20 development dependencies.
- Lifecycle risks found: `predev` and `prebuild` run content synchronization; `build` runs anime updates; the original layout contains a hard-coded Google Tag Manager noscript URL.
- Allowed native builds: only `esbuild`, `sharp`, and `ttf2woff2` in `pnpm-workspace.yaml`.
- Decision: remove network-capable lifecycle hooks and analytics integration before installation; install with the frozen lockfile.
