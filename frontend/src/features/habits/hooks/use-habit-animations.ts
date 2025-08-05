import { useState } from 'react';

export function useHabitAnimations() {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [collapsingHabitId, setCollapsingHabitId] = useState<string | null>(null);
  const [openingHabitId, setOpeningHabitId] = useState<string | null>(null);

  const expandHabit = (habitId: string) => {
    setExpandedHabitId(habitId);
    setOpeningHabitId(habitId);
    // Use requestAnimationFrame to ensure the DOM is updated before starting animation
    requestAnimationFrame(() => {
      setOpeningHabitId(null);
    });
  };

  const collapseHabit = (habitId: string) => {
    setCollapsingHabitId(habitId);
    setTimeout(() => {
      setExpandedHabitId(null);
      setCollapsingHabitId(null);
    }, 300);
  };

  const toggleHabit = (habitId: string) => {
    if (expandedHabitId === habitId) {
      collapseHabit(habitId);
    } else {
      expandHabit(habitId);
    }
  };

  const collapseAfterAction = (habitId: string) => {
    // Used after checkin or other actions that should close the expanded view
    collapseHabit(habitId);
  };

  const isExpanded = (habitId: string) => expandedHabitId === habitId;
  const isCollapsing = (habitId: string) => collapsingHabitId === habitId;
  const isOpening = (habitId: string) => openingHabitId === habitId;
  const isAnimating = (habitId: string) => isCollapsing(habitId) || isOpening(habitId);

  return {
    // State
    expandedId: expandedHabitId,
    
    // Actions
    expand: expandHabit,
    collapse: collapseHabit,
    toggle: toggleHabit,
    collapseAfter: collapseAfterAction,
    
    // Helpers
    isExpanded,
    isCollapsing,
    isOpening,
    isAnimating,
  };
}