export interface EventType {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  googleEventId?: string;
  googleCalendarId?: string;
  htmlLink?: string;
}
