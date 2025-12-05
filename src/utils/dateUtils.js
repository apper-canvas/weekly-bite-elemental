import { format, startOfWeek, addDays, isSameWeek, isValid } from "date-fns";

// Helper function to validate date input
const validateDate = (date) => {
  if (!date) return new Date();
  if (!(date instanceof Date)) {
    const parsed = new Date(date);
    return isValid(parsed) ? parsed : new Date();
  }
  return isValid(date) ? date : new Date();
};

// Helper function to validate format string
const validateFormatString = (formatStr) => {
  return formatStr && typeof formatStr === 'string' && formatStr.trim() ? formatStr : 'yyyy-MM-dd';
};

export const getWeekStart = (date = new Date()) => {
  try {
    const validDate = validateDate(date);
    return startOfWeek(validDate, { weekStartsOn: 0 }); // Sunday
  } catch (error) {
    console.warn('getWeekStart error:', error);
    return startOfWeek(new Date(), { weekStartsOn: 0 });
  }
};

export const getWeekDays = (weekStart) => {
  try {
    const validWeekStart = validateDate(weekStart);
    return Array.from({ length: 7 }, (_, i) => addDays(validWeekStart, i));
  } catch (error) {
    console.warn('getWeekDays error:', error);
    const fallbackStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(fallbackStart, i));
  }
};

export const formatDate = (date, formatStr = "yyyy-MM-dd") => {
  try {
    const validDate = validateDate(date);
    const validFormat = validateFormatString(formatStr);
    return format(validDate, validFormat);
  } catch (error) {
    console.warn('formatDate error:', error);
    return format(new Date(), 'yyyy-MM-dd');
  }
};

export const getDayName = (date) => {
  try {
    const validDate = validateDate(date);
    return format(validDate, "EEEE");
  } catch (error) {
    console.warn('getDayName error:', error);
    return format(new Date(), "EEEE");
  }
};

export const getShortDayName = (date) => {
  try {
    const validDate = validateDate(date);
    return format(validDate, "EEE");
  } catch (error) {
    console.warn('getShortDayName error:', error);
    return format(new Date(), "EEE");
  }
};

export const isCurrentWeek = (weekStart) => {
  try {
    const validWeekStart = validateDate(weekStart);
    const currentDate = new Date();
    return isSameWeek(validWeekStart, currentDate, { weekStartsOn: 0 });
  } catch (error) {
    console.warn('isCurrentWeek error:', error);
    return false;
  }
};

export const getWeekDateRange = (weekStart) => {
  try {
    const validWeekStart = validateDate(weekStart);
    const weekEnd = addDays(validWeekStart, 6);
    const startStr = format(validWeekStart, "MMM d");
    const endStr = format(weekEnd, "MMM d, yyyy");
    return `${startStr} - ${endStr}`;
  } catch (error) {
    console.warn('getWeekDateRange error:', error);
    const fallbackStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const fallbackEnd = addDays(fallbackStart, 6);
    return `${format(fallbackStart, "MMM d")} - ${format(fallbackEnd, "MMM d, yyyy")}`;
  }
};