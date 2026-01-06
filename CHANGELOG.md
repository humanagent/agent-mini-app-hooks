# Changelog

## [0.1.9] - 2025-01-03

### Added

- Added copy icon below each agent message for easy content copying

## [0.1.8] - 2025-01-03

### Fixed

- Fixed agent click functionality in explore page to properly create conversations
- Improved error handling and user feedback when creating conversations with agents

### Added

- Added explore page with agent browsing and search functionality
- Added agent card component for displaying agent information
- Added thinking indicator component for loading states
- Added comprehensive logging for conversation creation flow
- Added documentation for OPFS troubleshooting in browser-sdk rules

## [0.1.7] - 2025-01-03

### Fixed

- Fixed OPFS database conflicts by implementing proper singleton pattern for XMTP client initialization
- Fixed race condition in client creation that caused "Access Handles cannot be created" errors
- Fixed multiple private key generation by adding account key caching

### Added

- Added `isCreatingClient` guard to prevent concurrent Client.create() calls
- Added `isInitializing` flag to prevent race conditions in singleton pattern
- Added account key caching to ensure consistent key usage across initialization attempts
- Added enhanced logging for debugging client initialization issues

## [0.1.6] - 2025-01-03

### Added

- Added comprehensive XMTP authentication logging throughout client initialization
- Added detailed error logging for client creation failures
- Added account key persistence to localStorage to prevent regeneration on each load
- Added timeout detection for hanging client creation (30s timeout)
- Added initialization guard to prevent infinite loops in React Strict Mode

### Fixed

- Fixed infinite loop in useXMTPClient hook by preventing multiple initializations
- Fixed Dialog accessibility warnings by adding DialogDescription components
- Fixed codec logging to show actual class names instead of undefined values

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
