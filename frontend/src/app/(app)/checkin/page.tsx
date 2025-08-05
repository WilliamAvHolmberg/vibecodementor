'use client';

import { AuthGuard } from '@/features/auth';
import { 
  useHabits, 
  useHabitForm, 
  useHabitAnimations, 
  useHabitMenu, 
  useHabitCheckin,
  HabitCreateForm,
  HabitsList
} from '@/features/habits';
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
  // Clean hook declarations
  const habits = useHabits();
  const form = useHabitForm();
  const animations = useHabitAnimations();
  const menu = useHabitMenu();
  const checkin = useHabitCheckin();

  if (habits.isLoading) return <div className="p-8">Loading habits...</div>;
  if (habits.error) return <div className="p-8 text-red-500">Error: {JSON.stringify(habits.error)}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8 text-gray-900">Daily Check-in</h1>
      
      <HabitCreateForm habits={habits} form={form} />
      <HabitsList 
        habits={habits}
        form={form}
        animations={animations}
        menu={menu}
        checkin={checkin}
      />
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