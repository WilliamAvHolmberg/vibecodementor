import { useQueryClient } from '@tanstack/react-query';
import { 
  useGetApiHabitsToday, 
  usePostApiHabits, 
  usePostApiHabitsCheckin, 
  useDeleteApiHabitsHabitId,
  getGetApiHabitsTodayQueryKey 
} from '@/api/hooks/api';

export function useHabits() {
  const queryClient = useQueryClient();

  // Get today's habits
  const habitsQuery = useGetApiHabitsToday();
  
  // Create habit mutation
  const createHabitMutation = usePostApiHabits({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiHabitsTodayQueryKey() });
      }
    }
  }, queryClient);
  
  // Check in habit mutation
  const checkinMutation = usePostApiHabitsCheckin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiHabitsTodayQueryKey() });
      }
    }
  }, queryClient);
  
  // Delete habit mutation
  const deleteHabitMutation = useDeleteApiHabitsHabitId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetApiHabitsTodayQueryKey() });
      }
    }
  }, queryClient);

  // Business logic methods
  const createHabit = async (name: string, description?: string): Promise<void> => {
    await createHabitMutation.mutateAsync({
      data: {
        name,
        description: description || '',
        userId: 'dummy' // This gets overwritten by controller
      }
    });
  };

  const checkinHabit = async (habitId: string, isSuccess: boolean, reflection?: string): Promise<void> => {
    await checkinMutation.mutateAsync({
      data: {
        habitId,
        userId: 'dummy', // This gets overwritten by controller
        isSuccess,
        reflection: reflection || null
      }
    });
  };

  const deleteHabit = async (habitId: string, habitName: string): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${habitName}"? This cannot be undone.`)) {
      return;
    }
    
    await deleteHabitMutation.mutateAsync({ habitId });
  };

  return {
    // Data
    data: habitsQuery.data || [],
    isLoading: habitsQuery.isLoading,
    error: habitsQuery.error,
    hasData: (habitsQuery.data?.length || 0) > 0,
    
    // Actions
    create: createHabit,
    checkin: checkinHabit,
    delete: deleteHabit,
    
    // Loading states
    isCreating: createHabitMutation.isPending,
    isCheckingIn: checkinMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
  };
}