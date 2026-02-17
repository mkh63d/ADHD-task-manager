import type { EventType } from '../types/EventType';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;
let accessToken: string | null = null;

// Load the Google API script
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

// Initialize the Google API client
const initializeGapiClient = async (): Promise<void> => {
  await gapi.client.init({
    apiKey: GOOGLE_API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
};

// Initialize Google Identity Services
const initializeGis = (): Promise<void> => {
  return new Promise((resolve) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error !== undefined) {
          throw response;
        }
        accessToken = response.access_token;
      },
    });
    gisInited = true;
    resolve();
  });
};

// Initialize both libraries
export const initGoogleCalendar = async (): Promise<void> => {
  try {
    await loadScript('https://apis.google.com/js/api.js');
    await loadScript('https://accounts.google.com/gsi/client');

    await new Promise<void>((resolve) => {
      gapi.load('client', async () => {
        await initializeGapiClient();
        resolve();
      });
    });

    await initializeGis();
  } catch (error) {
    console.error('Error initializing Google Calendar:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return accessToken !== null;
};

// Request access token (shows Google sign-in popup)
export const authenticate = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Identity Services not initialized'));
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error !== undefined) {
        reject(response);
        return;
      }
      accessToken = response.access_token;
      resolve();
    };

    if (accessToken === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const signOutGoogle = (): void => {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null;
    });
  }
};

export const fetchGoogleCalendarEvents = async (
  timeMin: Date,
  timeMax: Date,
  calendarId: string = 'primary'
): Promise<EventType[]> => {
  if (!gapiInited || !accessToken) {
    throw new Error('Google Calendar not initialized or not authenticated');
  }

  try {
    const response = await gapi.client.calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.result.items || [];

    return events.map((event: gapi.client.calendar.Event): EventType => ({
      id: `google-${event.id}`,
      title: event.summary || 'Untitled Event',
      description: event.description || null,
      location: event.location || null,
      startDate: event.start?.dateTime || event.start?.date || '',
      endDate: event.end?.dateTime || event.end?.date || null,
      allDay: !event.start?.dateTime,
      googleEventId: event.id || undefined,
      googleCalendarId: calendarId,
      htmlLink: event.htmlLink || undefined,
    }));
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

export const getCalendarList = async (): Promise<
  Array<{ id: string; summary: string; primary: boolean }>
> => {
  if (!gapiInited || !accessToken) {
    throw new Error('Google Calendar not initialized or not authenticated');
  }

  try {
    const response = await gapi.client.calendar.calendarList.list();
    const calendars = response.result.items || [];

    return calendars.map((cal) => ({
      id: cal.id || '',
      summary: cal.summary || 'Unnamed Calendar',
      primary: cal.primary || false,
    }));
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    throw error;
  }
};
