import { useState } from 'react';

export function useHabitCheckin() {
  const [reflection, setReflection] = useState('');

  const handleCheckin = async (
    habitId: string,
    isSuccess: boolean,
    checkinHabit: (habitId: string, isSuccess: boolean, reflection?: string) => Promise<void>,
    onSuccess?: () => void
  ) => {
    try {
      await checkinHabit(habitId, isSuccess, reflection || undefined);
      setReflection('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to check in:', error);
      throw error;
    }
  };

  const clearReflection = () => {
    setReflection('');
  };

  return {
    // State
    reflection,
    setReflection,
    
    // Actions
    submit: handleCheckin,
    clear: clearReflection,
  };
}