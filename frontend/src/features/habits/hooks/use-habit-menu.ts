import { useState, useEffect } from 'react';

export function useHabitMenu() {
  const [menuOpenForHabit, setMenuOpenForHabit] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpenForHabit(null);
    };

    if (menuOpenForHabit) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpenForHabit]);

  const toggleMenu = (habitId: string) => {
    setMenuOpenForHabit(menuOpenForHabit === habitId ? null : habitId);
  };

  const closeMenu = () => {
    setMenuOpenForHabit(null);
  };

  const isMenuOpen = (habitId: string) => menuOpenForHabit === habitId;

  return {
    // State
    openForHabit: menuOpenForHabit,
    
    // Actions
    toggle: toggleMenu,
    close: closeMenu,
    
    // Helpers
    isOpen: isMenuOpen,
  };
}