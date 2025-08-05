import { useHabits } from '../hooks/use-habits';
import { useHabitAnimations } from '../hooks/use-habit-animations';
import { useHabitMenu } from '../hooks/use-habit-menu';
import { useHabitCheckin } from '../hooks/use-habit-checkin';
import { HabitCheckinInterface } from './HabitCheckinInterface';
import { TodaysHabitDtoDTO } from '@/api/models';

interface Props {
  habit: TodaysHabitDtoDTO;
  habits: ReturnType<typeof useHabits>;
  animations: ReturnType<typeof useHabitAnimations>;
  menu: ReturnType<typeof useHabitMenu>;
  checkin: ReturnType<typeof useHabitCheckin>;
}

export function HabitCard({ habit, habits, animations, menu, checkin }: Props) {
  const handleCardClick = () => {
    animations.toggle(habit.habitId!);
    menu.close();
  };

  const handleDeleteHabit = async () => {
    try {
      await habits.delete(habit.habitId!, habit.name!);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="group">
      {/* Habit Card */}
      <div 
        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-all duration-200 group-hover:shadow-sm"
        onClick={handleCardClick}
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
                  menu.toggle(habit.habitId!);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
              >
                <span className="text-gray-400 text-lg leading-none">⋮</span>
              </button>
              
              {/* Dropdown Menu */}
              {menu.isOpen(habit.habitId!) && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      menu.close();
                      handleDeleteHabit();
                    }}
                    disabled={habits.isDeleting}
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
      <HabitCheckinInterface 
        habit={habit}
        habits={habits}
        animations={animations}
        checkin={checkin}
      />
    </div>
  );
}