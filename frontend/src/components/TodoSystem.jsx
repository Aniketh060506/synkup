import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, ChevronRight, Calendar, Check, Flame, X } from 'lucide-react';

export default function TodoSystem({ todoData, onUpdateTodos, onBack }) {
  const [currentView, setCurrentView] = useState('year');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [streak, setStreak] = useState(0);

  const currentYear = new Date().getFullYear();
  const years = todoData.length > 0 ? todoData : [];

  // Calculate streak based on consecutive days with at least 1 task done
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      calculateStreak();
    }
  }, [selectedYear, selectedMonth]);

  const calculateStreak = () => {
    if (!selectedMonth || !selectedMonth.days) {
      setStreak(0);
      return;
    }

    let currentStreak = 0;
    const today = new Date();
    const sortedDays = [...selectedMonth.days].sort((a, b) => b.day - a.day);

    for (let dayData of sortedDays) {
      const dayDate = new Date(selectedYear.year, selectedMonth.index, dayData.day);
      if (dayDate > today) continue;

      const hasCompletedTask = dayData.hours && dayData.hours.some(h => h.completed);
      if (hasCompletedTask) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const handleCreateYear = () => {
    const newYear = {
      year: currentYear,
      months: Array.from({ length: 12 }, (_, i) => ({
        name: new Date(currentYear, i).toLocaleString('default', { month: 'long' }),
        taskCount: 0,
        focus: '',
        days: [],
      })),
    };
    onUpdateTodos([...todoData, newYear]);
  };

  const renderYearView = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Your Planning Years</h2>
        <button
          onClick={handleCreateYear}
          className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 transition-all font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Year
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {years.map((yearPlan, idx) => (
          <div
            key={yearPlan.year}
            onClick={() => {
              setSelectedYear(yearPlan);
              setCurrentView('month');
            }}
            style={{ animationDelay: `${idx * 0.1}s` }}
            className="bg-[#1C1C1E] rounded-3xl p-6 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:scale-105 transition-all cursor-pointer animate-slideUp"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-2xl">{yearPlan.year}</h3>
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm">12 months planned</p>
          </div>
        ))}
      </div>
      {years.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
          <Calendar className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">No planning years yet</h3>
          <p className="text-gray-400 text-center mb-6">Create your first year to start planning</p>
          <button
            onClick={handleCreateYear}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Year
          </button>
        </div>
      )}
    </div>
  );

  const updateMonthFocus = (monthIndex, focus) => {
    const updatedYears = years.map(y => 
      y.year === selectedYear.year 
        ? {
            ...y,
            months: y.months.map((m, idx) => 
              idx === monthIndex ? { ...m, focus } : m
            )
          }
        : y
    );
    onUpdateTodos(updatedYears);
    setSelectedYear(updatedYears.find(y => y.year === selectedYear.year));
  };

  const renderMonthView = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setCurrentView('year');
              setSelectedYear(null);
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-blue-400 text-xl font-bold">{selectedYear?.year}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#1C1C1E] rounded-lg transition-all">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-[#1C1C1E] rounded-lg transition-all">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] rounded-lg hover:bg-[#262626] transition-all">
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-white text-sm">Quick Jump</span>
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{selectedYear?.year} - Monthly Overview</h1>
      </div>

      <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
        <table className="w-full">
          <thead className="bg-[#2C2C2E]">
            <tr>
              <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">Month</th>
              <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">What I Will Focus On</th>
              <th className="text-right text-gray-400 font-medium text-sm px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedYear?.months.map((month, idx) => (
              <tr 
                key={idx} 
                className="border-t border-[rgba(255,255,255,0.05)] hover:bg-[#262626] transition-all"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <td className="px-6 py-5">
                  <div>
                    <div className="text-white font-semibold text-base">{month.name}</div>
                    <div className="text-gray-500 text-sm">{month.taskCount} tasks</div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <input
                    type="text"
                    value={month.focus || ''}
                    onChange={(e) => updateMonthFocus(idx, e.target.value)}
                    placeholder={`Enter ${month.name} goals...`}
                    className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none focus:text-white transition-all"
                  />
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => {
                      setSelectedMonth({ ...month, index: idx });
                      setCurrentView('day');
                    }}
                    className="px-6 py-2 bg-white text-black rounded-full hover:scale-105 transition-all font-medium text-sm"
                  >
                    Open Month
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDayView = () => {
    const daysInMonth = new Date(selectedYear.year, selectedMonth.index + 1, 0).getDate();
    const days = selectedMonth.days.length > 0 ? selectedMonth.days : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setCurrentView('month');
                setSelectedMonth(null);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Months
            </button>
          </div>
          <h2 className="text-3xl font-bold text-white">
            {selectedMonth.name} {selectedYear.year}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dayData = days.find((d) => d.day === dayNum);
            const weekday = new Date(selectedYear.year, selectedMonth.index, dayNum).toLocaleDateString(
              'en-US',
              { weekday: 'long' }
            );

            return (
              <div
                key={dayNum}
                onClick={() => {
                  setSelectedDay({ day: dayNum, weekday, tasks: dayData?.tasks || [], goal: dayData?.goal || '' });
                }}
                className="bg-[#1C1C1E] rounded-2xl p-4 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">{dayNum}</span>
                  {dayData && <Check className="w-4 h-4 text-green-400" />}
                </div>
                <p className="text-gray-400 text-xs">{weekday}</p>
                {dayData && (
                  <p className="text-gray-600 text-xs mt-2">{dayData.tasks.length} tasks</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Day Detail Modal */}
        {selectedDay && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          >
            <div
              className="bg-[#1C1C1E] rounded-3xl p-8 w-full max-w-2xl border border-[rgba(255,255,255,0.1)] max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white text-2xl font-bold">
                    {selectedMonth.name} {selectedDay.day}, {selectedYear.year}
                  </h2>
                  <p className="text-gray-400 text-sm">{selectedDay.weekday}</p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Daily Goal</label>
                  <input
                    type="text"
                    value={selectedDay.goal}
                    onChange={(e) => setSelectedDay({ ...selectedDay, goal: e.target.value })}
                    placeholder="What do you want to achieve today?"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(255,255,255,0.3)]"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Hourly Tasks</label>
                  <div className="space-y-2">
                    {selectedDay.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-2xl border border-[rgba(255,255,255,0.1)]"
                      >
                        <input
                          type="checkbox"
                          checked={task.isComplete}
                          onChange={() => {
                            const newTasks = [...selectedDay.tasks];
                            newTasks[idx].isComplete = !newTasks[idx].isComplete;
                            setSelectedDay({ ...selectedDay, tasks: newTasks });
                          }}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-gray-400 text-sm">{task.timeRange}</span>
                        <span className="text-white flex-1">{task.task}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 w-full px-4 py-2.5 bg-white text-black rounded-full hover:scale-105 transition-all font-medium">
                    Add Task
                  </button>
                </div>

                <button
                  onClick={() => setSelectedDay(null)}
                  className="w-full px-4 py-2.5 bg-[#262626] text-white rounded-full hover:bg-[#333333] transition-all"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 p-8 min-h-screen">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to Notebooks</span>
        </button>
      </div>

      {currentView === 'year' && renderYearView()}
      {currentView === 'month' && renderMonthView()}
      {currentView === 'day' && renderDayView()}
    </div>
  );
}
