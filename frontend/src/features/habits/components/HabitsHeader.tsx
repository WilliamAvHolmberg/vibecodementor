import { useHabits } from '../hooks/use-habits';
import { useHabitForm } from '../hooks/use-habit-form';

interface Props {
  habits: ReturnType<typeof useHabits>;
  form: ReturnType<typeof useHabitForm>;
}

export function HabitsHeader({ habits, form }: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-medium">Today's Habits</h2>
      {habits.hasData && !form.isVisible && (
        <button
          onClick={form.open}
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span className="text-lg">+</span> Add habit
        </button>
      )}
    </div>
  );
}