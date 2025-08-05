import { useHabits } from '../hooks/use-habits';
import { useHabitForm } from '../hooks/use-habit-form';
import { useHabitAnimations } from '../hooks/use-habit-animations';
import { useHabitMenu } from '../hooks/use-habit-menu';
import { useHabitCheckin } from '../hooks/use-habit-checkin';
import { useDateNavigation } from '../hooks/use-date-navigation';
import { HabitsHeader } from './HabitsHeader';
import { HabitCard } from './HabitCard';
import { HabitsEmptyState } from './HabitsEmptyState';

interface Props {
  habits: ReturnType<typeof useHabits>;
  form: ReturnType<typeof useHabitForm>;
  animations: ReturnType<typeof useHabitAnimations>;
  menu: ReturnType<typeof useHabitMenu>;
  checkin: ReturnType<typeof useHabitCheckin>;
  dateNav: ReturnType<typeof useDateNavigation>;
}

export function HabitsList({ habits, form, animations, menu, checkin, dateNav }: Props) {
  return (
    <div>
      <HabitsHeader habits={habits} form={form} dateNav={dateNav} />
      
      {habits.data && habits.data.length > 0 ? (
        <div className="space-y-3">
          {habits.data.map((habit) => (
            <HabitCard 
              key={habit.habitId} 
              habit={habit}
              habits={habits}
              animations={animations}
              menu={menu}
              checkin={checkin}
            />
          ))}
        </div>
      ) : (
        <HabitsEmptyState />
      )}
    </div>
  );
}