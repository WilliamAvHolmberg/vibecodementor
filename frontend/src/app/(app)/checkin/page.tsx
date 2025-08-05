'use client';

import { useState, useEffect } from 'react';
import { useGetApiHabitsToday, usePostApiHabits, usePostApiHabitsCheckin, useDeleteApiHabitsHabitId, getGetApiHabitsTodayQueryKey } from '@/api/hooks/api';
import { useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '@/features/auth';
import dynamic from 'next/dynamic';

// Dynamically import the content with SSR disabled
const CheckinPageContent = dynamic(() => Promise.resolve(CheckinPageContentComponent), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-4.5rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading habits...</p>
      </div>
    </div>
  )
});

function CheckinPageContentComponent() {
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [reflection, setReflection] = useState('');
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isFormClosing, setIsFormClosing] = useState(false);
  const [isFormOpening, setIsFormOpening] = useState(false);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [collapsingHabitId, setCollapsingHabitId] = useState<string | null>(null);
  const [openingHabitId, setOpeningHabitId] = useState<string | null>(null);
  const [menuOpenForHabit, setMenuOpenForHabit] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

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
  
  // Get today's habits
  const { data: todaysHabits, isLoading, error } = useGetApiHabitsToday();
  
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

  const handleOpenForm = () => {
    setIsCreateFormVisible(true);
    setIsFormOpening(true);
    // Use requestAnimationFrame to ensure the DOM is updated before starting animation
    requestAnimationFrame(() => {
      setIsFormOpening(false);
    });
  };

  const handleCloseForm = () => {
    setIsFormClosing(true);
    setTimeout(() => {
      setIsCreateFormVisible(false);
      setIsFormClosing(false);
    }, 300);
  };

  const handleHabitClick = (habitId: string) => {
    if (expandedHabitId === habitId) {
      // Collapsing
      setCollapsingHabitId(habitId);
      setMenuOpenForHabit(null); // Close any open menu
      setTimeout(() => {
        setExpandedHabitId(null);
        setCollapsingHabitId(null);
      }, 300);
    } else {
      // Expanding
      setExpandedHabitId(habitId);
      setOpeningHabitId(habitId);
      setMenuOpenForHabit(null); // Close any open menu
      // Use requestAnimationFrame to ensure the DOM is updated before starting animation
      requestAnimationFrame(() => {
        setOpeningHabitId(null);
      });
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHabitMutation.mutateAsync({
        data: {
          name: habitName,
          description: habitDescription,
          userId: 'dummy' // This gets overwritten by controller
        }
      });
      setHabitName('');
      setHabitDescription('');
      handleCloseForm(); // Smooth close after creating
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleCheckin = async (habitId: string, isSuccess: boolean) => {
    try {
      await checkinMutation.mutateAsync({
        data: {
          habitId,
          userId: 'dummy', // This gets overwritten by controller
          isSuccess,
          reflection: reflection || null
        }
      });
      setReflection('');
      
      // Smooth collapse after checking in
      setCollapsingHabitId(habitId);
      setMenuOpenForHabit(null); // Close any open menu
      setTimeout(() => {
        setExpandedHabitId(null);
        setCollapsingHabitId(null);
      }, 300);
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string, habitName: string) => {
    if (!confirm(`Are you sure you want to delete "${habitName}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteHabitMutation.mutateAsync({
        habitId
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  if (isLoading) return <div className="p-8">Loading habits...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {JSON.stringify(error)}</div>;

  // Show create form by default if no habits exist
  const hasHabits = todaysHabits && todaysHabits.length > 0;
  const shouldShowCreateForm = isCreateFormVisible || !hasHabits;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8 text-gray-900">Daily Check-in</h1>
      
      {/* Create Habit Form */}
      {shouldShowCreateForm && (
        <div className={`mb-8 overflow-hidden transition-all duration-300 ease-out transform ${
          isFormClosing 
            ? 'max-h-0 translate-y-[-10px] opacity-0' 
            : isFormOpening
            ? 'max-h-0 translate-y-[-10px] opacity-0'
            : 'max-h-[600px] translate-y-0 opacity-100'
        }`}>
          <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-8 transition-all duration-300 transform ${
            isFormClosing 
              ? 'scale-95 opacity-0' 
              : isFormOpening 
              ? 'scale-95 opacity-0' 
              : 'scale-100 opacity-100'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Create New Habit</h2>
              {hasHabits && (
                <button
                  onClick={handleCloseForm}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              )}
            </div>
            <form onSubmit={handleCreateHabit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="What habit would you like to track?"
                    className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-base"
                    required
                  />
                </div>
                {/* <div>
                  <input
                    type="text"
                    value={habitDescription}
                    onChange={(e) => setHabitDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-base"
                  />
                </div> */}
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createHabitMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-4 rounded-xl font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer transform hover:scale-[0.99] active:scale-[0.97] shadow-sm hover:shadow-md"
                >
                  {createHabitMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </span>
                  ) : (
                    'Create Habit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Today's Habits */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Today's Habits</h2>
          {hasHabits && !isCreateFormVisible && (
            <button
              onClick={handleOpenForm}
              className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="text-lg">+</span> Add habit
            </button>
          )}
        </div>
        {todaysHabits && todaysHabits.length > 0 ? (
          <div className="space-y-3">
            {todaysHabits.map((habit) => (
              <div key={habit.habitId} className="group">
                {/* Habit Card */}
                <div 
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-all duration-200 group-hover:shadow-sm"
                  onClick={() => handleHabitClick(habit.habitId!)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Status Indicator */}
                      <div className="text-sm">
                        {habit.isCompleted === true ? (
                          <span className="text-green-600">💚</span>
                        ) : habit.isCompleted === false ? (
                          <span className="text-orange-600">🟡</span>
                        ) : (
                          <span className="text-gray-300">⚪</span>
                        )}
                      </div>
                      
                      {/* Hamburger Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenForHabit(menuOpenForHabit === habit.habitId ? null : habit.habitId!);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        >
                          <span className="text-gray-400 text-lg leading-none">⋮</span>
                        </button>
                        
                        {/* Dropdown Menu */}
                        {menuOpenForHabit === habit.habitId && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenForHabit(null);
                                handleDeleteHabit(habit.habitId!, habit.name!);
                              }}
                              disabled={deleteHabitMutation.isPending}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Check-in Interface */}
                {(expandedHabitId === habit.habitId || collapsingHabitId === habit.habitId || openingHabitId === habit.habitId) && (
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${
                    collapsingHabitId === habit.habitId 
                      ? 'max-h-0 opacity-0' 
                      : openingHabitId === habit.habitId
                      ? 'max-h-0 opacity-0'
                      : 'max-h-[400px] opacity-100'
                  }`}>
                    <div className={`mt-3 p-4 bg-gray-50 rounded-lg transition-all duration-300 transform ${
                      collapsingHabitId === habit.habitId 
                        ? 'scale-95 opacity-0' 
                        : openingHabitId === habit.habitId 
                        ? 'scale-95 opacity-0' 
                        : 'scale-100 opacity-100'
                    }`}>
                      {typeof habit.isCompleted === 'boolean' ? (
                        <div className="text-sm text-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={habit.isCompleted ? "text-green-700 font-medium" : "text-orange-700 font-medium"}>
                              {habit.isCompleted ? "Went very well" : "Could have gone better"}
                            </span>
                          </div>
                          {habit.reflection && <p className="mb-2"><span className="font-medium">Reflection:</span> {habit.reflection}</p>}
                          {habit.completedAt && <p className="text-gray-500"><span className="font-medium">Logged:</span> {new Date(habit.completedAt).toLocaleString()}</p>}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">How did it go?</h4>
                          
                          <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="Share your thoughts (optional)"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                            rows={2}
                          />
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleCheckin(habit.habitId!, true)}
                              disabled={checkinMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 transition-colors cursor-pointer"
                            >
                              {checkinMutation.isPending ? 'Saving...' : 'Very well 💚'}
                            </button>
                            <button
                              onClick={() => handleCheckin(habit.habitId!, false)}
                              disabled={checkinMutation.isPending}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 transition-colors cursor-pointer"
                            >
                              {checkinMutation.isPending ? 'Saving...' : 'Could be better 🟡'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌱</div>
            <p className="text-gray-500">No habits yet. Create your first one above!</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function CheckinPage() {
  return (
    <AuthGuard
      title="Daily Check-in"
      description="Sign in to track your daily habits and reflect on your progress"
      icon="🌱"
      loadingMessage="Loading your habits..."
    >
      <CheckinPageContent />
    </AuthGuard>
  );
}