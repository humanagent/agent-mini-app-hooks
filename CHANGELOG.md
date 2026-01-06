# Changelog

## [0.1.5] - 2025-01-03

### Fixed

- Suppressed Vite worker file warning in optimize deps

## [0.1.4] - 2025-01-03

### Added

- Added Vercel configuration for Vite deployment

### Fixed

- Enabled dev server output by changing log level from error to info

## [0.1.3] - 2025-01-03

### Fixed

- Added missing dependencies (lucide-react, framer-motion, tailwind-merge, cmdk)
- Suppressed build warnings (chunk size, **PURE** comments)

### Changed

- Made app independent from parent workspace with local .yarnrc.yml configuration
- Updated all @xmtp packages to use specific npm versions instead of "latest"
- Updated viem to ^2.36.0 for compatibility with yarn age gate
- Removed local yarn.lock (now uses root workspace lockfile)

## [0.1.2] - 2025-01-03

### Fixed

- Fixed Vercel monorepo build by removing app-level vercel.json and using root-level configuration

## [0.1.1] - 2025-01-03

### Fixed

- Fixed agent selector search functionality to match by agent name instead of address
- Fixed Vercel build by configuring yarn as package manager in vercel.json

### Added

- Added revoke installations functionality

### Changed

- Ignored dist directory in git
