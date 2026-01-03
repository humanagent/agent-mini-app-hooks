# XMTP Agents

A self-contained UI for the XMTP Agents chat application.

## Getting Started

**Important**: This app uses workspace dependencies and must be run from the monorepo root.

1. Install dependencies from the monorepo root:

```bash
# From the root directory
yarn install
```

2. Run the development server:

```bash
# From the root directory
yarn xmtp-agents:dev

# Or from this directory (requires workspace context)
yarn workspace xmtp-agents dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Structure

- `components/` - All React components
- `src/` - Source files with App component and styles
- `lib/` - Utility functions
- `hooks/` - React hooks

## Features

- Self-contained UI wireframe
- All dependencies included
- No external API calls
- Fake message sending functionality
