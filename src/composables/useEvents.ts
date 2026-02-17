import { ref, computed } from 'vue';
import type { EventType } from '../types/EventType';
import {
  initGoogleCalendar,
  authenticate,
  signOutGoogle,
  isAuthenticated,
  fetchGoogleCalendarEvents,
  getCalendarList,
} from '../services/googleCalendar';

export function useEvents() {
  const events = ref<EventType[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const googleConnected = ref(false);
  const initialized = ref(false);
  const calendars = ref<Array<{ id: string; summary: string; primary: boolean }>>([]);
  const selectedCalendarId = ref<string>('primary');

  const initGoogle = async () => {
    if (initialized.value) return;

    try {
      loading.value = true;
      error.value = null;
      await initGoogleCalendar();
      initialized.value = true;
      googleConnected.value = isAuthenticated();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize Google Calendar';
      console.error('Google Calendar init error:', err);
    } finally {
      loading.value = false;
    }
  };

  const connectGoogle = async () => {
    try {
      loading.value = true;
      error.value = null;

      if (!initialized.value) {
        await initGoogle();
      }

      await authenticate();
      googleConnected.value = true;

      calendars.value = await getCalendarList();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to connect to Google Calendar';
      console.error('Google Calendar auth error:', err);
    } finally {
      loading.value = false;
    }
  };

  const disconnectGoogle = () => {
    signOutGoogle();
    googleConnected.value = false;
    events.value = [];
    calendars.value = [];
  };

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    if (!googleConnected.value) {
      return;
    }

    try {
      loading.value = true;
      error.value = null;

      const googleEvents = await fetchGoogleCalendarEvents(
        startDate,
        endDate,
        selectedCalendarId.value
      );

      events.value = googleEvents;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('Fetch events error:', err);
    } finally {
      loading.value = false;
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.value.filter((event) => {
      const eventStartDate = new Date(event.startDate).toISOString().split('T')[0];
      const eventEndDate = event.endDate
        ? new Date(event.endDate).toISOString().split('T')[0]
        : eventStartDate;

      return dateStr >= eventStartDate && dateStr <= eventEndDate;
    });
  };

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.value.filter((event) => {
      if (event.allDay) return false;

      const eventStart = new Date(event.startDate);
      return (
        eventStart.getDate() === date.getDate() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getHours() === hour
      );
    });
  };

  const getAllDayEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.value.filter((event) => {
      if (!event.allDay) return false;

      const eventStartDate = event.startDate.split('T')[0];
      const eventEndDate = event.endDate
        ? event.endDate.split('T')[0]
        : eventStartDate;

      return dateStr >= eventStartDate && dateStr <= eventEndDate;
    });
  };

  return {
    events,
    loading,
    error,
    googleConnected,
    initialized,
    calendars,
    selectedCalendarId,
    initGoogle,
    connectGoogle,
    disconnectGoogle,
    fetchEvents,
    getEventsForDate,
    getEventsForDateAndHour,
    getAllDayEventsForDate,
  };
}
