import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { OAuth2Client } from "google-auth-library";
import { GaxiosError } from 'gaxios';
import { calendar_v3, google } from "googleapis";
import { resolveCalendarId } from "../../utils/calendarResolver.js";


export abstract class BaseToolHandler {
    abstract runTool(args: any, oauth2Client: OAuth2Client): Promise<CallToolResult>;

    protected handleGoogleApiError(error: unknown): void {
        if (
            error instanceof GaxiosError &&
            error.response?.data?.error === 'invalid_grant'
        ) {
            throw new Error(
                'Google API Error: Authentication token is invalid or expired. Please re-run the authentication process (e.g., `npm run auth`).'
            );
        }
        throw error;
    }

    protected getCalendar(auth: OAuth2Client): calendar_v3.Calendar {
        return google.calendar({ version: 'v3', auth });
    }
    
    /**
     * Resolves a calendar identifier (name or ID) to a calendar ID
     */
    protected async resolveCalendarIdentifier(
        identifier: string | null | undefined,
        oauth2Client: OAuth2Client
    ): Promise<string> {
        return resolveCalendarId(identifier, oauth2Client);
    }
}
