import { useState } from 'react';

export function useDateNavigation() {
  // Default to today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Helper to format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Helper to check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Helper to format date for display
  const formatDateForDisplay = (date: Date): string => {
    if (isToday(date)) {
      return "Today's Habits";
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Navigation methods
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Check if we can navigate (no future dates)
  const canGoToNextDay = () => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow <= new Date();
  };

  return {
    // State
    selectedDate,
    
    // Computed values
    apiDateString: formatDateForApi(selectedDate),
    displayText: formatDateForDisplay(selectedDate),
    isToday: isToday(selectedDate),
    
    // Actions
    goToPreviousDay,
    goToNextDay,
    goToToday,
    setSelectedDate,
    
    // Boundaries
    canGoToNextDay: canGoToNextDay(),
  };
}