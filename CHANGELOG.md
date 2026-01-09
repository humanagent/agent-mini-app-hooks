# Changelog

## [0.1.32] - 2026-01-10

### Fixed

- Fixed infinite conversation creation loop when clicking agents in explore page
- Removed automatic conversation creation - conversations now only created when user clicks send button
- Fixed explore page to pre-select agent without auto-creating conversation

### Changed

- Removed pending conversation creation logic that caused infinite loops
- Simplified conversation creation flow to be explicit (user must send message)
- Updated explore page navigation to pass agent via location state instead of auto-creating

## [0.1.31] - 2026-01-09

### Changed

- Refactored portal structure by moving analytics and dev-portal components to portal directory
- Updated imports and references across App, sidebar, and message-list components
- Improved code organization with centralized portal components

## [0.1.30] - 2026-01-09

### Added

- Added Developer Portal page for publishing and managing XMTP agents
- Added agent CRUD operations (Create, Read, Update, Delete) with localStorage persistence
- Added developer portal navigation item in sidebar with code icon
- Added agent form component with fields: name, address, description, category, domain, image, suggestions, and live status
- Added agent list view with inline edit and delete actions
- Integrated user-submitted agents into Explore page alongside registry agents
- Added agent storage utility (`lib/agent-storage.ts`) for managing user agents

## [0.1.29] - 2026-01-09

### Changed

- Organized input area components by extracting sub-components, hooks, and dialogs into separate files
- Reduced main InputArea component from 1039 lines to 397 lines for better maintainability
- Extracted utility functions (shuffleArray, truncateAddress, appendAgentMentions) to utils.ts
- Extracted custom hooks (use-input-area-modes, use-conversation-agents, use-agent-management) to hooks folder
- Extracted dialog components (MetadataDialog, AddAgentDialog, RemoveAgentDialog) to dialogs folder
- Extracted prompt input components (PromptInput, PromptInputTextarea, etc.) to prompt-input.tsx
- Extracted agent chips and suggested actions to separate components
- Cleaned up console.log statements for production readiness
- Improved code organization with clear separation of concerns

## [0.1.28] - 2026-01-09

### Changed

- Refactored input area component by extracting unified-selector and plus-panel into separate components
- Simplified input-area/index.tsx by removing code duplication and consolidating logic
- Improved code organization and maintainability of input area components

## [0.1.27] - 2025-01-07

### Added

- Added Analytics page with agent performance metrics
- Added response time charts per agent (last 7 days)
- Added average response time trend visualization
- Added total agents count and average response time stats
- Added Analytics navigation item to sidebar with chart icon

## [0.1.26] - 2025-01-07

### Changed

- Simplified input area component by removing code duplication and consolidating button logic
- Removed unused PaperclipIcon button from message list mode
- Added + icon button in both chat area and message list modes (opens mobile options sheet in message list, agent selector in chat area)
- Converted AgentSelector from Dialog to Sheet with slide-from-bottom animation to match MobileOptionsSheet pattern
- Constrained sheet containers (AgentSelector and MobileOptionsSheet) to match input area width on desktop

## [0.1.25] - 2025-01-07

### Added

- Added floating mobile navigation button with glassmorphism styling (top-left corner)
- Added swipe-left gesture support from anywhere on the view to open sidebar on mobile
- Added instant sidebar animations (0ms duration) for immediate response

### Changed

- Optimized sidebar animation performance with GPU acceleration
- Removed edge threshold restriction for swipe gestures (now works from anywhere)

## [0.1.24] - 2025-01-07

### Fixed

- Fixed conversation filtering to ensure blocked conversations are removed properly

## [0.1.23] - 2025-01-07

### Changed

- Replaced user nav toggle icon with copy address icon for direct address copying

## [0.1.22] - 2025-01-07

### Changed

- Removed base and world icons from agent cards
- Removed deeplinks functionality from agent cards
- Removed live indicator from agent cards

## [0.1.21] - 2025-01-07

### Fixed

- Fixed "New Chat" button not clearing selected conversation when navigating to home
- Fixed loading indicators appearing on home route when no conversation is selected

## [0.1.20] - 2025-01-07

### Added

- Added message timestamps with "time ago" format (just now, 5m ago, 2h ago, etc.)
- Added animated typing dots (3 bouncing dots) to thinking indicator
- Added unread indicator dot to conversation items in sidebar
- Added last message preview (40 chars) below conversation names
- Added animated waving hand emoji to greeting message
- Added live/online pulse indicator badge on agent cards
- Added copy address button to user nav dropdown with visual feedback
- Added gradient avatar generation based on user address
- Added search/filter input on explore page for agent discovery
- Added agent count badges to category tabs
- Added keyboard shortcut (⌘K / Ctrl+K) to open agent selector with tooltip hint
- Added subtle hover glow effect to send button

### Changed

- Improved message list with timestamp display below each message
- Enhanced conversation items with last message preview for better context
- Improved thinking indicator with animated dots instead of spinner
- Enhanced agent cards with live status indicators
- Improved user navigation with gradient avatars and copy functionality
- Enhanced explore page with search and category filtering

## [0.1.19] - 2025-01-07

### Changed

- Changed user messages to blue bubbles with white text (ChatGPT-style)
- Removed accent background from active sidebar items (now uses subtle grey)
- Updated design system to use tokenized message bubble colors

### Added

- Added message bubble design tokens (`--message-user`, `--message-user-foreground`)
- Updated design system guidelines to document message bubble and sidebar active state patterns

## [0.1.18] - 2025-01-07

### Added

- Added mobile-specific design tokens for responsive typography and spacing
- Added mobile breakpoint variable (768px) matching useIsMobile hook
- Added comprehensive mobile/responsive documentation to design rules

## [0.1.17] - 2025-01-07

### Changed

- Consolidated design system into `src/index.css` (removed separate `src/design/` folder)
- Simplified design rule documentation to concise cursor rule
- Updated accent color from lime green to orange-red (#CF1C0F)
- Applied consistent styling across all UI components (minimal radius, compact spacing)
- Updated all button heights to h-7/h-8 for dense UI
- Standardized text sizes to text-xs (14px) base
- Updated all transitions to 200ms with consistent easing
- Applied dark text on accent backgrounds for accessibility

### Fixed

- Fixed CSS import order issues for Tailwind compatibility
- Removed @apply directives for Tailwind v4 compatibility
- **CRITICAL:** Removed circular CSS variable references that prevented accent color from displaying
- Increased base typography scale for better readability (12px → 14px base)
- Fixed empty chat header showing when no conversation selected
- Added left padding to sidebar content for better spacing

## [0.1.16] - 2025-01-07

### Added

- Created centralized design system in `src/design/` folder
- Added comprehensive design documentation (README.md, QUICK_REFERENCE.md)
- Added design system changelog and version tracking
- Added TypeScript exports for design tokens
- Added design utilities and animation patterns

### Changed

- Centralized all design tokens in `src/design/tokens.css`
- Updated accent color from lime green to orange-red (#CF1C0F)
- Simplified `src/index.css` to import from design system
- Applied consistent styling across all UI components (minimal radius, compact spacing)
- Updated all button heights to h-7/h-8 for dense UI
- Standardized text sizes to text-xs base
- Updated all transitions to 200ms with consistent easing
- Applied dark text on accent backgrounds for accessibility

### Fixed

- Fixed CSS import order issues for Tailwind compatibility
- Removed @apply directives for Tailwind v4 compatibility
- Fixed skeleton loading styles
- **CRITICAL:** Removed circular CSS variable references that prevented accent color from displaying
- Increased base typography scale for better readability (12px → 14px base)

## [0.1.15] - 2025-01-07

### Added

- Added toast notification system for user feedback
- Added delete confirmation dialog for conversations
- Added auto-scroll functionality to message list
- Added agent mention appending to messages for better context
- Added comprehensive design system documentation

### Changed

- Improved message scrolling behavior with scroll to bottom on new messages
- Enhanced conversation deletion with toast notifications
- Updated waiting indicator logic to clear properly when assistant responds

### Fixed

- Fixed waiting state not clearing when assistant messages arrive
- Fixed conversation deletion error handling with proper user feedback

## [0.1.14] - 2025-01-06

### Changed

- Removed echo agent from registry
- Updated gm agent to production network only
- Enabled key-check and xmtp-docs agents (set live to true)

## [0.1.13] - 2025-01-06

### Changed

- Cleaned up sidebar components: removed redundant code and console logs
- Moved ChevronUpIcon to shared icons file for consistency
- Extracted SidebarLogo component to reduce duplication
- Relocated share-button to explore folder where it's used
- Fixed type casting issues with proper consent API usage

## [0.1.12] - 2026-01-06

### Fixed

- Fixed sidebar blocking issue that prevented proper interaction
- Improved sidebar component structure and organization

### Changed

- Refactored sidebar component with better separation of concerns
- Extracted conversation item, user navigation, and utility functions into separate components
- Enhanced sheet component with improved mobile interactions
- Improved message list rendering and performance

### Added

- Added conversation-item component for better conversation rendering
- Added user-nav component for user profile navigation
- Added swipe gesture support for mobile sidebar interactions
- Added utility functions for conversation sorting and management

## [0.1.11] - 2025-01-03

### Fixed

- Fixed sidebar blocking logic to use member-based blocking instead of consent state
- Improved group conversation filtering to handle empty groups correctly

## [0.1.10] - 2025-01-03

### Changed

- Enhanced chat UI with improved components and interactions

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
