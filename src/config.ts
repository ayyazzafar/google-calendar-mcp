// Configuration module for the Google Calendar MCP server

// Default calendar ID from environment variable or fall back to 'primary'
export const DEFAULT_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';