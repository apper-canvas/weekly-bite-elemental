import { format, startOfWeek, addDays, isSameWeek } from "date-fns";

export const getWeekStart = (date = new Date()) => {
  return startOfWeek(date, { weekStartsOn: 0 }); // Sunday
};

export const getWeekDays = (weekStart) => {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
};

export const formatDate = (date, formatStr = "yyyy-MM-dd") => {
  return format(date, formatStr);
};

export const getDayName = (date) => {
  return format(date, "EEEE");
};

export const getShortDayName = (date) => {
  return format(date, "EEE");
};

export const isCurrentWeek = (weekStart) => {
  return isSameWeek(weekStart, new Date(), { weekStartsOn: 0 });
};

export const getWeekDateRange = (weekStart) => {
  const weekEnd = addDays(weekStart, 6);
  const startStr = format(weekStart, "MMM d");
  const endStr = format(weekEnd, "MMM d, yyyy");
  return `${startStr} - ${endStr}`;
};