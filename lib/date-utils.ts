export function formatEventDate(dateString: string | null, language: string = 'en'): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const locale = language === 'ar-EG' || language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.DateTimeFormat(locale, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatEventTime(timeString: string | null, language: string = 'en'): string {
  if (!timeString) return '';
  try {
    // timeString is like "15:30:00" or "15:30"
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    const date = new Date();
    date.setHours(hours, minutes, 0);

    const locale = language === 'ar-EG' || language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    return timeString;
  }
}

export function isEventPassed(dateString: string | null, timeString: string | null): boolean {
  if (!dateString) return false;
  
  try {
    const eventDate = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      eventDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    } else {
      // If no time is specified, assume end of day
      eventDate.setHours(23, 59, 59);
    }
    
    return eventDate < new Date();
  } catch (e) {
    return false;
  }
}
