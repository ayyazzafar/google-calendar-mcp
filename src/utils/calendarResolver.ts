import { OAuth2Client } from "google-auth-library";
import { google, calendar_v3 } from "googleapis";
import { DEFAULT_CALENDAR_ID } from "../config.js";

/**
 * Cache for calendar list to avoid repeated API calls
 */
let calendarCache: calendar_v3.Schema$CalendarListEntry[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches and caches the list of calendars
 */
async function fetchCalendarList(oauth2Client: OAuth2Client): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (calendarCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return calendarCache;
    }
    
    try {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const response = await calendar.calendarList.list();
        calendarCache = response.data.items || [];
        cacheTimestamp = now;
        return calendarCache;
    } catch (error) {
        console.error("Error fetching calendar list:", error);
        // Return empty array on error, don't cache
        return [];
    }
}

/**
 * Resolves a calendar identifier (name or ID) to a calendar ID.
 * 
 * @param identifier - Can be:
 *   - A calendar ID (e.g., "primary", "work@example.com")
 *   - A calendar name/summary (e.g., "Work", "Personal")
 *   - A partial name match (case-insensitive)
 *   - null/undefined (returns default)
 * @param oauth2Client - Authenticated OAuth2 client
 * @returns The resolved calendar ID
 */
export async function resolveCalendarId(
    identifier: string | null | undefined,
    oauth2Client: OAuth2Client
): Promise<string> {
    // Use default if no identifier provided
    if (!identifier) {
        return DEFAULT_CALENDAR_ID;
    }
    
    // Common calendar IDs that should be returned as-is
    if (identifier === 'primary' || identifier.includes('@')) {
        return identifier;
    }
    
    // Try to match by name
    const calendars = await fetchCalendarList(oauth2Client);
    
    // First try exact match (case-insensitive)
    const exactMatch = calendars.find(cal => 
        cal.summary?.toLowerCase() === identifier.toLowerCase()
    );
    if (exactMatch?.id) {
        return exactMatch.id;
    }
    
    // Then try partial match (case-insensitive)
    const partialMatch = calendars.find(cal =>
        cal.summary?.toLowerCase().includes(identifier.toLowerCase())
    );
    if (partialMatch?.id) {
        return partialMatch.id;
    }
    
    // If no match found, return the identifier as-is (might be a valid ID we don't have access to list)
    return identifier;
}

/**
 * Clears the calendar cache (useful after calendar changes)
 */
export function clearCalendarCache(): void {
    calendarCache = null;
    cacheTimestamp = 0;
}