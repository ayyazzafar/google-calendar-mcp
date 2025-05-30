# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build and Development
- `npm run build` - Type-check and build the project (runs esbuild)
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm start` - Run the built MCP server
- `npm run auth` - Run the authentication server for OAuth2 setup

### Testing
- `npm test` - Run all tests once with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run coverage` - Run tests with coverage report

## Architecture Overview

This is a Model Context Protocol (MCP) server for Google Calendar integration, built with TypeScript and the MCP SDK.

### Configuration

- Default calendar ID can be set via `GOOGLE_CALENDAR_ID` environment variable (defaults to 'primary')
- Use `.env` file with `./start.sh` or set environment variable directly
- Calendar resolution supports both IDs and names (e.g., "Work", "Personal", "primary")
- Partial name matching is supported for calendar selection

### Key Components

1. **MCP Server** (`src/index.ts`): Main entry point that initializes the MCP server, handles authentication, and routes tool requests.

2. **Authentication System** (`src/auth/`):
   - OAuth2 client setup with Google APIs
   - Token persistence with automatic refresh
   - Separate auth server for initial setup (`auth-server.ts`)
   - Tokens stored in `~/.google-calendar-mcp/`

3. **Tool Handlers** (`src/handlers/`):
   - All handlers extend `BaseToolHandler` for consistent error handling
   - Each Google Calendar operation has its own handler in `src/handlers/core/`
   - Tool routing handled by `callTool.ts` using a handler map

4. **Type Safety** (`src/schemas/`):
   - Strong TypeScript interfaces for all data structures
   - Zod validation for input parameters
   - Shared types between handlers

### Authentication Flow

The server requires OAuth2 authentication with Google Calendar API:
1. First run: `npm run auth` opens browser for consent
2. Tokens are saved locally with secure permissions (0o600)
3. Automatic token refresh on subsequent runs
4. Manual re-auth needed if refresh fails

### Adding New Tools

To add a new calendar tool:
1. Create handler in `src/handlers/core/` extending `BaseToolHandler`
2. Add tool definition to `src/handlers/listTools.ts`
3. Register handler in the `handlerMap` in `src/handlers/callTool.ts`
4. Define input/output types in `src/schemas/`

### Testing

Tests use Vitest and follow the pattern `*.test.ts`. The test suite includes unit tests for handlers and integration tests for the MCP server.

## Troubleshooting

### Node.js Compatibility

This project requires Node.js 18 or higher due to ES module support. The `start.sh` script includes automatic version checking.

If you encounter errors like:
- `SyntaxError: Unexpected token {`
- `SyntaxError: Unexpected token '.'` (optional chaining)
- Import statement errors

These indicate an older Node.js version is being used. To fix:

1. Check your Node.js version: `node --version`
2. If using Claude Desktop and it's using an older Node.js, set `NODE_PATH` in `.env`:
   ```bash
   NODE_PATH=/path/to/node18+/bin/node
   ```
3. The start.sh script will use this path and verify compatibility

### Common Issues

1. **Authentication tokens not found**: Run `npm run auth` to set up OAuth2
2. **Build errors**: Ensure all dependencies are installed with `npm install`
3. **Token expiration**: Google test apps expire tokens after 7 days, re-auth when needed