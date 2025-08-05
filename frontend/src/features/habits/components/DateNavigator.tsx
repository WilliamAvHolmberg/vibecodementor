import { useDateNavigation } from '../hooks/use-date-navigation';

interface Props {
  dateNav: ReturnType<typeof useDateNavigation>;
}

export function DateNavigator({ dateNav }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={dateNav.goToPreviousDay}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Previous day"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-lg font-medium text-gray-900 min-w-0">
          {dateNav.displayText}
        </h2>

        <button
          onClick={dateNav.goToNextDay}
          disabled={!dateNav.canGoToNextDay}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Next day"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!dateNav.isToday && (
        <button
          onClick={dateNav.goToToday}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
}