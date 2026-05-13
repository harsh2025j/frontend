import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const appointmentsService = {
  createAppointment: async (data: any) => {
    return apiClient.post(API_ENDPOINTS.APPOINTMENTS.CREATE, data);
  },
  fetchById: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.FETCH_BY_ID.replace(':id', id));
  },
  fetchByAdvocate: async (advocateId: string) => {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.FETCH_BY_ADVOCATE.replace(':advocateId', advocateId));
  },
  fetchByClient: async (email?: string) => {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.FETCH_BY_CLIENT, {
      params: email ? { email } : {}
    });
  },
  getUnreadCount: async (advocateId: string) => {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.GET_UNREAD_COUNT.replace(':advocateId', advocateId));
  },
  markRead: async (id: string) => {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.MARK_READ.replace(':id', id));
  },
  update: async (id: string, data: any) => {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.FETCH_BY_ID.replace(':id', id), data);
  },
  updateStatus: async (id: string, status: string) => {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS.replace(':id', id), { status });
  },

  // ─── Case Management Integration Methods ───

  fetchByCase: async (caseId: string) => {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.FETCH_BY_CASE.replace(':caseId', caseId));
  },
  updateOutcome: async (id: string, outcome: string) => {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.UPDATE_OUTCOME.replace(':id', id), { outcome });
  },
  cancelWithReason: async (id: string, cancellationReason: string) => {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.CANCEL.replace(':id', id), { cancellationReason });
  },
};

// ─── ICS Calendar File Generator ───

export function generateIcsFile(appointment: {
  preferredDate: string;
  preferredTimeSlot: string;
  appointmentType?: string;
  location?: string;
  virtualLink?: string;
  description?: string;
  fullName?: string;
}): string {
  const date = new Date(appointment.preferredDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Map time slot to approximate hours
  let startHour = '09';
  let endHour = '10';
  const slot = (appointment.preferredTimeSlot || '').toLowerCase();
  if (slot.includes('afternoon')) { startHour = '14'; endHour = '15'; }
  else if (slot.includes('evening')) { startHour = '17'; endHour = '18'; }
  else if (slot.includes('morning')) { startHour = '10'; endHour = '11'; }

  const dtStart = `${year}${month}${day}T${startHour}0000`;
  const dtEnd = `${year}${month}${day}T${endHour}0000`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const locationStr = appointment.location || appointment.virtualLink || '';
  const summary = appointment.appointmentType || 'Legal Appointment';
  const desc = (appointment.description || '').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sajjadhusain Law Associates//Appointments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `DTSTAMP:${now}`,
    `UID:${Date.now()}@sajjadhusainlaw.com`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${locationStr}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(appointment: Parameters<typeof generateIcsFile>[0]) {
  const icsContent = generateIcsFile(appointment);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-${appointment.preferredDate}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
