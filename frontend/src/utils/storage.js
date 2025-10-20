import { CopyDockData, Notebook, YearPlan, AnalyticsData } from '../types';

const STORAGE_KEY = 'copyDockData';

export const getInitialData = (): CopyDockData => {
  return {
    notebooks: [],
    analytics: {
      notebookCount: 0,
      streak: 0,
      storageMb: 0,
      storageTotalMb: 10,
      webCaptures: 0,
      activity: [],
      today: {
        todos: 0,
        captures: 0,
        notes: 0,
        words: 0,
      },
      content: {
        totalWords: 0,
        breakdown: [],
      },
      goals: {
        currentStreak: 0,
        bestStreak: 0,
        monthlyProgress: 0,
      },
      storageBreakdown: [],
      weeklyInsights: {
        mostProductiveDay: 'N/A',
        averageTasksPerDay: 0,
        trend: 'stable',
      },
    },
    todoSystem: [],
    activityLog: {},
  };
};

export const loadData = (): CopyDockData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialData();
  } catch (error) {
    console.error('Error loading data:', error);
    return getInitialData();
  }
};

export const saveData = (data: CopyDockData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const calculateStorageSize = (data: CopyDockData): number => {
  const jsonString = JSON.stringify(data);
  return new Blob([jsonString]).size / (1024 * 1024);
};

// Calculate todo streak from todo system
const calculateTodoStreak = (todoSystem) => {
  console.log('📊 calculateTodoStreak called with:', todoSystem);
  if (!todoSystem || todoSystem.length === 0) {
    console.log('📊 No todo system data, returning 0');
    return 0;
  }

  // Find the most recent day with completed tasks
  let allDaysWithTasks = [];

  // Collect all days with completed tasks
  todoSystem.forEach(yearData => {
    yearData.months.forEach((monthData, monthIndex) => {
      if (monthData.days && monthData.days.length > 0) {
        monthData.days.forEach(dayData => {
          const hasCompletedTask = dayData?.hours?.some(h => h.completed);
          if (hasCompletedTask) {
            const date = new Date(yearData.year, monthIndex, dayData.day);
            date.setHours(0, 0, 0, 0);
            allDaysWithTasks.push({ date, yearData, monthIndex, dayData });
          }
        });
      }
    });
  });

  console.log('📊 Days with completed tasks:', allDaysWithTasks.map(d => d.date.toDateString()));

  if (allDaysWithTasks.length === 0) {
    console.log('📊 No days with completed tasks');
    return 0;
  }

  // Sort dates in descending order (most recent first)
  allDaysWithTasks.sort((a, b) => b.date - a.date);
  const mostRecentDate = allDaysWithTasks[0].date;

  console.log('📊 Most recent date with tasks:', mostRecentDate.toDateString());

  // Now calculate streak backwards from the most recent date
  let currentStreak = 0;
  let checkDate = new Date(mostRecentDate);

  for (let i = 0; i < 365; i++) {
    const year = checkDate.getFullYear();
    const month = checkDate.getMonth();
    const day = checkDate.getDate();

    const yearData = todoSystem.find(y => y.year === year);
    if (!yearData) {
      if (i > 0) break;
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    const monthData = yearData.months[month];
    if (!monthData || !monthData.days) {
      if (i > 0) break;
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    const dayData = monthData.days.find(d => d.day === day);
    const hasCompletedTask = dayData?.hours?.some(h => h.completed);

    if (hasCompletedTask) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  console.log(`📊 Final streak: ${currentStreak}`);
  return currentStreak;
};

export const calculateAnalytics = (data: CopyDockData): AnalyticsData => {
  const totalWords = data.notebooks.reduce((sum, nb) => sum + nb.wordCount, 0);
  
  const notebookBreakdown = data.notebooks.map(nb => ({
    name: nb.name,
    value: nb.wordCount,
  }));
  
  const storageMb = calculateStorageSize(data);
  const todoStreak = calculateTodoStreak(data.todoSystem);
  
  // Calculate best streak - maintain the highest ever streak
  const previousBestStreak = data.analytics.goals?.bestStreak || 0;
  const bestStreak = Math.max(todoStreak, previousBestStreak);
  
  // Generate 7-day activity data
  const activityData = generate7DayActivity(data.activityLog || {});
  
  // Get today's stats
  const todayStats = getTodayStats(data.activityLog || {});
  
  // Calculate monthly progress
  const monthlyProgress = calculateMonthlyProgress(data.todoSystem);
  
  // Generate weekly insights
  const weeklyInsights = generateWeeklyInsights(data.activityLog || {});
  
  return {
    notebookCount: data.notebooks.length,
    streak: todoStreak,
    storageMb,
    storageTotalMb: 10,
    webCaptures: data.analytics.webCaptures || 0,
    activity: activityData,
    todayStats: {
      todos: todayStats.todos,
      captures: todayStats.captures,
      notes: todayStats.notes,
      words: todayStats.words,
    },
    content: {
      totalWords,
      breakdown: notebookBreakdown,
    },
    goals: {
      currentStreak: todoStreak,
      bestStreak: bestStreak,
      monthlyProgress: monthlyProgress,
    },
    storageBreakdown: [
      { name: 'Notebooks', value: storageMb * 0.9 },
      { name: 'Todos', value: storageMb * 0.1 },
    ],
    weeklyInsights: weeklyInsights,
  };
};

// ============================================
// Activity Tracking Functions
// ============================================

// Track activity for a specific date
export const trackActivity = (data, activityType, value = 1) => {
  const today = new Date().toISOString().split('T')[0];
  
  if (!data.activityLog) {
    data.activityLog = {};
  }
  
  if (!data.activityLog[today]) {
    data.activityLog[today] = {
      todosCompleted: 0,
      notesCreated: 0,
      captures: 0,
      wordsWritten: 0,
    };
  }
  
  switch (activityType) {
    case 'todoCompleted':
      data.activityLog[today].todosCompleted += value;
      break;
    case 'noteCreated':
      data.activityLog[today].notesCreated += value;
      break;
    case 'capture':
      data.activityLog[today].captures += value;
      break;
    case 'wordsWritten':
      data.activityLog[today].wordsWritten += value;
      break;
  }
  
  return data;
};

// Generate 7-day activity chart data
export const generate7DayActivity = (activityLog) => {
  const result = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayData = activityLog[dateStr] || {
      todosCompleted: 0,
      notesCreated: 0,
      captures: 0,
    };
    
    result.push({
      date: dateStr,
      todos: dayData.todosCompleted || 0,
      captures: dayData.captures || 0,
      notes: dayData.notesCreated || 0,
    });
  }
  
  return result;
};

// Get today's statistics - calculate directly from todo system and activity log
export const getTodayStats = (activityLog, todoSystem) => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  
  // Calculate actual completed todos for today from todo system
  let todosCompleted = 0;
  
  if (todoSystem && todoSystem.length > 0) {
    const yearData = todoSystem.find(y => y.year === todayYear);
    if (yearData && yearData.months[todayMonth]) {
      const monthData = yearData.months[todayMonth];
      if (monthData.days) {
        const dayData = monthData.days.find(d => d.day === todayDay);
        if (dayData && dayData.hours) {
          todosCompleted = dayData.hours.filter(h => h.completed).length;
        }
      }
    }
  }
  
  // Get other stats from activity log
  const todayStr = today.toISOString().split('T')[0];
  const todayData = activityLog[todayStr] || {
    notesCreated: 0,
    captures: 0,
    wordsWritten: 0,
  };
  
  return {
    todos: todosCompleted,
    captures: todayData.captures || 0,
    notes: todayData.notesCreated || 0,
    words: todayData.wordsWritten || 0,
  };
};

// Calculate monthly progress
export const calculateMonthlyProgress = (todoSystem) => {
  if (!todoSystem || todoSystem.length === 0) return 0;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const yearData = todoSystem.find(y => y.year === currentYear);
  if (!yearData || !yearData.months[currentMonth]) return 0;
  
  const monthData = yearData.months[currentMonth];
  if (!monthData.days || monthData.days.length === 0) return 0;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  monthData.days.forEach(day => {
    if (day.hours) {
      day.hours.forEach(hour => {
        totalTasks++;
        if (hour.completed) {
          completedTasks++;
        }
      });
    }
  });
  
  return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
};

// Generate weekly insights - calculate directly from todo system
export const generateWeeklyInsights = (activityLog, todoSystem) => {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Calculate actual completed todos for this day from todo system
    let completedTodos = 0;
    if (todoSystem && todoSystem.length > 0) {
      const yearData = todoSystem.find(y => y.year === date.getFullYear());
      if (yearData && yearData.months[date.getMonth()]) {
        const monthData = yearData.months[date.getMonth()];
        if (monthData.days) {
          const dayData = monthData.days.find(d => d.day === date.getDate());
          if (dayData && dayData.hours) {
            completedTodos = dayData.hours.filter(h => h.completed).length;
          }
        }
      }
    }
    
    last7Days.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      totalTasks: completedTodos,
    });
  }
  
  // Calculate total tasks across the week
  const totalTasks = last7Days.reduce((sum, day) => sum + day.totalTasks, 0);
  
  // If no tasks at all, return N/A
  if (totalTasks === 0) {
    return {
      mostProductiveDay: 'N/A',
      averageTasksPerDay: 0,
      trend: 'Stable',
    };
  }
  
  // Find most productive day (only among days with tasks)
  const mostProductive = last7Days.reduce((max, day) => 
    day.totalTasks > max.totalTasks ? day : max, 
    last7Days[0]
  );
  
  // Calculate average
  const averageTasksPerDay = Math.round(totalTasks / 7);
  
  // Determine trend (compare first 3 days vs last 3 days)
  const firstHalf = last7Days.slice(0, 3).reduce((sum, day) => sum + day.totalTasks, 0) / 3;
  const secondHalf = last7Days.slice(4, 7).reduce((sum, day) => sum + day.totalTasks, 0) / 3;
  
  let trend = 'Stable';
  if (secondHalf > firstHalf * 1.2) trend = 'Increasing';
  else if (secondHalf < firstHalf * 0.8) trend = 'Decreasing';
  
  return {
    mostProductiveDay: mostProductive.dayName,
    averageTasksPerDay,
    trend,
  };
};

// Get recent notebooks (sorted by last accessed)
export const getRecentNotebooks = (notebooks, limit = 5) => {
  return notebooks
    .filter(nb => nb.lastAccessed)
    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    .slice(0, limit);
};

// Get favorite notebooks
export const getFavoriteNotebooks = (notebooks) => {
  return notebooks
    .filter(nb => nb.isFavorite)
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
};
