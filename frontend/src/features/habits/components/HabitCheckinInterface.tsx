import { useHabits } from '../hooks/use-habits';
import { useHabitAnimations } from '../hooks/use-habit-animations';
import { useHabitCheckin } from '../hooks/use-habit-checkin';
import { TodaysHabitDtoDTO } from '@/api/models';

interface Props {
  habit: TodaysHabitDtoDTO;
  habits: ReturnType<typeof useHabits>;
  animations: ReturnType<typeof useHabitAnimations>;
  checkin: ReturnType<typeof useHabitCheckin>;
}

export function HabitCheckinInterface({ habit, habits, animations, checkin }: Props) {
  const handleCheckin = async (isSuccess: boolean) => {
    await checkin.submit(
      habit.habitId!, 
      isSuccess, 
      habits.checkin, 
      () => animations.collapseAfter(habit.habitId!)
    );
  };

  const isVisible = animations.isExpanded(habit.habitId!) || 
                   animations.isCollapsing(habit.habitId!) || 
                   animations.isOpening(habit.habitId!);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`overflow-hidden transition-all duration-300 ease-out ${
      animations.isCollapsing(habit.habitId!) 
        ? 'max-h-0 opacity-0' 
        : animations.isOpening(habit.habitId!)
        ? 'max-h-0 opacity-0'
        : 'max-h-[400px] opacity-100'
    }`}>
      <div className={`mt-3 p-4 bg-gray-50 rounded-lg transition-all duration-300 transform ${
        animations.isCollapsing(habit.habitId!) 
          ? 'scale-95 opacity-0' 
          : animations.isOpening(habit.habitId!) 
          ? 'scale-95 opacity-0' 
          : 'scale-100 opacity-100'
      }`}>
        {typeof habit.isCompleted === 'boolean' ? (
          // Already completed - show status
          <div className="text-sm text-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className={habit.isCompleted ? "text-green-700 font-medium" : "text-orange-700 font-medium"}>
                {habit.isCompleted ? "Went very well" : "Could have gone better"}
              </span>
            </div>
            {habit.reflection && (
              <p className="mb-2">
                <span className="font-medium">Reflection:</span> {habit.reflection}
              </p>
            )}
            {habit.completedAt && (
              <p className="text-gray-500">
                <span className="font-medium">Logged:</span> {new Date(habit.completedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          // Not completed - show checkin form
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">How did it go?</h4>
            
            <textarea
              value={checkin.reflection}
              onChange={(e) => checkin.setReflection(e.target.value)}
              placeholder="Share your thoughts (optional)"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              rows={2}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => handleCheckin(true)}
                disabled={habits.isCheckingIn}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 transition-colors cursor-pointer"
              >
                {habits.isCheckingIn ? 'Saving...' : 'Very well'}
              </button>
              <button
                onClick={() => handleCheckin(false)}
                disabled={habits.isCheckingIn}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex-1 transition-colors cursor-pointer"
              >
                {habits.isCheckingIn ? 'Saving...' : 'Could be better'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}