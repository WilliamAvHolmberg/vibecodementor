import { useState } from 'react';

export function useHabitForm() {
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isFormClosing, setIsFormClosing] = useState(false);
  const [isFormOpening, setIsFormOpening] = useState(false);

  const openForm = () => {
    setIsCreateFormVisible(true);
    setIsFormOpening(true);
    // Use requestAnimationFrame to ensure the DOM is updated before starting animation
    requestAnimationFrame(() => {
      setIsFormOpening(false);
    });
  };

  const closeForm = () => {
    setIsFormClosing(true);
    setTimeout(() => {
      setIsCreateFormVisible(false);
      setIsFormClosing(false);
    }, 300);
  };

  const resetForm = () => {
    setHabitName('');
    setHabitDescription('');
  };

  const handleSubmit = async (onSubmit: (name: string, description: string) => Promise<void>) => {
    try {
      await onSubmit(habitName, habitDescription);
      resetForm();
      closeForm();
    } catch (error) {
      console.error('Failed to create habit:', error);
      throw error;
    }
  };

  // Determine if form should be shown (visible or no habits exist)
  const shouldShowCreateForm = (hasHabits: boolean) => {
    return isCreateFormVisible || !hasHabits;
  };

  return {
    // Form data
    name: habitName,
    description: habitDescription,
    setName: setHabitName,
    setDescription: setHabitDescription,
    
    // Form visibility
    isVisible: isCreateFormVisible,
    isClosing: isFormClosing,
    isOpening: isFormOpening,
    shouldShow: shouldShowCreateForm,
    
    // Actions
    open: openForm,
    close: closeForm,
    reset: resetForm,
    submit: handleSubmit,
  };
}