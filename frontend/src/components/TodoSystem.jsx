import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, ChevronRight, Calendar, Check, Flame, X } from 'lucide-react';

export default function TodoSystem({ todoData, onUpdateTodos, onBack }) {
  const currentYear = new Date().getFullYear();
  const years = todoData.length > 0 ? todoData : [];
  
  // Initialize with current year if available, otherwise create it
  const initializeYear = () => {
    let yearData = years.find(y => y.year === currentYear);
    if (!yearData) {
      yearData = {
        year: currentYear,
        months: Array.from({ length: 12 }, (_, i) => ({
          name: new Date(currentYear, i).toLocaleString('default', { month: 'long' }),
          taskCount: 0,
          focus: '',
          index: i,
          days: [],
        })),
      };
      onUpdateTodos([...todoData, yearData]);
    }
    return yearData;
  };

  const [currentView, setCurrentView] = useState('month');
  const [selectedYear, setSelectedYear] = useState(initializeYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newTaskStartTime, setNewTaskStartTime] = useState('');
  const [newTaskEndTime, setNewTaskEndTime] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [streak, setStreak] = useState(0);

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
              idx === monthIndex ? { ...m, focus, index: idx } : m
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
                    <div className="text-gray-500 text-sm">{month.taskCount || 0} tasks</div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <input
                    type="text"
                    value={month.focus || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateMonthFocus(idx, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={`Enter ${month.name} goals...`}
                    className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none focus:text-white transition-all"
                  />
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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

  // Check if all hours are completed for a day
  const isDayComplete = (dayData) => {
    if (!dayData || !dayData.hours || dayData.hours.length === 0) return false;
    return dayData.hours.every(h => h.completed);
  };

  // Check if at least one task is done (for streak)
  const hasSomeProgress = (dayData) => {
    if (!dayData || !dayData.hours || dayData.hours.length === 0) return false;
    return dayData.hours.some(h => h.completed);
  };

  const toggleDayComplete = (dayNum) => {
    const updatedYears = years.map(y => 
      y.year === selectedYear.year 
        ? {
            ...y,
            months: y.months.map((m, idx) => 
              idx === selectedMonth.index 
                ? {
                    ...m,
                    days: m.days.map(d => 
                      d.day === dayNum 
                        ? { ...d, manuallyChecked: !d.manuallyChecked }
                        : d
                    )
                  }
                : m
            )
          }
        : y
    );
    onUpdateTodos(updatedYears);
    const updatedYear = updatedYears.find(y => y.year === selectedYear.year);
    setSelectedYear(updatedYear);
    setSelectedMonth(updatedYear.months[selectedMonth.index]);
  };

  const updateDayGoal = (dayNum, goal) => {
    const updatedYears = years.map(y => 
      y.year === selectedYear.year 
        ? {
            ...y,
            months: y.months.map((m, idx) => 
              idx === selectedMonth.index 
                ? {
                    ...m,
                    days: (() => {
                      const existingDays = m.days || [];
                      const dayIndex = existingDays.findIndex(d => d.day === dayNum);
                      
                      if (dayIndex >= 0) {
                        const newDays = [...existingDays];
                        newDays[dayIndex] = { ...newDays[dayIndex], goal };
                        return newDays;
                      } else if (goal) {
                        return [...existingDays, { day: dayNum, goal, hours: [] }];
                      }
                      return existingDays;
                    })()
                  }
                : m
            )
          }
        : y
    );
    onUpdateTodos(updatedYears);
    const updatedYear = updatedYears.find(y => y.year === selectedYear.year);
    setSelectedYear(updatedYear);
    setSelectedMonth(updatedYear.months[selectedMonth.index]);
  };

  const renderDayView = () => {
    const daysInMonth = new Date(selectedYear.year, selectedMonth.index + 1, 0).getDate();
    const days = selectedMonth.days || [];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setCurrentView('month');
                setSelectedMonth(null);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h2 className="text-blue-400 text-xl font-bold">{selectedYear?.year}</h2>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <h2 className="text-blue-400 text-xl font-bold">{selectedMonth.name}</h2>
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
          <h1 className="text-4xl font-bold text-white mb-2">{selectedMonth.name} {selectedYear.year} - Daily Schedule</h1>
        </div>

        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
          <table className="w-full">
            <thead className="bg-[#2C2C2E]">
              <tr>
                <th className="text-center text-gray-400 font-medium text-sm px-4 py-4 w-12">✓</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-32">Date</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">What I Will Do</th>
                <th className="text-right text-gray-400 font-medium text-sm px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const dayData = days.find((d) => d.day === dayNum);
                const weekday = new Date(selectedYear.year, selectedMonth.index, dayNum).toLocaleDateString(
                  'en-US',
                  { weekday: 'short' }
                );
                const isComplete = isDayComplete(dayData);

                return (
                  <tr 
                    key={dayNum}
                    className="border-t border-[rgba(255,255,255,0.05)] hover:bg-[#262626] transition-all"
                    style={{ animationDelay: `${i * 0.02}s` }}
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={isComplete}
                        readOnly
                        className="w-5 h-5 rounded-full cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-white font-bold text-lg">{dayNum}</div>
                        <div className="text-gray-500 text-xs">{weekday}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="text"
                        value={dayData?.goal || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDayGoal(dayNum, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Day ${dayNum} tasks...`}
                        className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none focus:text-white transition-all"
                      />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const existingDay = days.find(d => d.day === dayNum);
                          setSelectedDay({
                            day: dayNum,
                            weekday: new Date(selectedYear.year, selectedMonth.index, dayNum).toLocaleDateString('en-US', { weekday: 'long' }),
                            hours: existingDay?.hours || [],
                            goal: existingDay?.goal || ''
                          });
                          setCurrentView('hour');
                        }}
                        className="px-6 py-2 bg-white text-black rounded-full hover:scale-105 transition-all font-medium text-sm"
                      >
                        Open Hours
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const toggleHourComplete = (hourIndex) => {
    const updatedHours = [...selectedDay.hours];
    updatedHours[hourIndex].completed = !updatedHours[hourIndex].completed;
    
    const updatedDay = { ...selectedDay, hours: updatedHours };
    setSelectedDay(updatedDay);

    // Update in the main data structure
    const updatedYears = years.map(y => 
      y.year === selectedYear.year 
        ? {
            ...y,
            months: y.months.map((m, idx) => 
              idx === selectedMonth.index 
                ? {
                    ...m,
                    days: (() => {
                      const existingDays = m.days || [];
                      const dayIndex = existingDays.findIndex(d => d.day === selectedDay.day);
                      
                      if (dayIndex >= 0) {
                        const newDays = [...existingDays];
                        newDays[dayIndex] = { 
                          day: selectedDay.day, 
                          hours: updatedHours,
                          goal: selectedDay.goal 
                        };
                        return newDays;
                      } else {
                        return [...existingDays, { 
                          day: selectedDay.day, 
                          hours: updatedHours,
                          goal: selectedDay.goal 
                        }];
                      }
                    })()
                  }
                : m
            )
          }
        : y
    );
    
    onUpdateTodos(updatedYears);
    const updatedYear = updatedYears.find(y => y.year === selectedYear.year);
    setSelectedYear(updatedYear);
    setSelectedMonth(updatedYear.months[selectedMonth.index]);
  };

  const deleteHourTask = (hourIndex) => {
    const updatedHours = selectedDay.hours.filter((_, idx) => idx !== hourIndex);
    const updatedDay = { ...selectedDay, hours: updatedHours };
    setSelectedDay(updatedDay);

    // Update in the main data structure
    const updatedYears = years.map(y => 
      y.year === selectedYear.year 
        ? {
            ...y,
            months: y.months.map((m, idx) => 
              idx === selectedMonth.index 
                ? {
                    ...m,
                    days: (() => {
                      const existingDays = m.days || [];
                      const dayIndex = existingDays.findIndex(d => d.day === selectedDay.day);
                      
                      if (dayIndex >= 0) {
                        const newDays = [...existingDays];
                        newDays[dayIndex] = { 
                          day: selectedDay.day, 
                          hours: updatedHours,
                          goal: selectedDay.goal 
                        };
                        return newDays;
                      }
                      return existingDays;
                    })()
                  }
                : m
            )
          }
        : y
    );
    
    onUpdateTodos(updatedYears);
    const updatedYear = updatedYears.find(y => y.year === selectedYear.year);
    setSelectedYear(updatedYear);
    setSelectedMonth(updatedYear.months[selectedMonth.index]);
  };

  const addNewHourTask = () => {
    if (!newTaskStartTime || !newTaskEndTime || !newTaskDesc) return;

    const newHour = {
      timeRange: `${newTaskStartTime} to ${newTaskEndTime}`,
      task: newTaskDesc,
      completed: false
    };

    const updatedHours = [...selectedDay.hours, newHour];
    const updatedDay = { ...selectedDay, hours: updatedHours };
    setSelectedDay(updatedDay);

    // Update in the main data structure
    const updatedYears = years.map(y => 
      y.year === selectedYear.year 
        ? {
            ...y,
            months: y.months.map((m, idx) => 
              idx === selectedMonth.index 
                ? {
                    ...m,
                    days: (() => {
                      const existingDays = m.days || [];
                      const dayIndex = existingDays.findIndex(d => d.day === selectedDay.day);
                      
                      if (dayIndex >= 0) {
                        const newDays = [...existingDays];
                        newDays[dayIndex] = { 
                          day: selectedDay.day, 
                          hours: updatedHours,
                          goal: selectedDay.goal 
                        };
                        return newDays;
                      } else {
                        return [...existingDays, { 
                          day: selectedDay.day, 
                          hours: updatedHours,
                          goal: selectedDay.goal 
                        }];
                      }
                    })()
                  }
                : m
            )
          }
        : y
    );
    
    onUpdateTodos(updatedYears);
    const updatedYear = updatedYears.find(y => y.year === selectedYear.year);
    setSelectedYear(updatedYear);
    setSelectedMonth(updatedYear.months[selectedMonth.index]);

    // Reset form
    setNewTaskStartTime('');
    setNewTaskEndTime('');
    setNewTaskDesc('');
  };

  const renderHourView = () => {
    const dateStr = new Date(selectedYear.year, selectedMonth.index, selectedDay.day).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const allCompleted = selectedDay.hours.length > 0 && selectedDay.hours.every(h => h.completed);
    const someCompleted = selectedDay.hours.some(h => h.completed);

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setCurrentView('day');
                setSelectedDay(null);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h2 className="text-blue-400 text-xl font-bold">{selectedYear?.year}</h2>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <h2 className="text-blue-400 text-xl font-bold">{selectedMonth.name}</h2>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <h2 className="text-blue-400 text-xl font-bold">Day {selectedDay.day} - Hours</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] rounded-lg border border-[rgba(255,255,255,0.1)]">
              <Flame className={`w-5 h-5 ${someCompleted ? 'text-orange-500' : 'text-gray-600'}`} />
              <span className={`font-bold text-lg ${someCompleted ? 'text-orange-500' : 'text-gray-600'}`}>{streak}</span>
              <span className="text-gray-400 text-sm">Streak</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] rounded-lg hover:bg-[#262626] transition-all">
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Quick Jump</span>
            </button>
            <button 
              onClick={onBack}
              className="p-2 hover:bg-[#1C1C1E] rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{dateStr} - Hourly Schedule</h1>
        </div>

        {/* Add Task Form */}
        <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newTaskStartTime}
              onChange={(e) => setNewTaskStartTime(e.target.value)}
              placeholder="05:54 PM"
              className="w-32 px-4 py-3 bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(255,255,255,0.3)]"
            />
            <span className="text-gray-600">to</span>
            <input
              type="text"
              value={newTaskEndTime}
              onChange={(e) => setNewTaskEndTime(e.target.value)}
              placeholder="06:54 PM"
              className="w-32 px-4 py-3 bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(255,255,255,0.3)]"
            />
            <input
              type="text"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder="What will you do during this time?"
              className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(255,255,255,0.3)]"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addNewHourTask();
                }
              }}
            />
            <button 
              onClick={addNewHourTask}
              className="px-6 py-3 bg-white text-black rounded-xl hover:scale-105 transition-all font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
          <table className="w-full">
            <thead className="bg-[#2C2C2E]">
              <tr>
                <th className="text-center text-gray-400 font-medium text-sm px-4 py-4 w-12">✓</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4 w-48">Time Range</th>
                <th className="text-left text-gray-400 font-medium text-sm px-6 py-4">What I Will Do</th>
                <th className="text-right text-gray-400 font-medium text-sm px-6 py-4 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedDay.hours.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      No tasks scheduled for this day. Add your first task above!
                    </div>
                  </td>
                </tr>
              ) : (
                selectedDay.hours.map((hour, idx) => (
                  <tr 
                    key={idx}
                    className="border-t border-[rgba(255,255,255,0.05)] hover:bg-[#262626] transition-all"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={hour.completed}
                        onChange={() => toggleHourComplete(idx)}
                        className="w-5 h-5 rounded-full cursor-pointer accent-green-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-gray-400 text-sm font-medium">{hour.timeRange}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`${hour.completed ? 'text-gray-600 line-through' : 'text-white'} transition-all`}>
                        {hour.task}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => deleteHourTask(idx)}
                        className="text-red-500 hover:text-red-400 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Status Message */}
        {allCompleted && selectedDay.hours.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center animate-fadeIn">
            <p className="text-green-400 font-medium">🎉 All tasks completed! Great job!</p>
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
      {currentView === 'hour' && renderHourView()}
    </div>
  );
}
