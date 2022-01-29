

export const getTime = (date: Date): string => {
  if (date) {
    const hours = date.getUTCHours().toString();
    const min = date.getUTCMinutes().toString();
    return formatTime(hours, min);
  } else {
    return '';
  }
}

export const getTimezoneTime = (date: Date): string => {
  if (date) {
    const hours = date.getHours().toString();
    const min = date.getMinutes().toString();
    return formatTime(hours, min);
  } else {
    return '';
  }
}

const formatTime = (h: string, m: string): string => {
  if (h.length === 1) {
    h = '0' + h;
  }
  if (m.length === 1) {
    m = '0' + m;
  }
  return `${h}:${m}`;
}

export const getDate = (date: Date): string => {
  return dateToString(date, false);
}

export const getDisplayDate = (date: Date): string => {
  return dateToString(date, true);
}

const dateToString = (date: Date, display: boolean): string => {
  if (date) {
    const year = date.getUTCFullYear();
    let month = (date.getUTCMonth() + (display? 1 : 0)).toString();
    let day = date.getUTCDate().toString();
      
    if (month.length === 1) {
      month = '0' + month;
    }
    if (day.length === 1) {
      day = '0' + day;
    }
      
    return `${year}-${month}-${day}`;
  } else {
    return '';
  }
}

export const toDateTime = (secs: number): Date => {
  const t = new Date(secs * 1000); // Epoch
  return t;
}