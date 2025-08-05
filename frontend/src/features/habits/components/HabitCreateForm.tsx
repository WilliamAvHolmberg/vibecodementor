import { useHabits } from '../hooks/use-habits';
import { useHabitForm } from '../hooks/use-habit-form';

interface Props {
  habits: ReturnType<typeof useHabits>;
  form: ReturnType<typeof useHabitForm>;
}

export function HabitCreateForm({ habits, form }: Props) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await form.submit(habits.create);
  };

  if (!form.shouldShow(habits.hasData)) {
    return null;
  }

  return (
    <div className={`mb-8 overflow-hidden transition-all duration-300 ease-out transform ${
      form.isClosing 
        ? 'max-h-0 translate-y-[-10px] opacity-0' 
        : form.isOpening
        ? 'max-h-0 translate-y-[-10px] opacity-0'
        : 'max-h-[600px] translate-y-0 opacity-100'
    }`}>
      <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-8 transition-all duration-300 transform ${
        form.isClosing 
          ? 'scale-95 opacity-0' 
          : form.isOpening 
          ? 'scale-95 opacity-0' 
          : 'scale-100 opacity-100'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Create New Habit</h2>
          {habits.hasData && (
            <button
              onClick={form.close}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder="What habit would you like to track?"
                className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-base"
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={habits.isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-4 rounded-xl font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer transform hover:scale-[0.99] active:scale-[0.97] shadow-sm hover:shadow-md"
            >
              {habits.isCreating ? (
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
  );
}