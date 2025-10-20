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
    },
    todoSystem: [],
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
  const today = new Date().toISOString().split('T')[0];
  const todayNotes = data.notes.filter(n => n.createdAt.startsWith(today));
  const webCaptures = data.notes.filter(n => n.source).length;
  
  const totalWords = data.notes.reduce((sum, note) => sum + note.wordCount, 0);
  const avgWords = data.notes.length > 0 ? Math.round(totalWords / data.notes.length) : 0;
  
  const notebookBreakdown = data.notebooks.map(nb => ({
    name: nb.name,
    value: data.notes.filter(n => n.notebookId === nb.id).length,
  }));
  
  const storageMb = calculateStorageSize(data);
  const todoStreak = calculateTodoStreak(data.todoSystem);
  
  // Calculate best streak - maintain the highest ever streak
  const previousBestStreak = data.analytics.goals?.bestStreak || 0;
  const bestStreak = Math.max(todoStreak, previousBestStreak);
  
  return {
    notebookCount: data.notebooks.length,
    streak: todoStreak,
    totalNotes: data.notes.length,
    storageMb,
    storageTotalMb: 10,
    webCaptures,
    activity: data.analytics.activity || [],
    today: {
      notes: todayNotes.length,
      todos: data.analytics.today?.todos || 0,
      templates: data.analytics.today?.templates || 0,
      captures: todayNotes.filter(n => n.source).length,
    },
    content: {
      totalWords,
      avgWordsPerNote: avgWords,
      breakdown: notebookBreakdown,
    },
    goals: {
      currentStreak: todoStreak,
      bestStreak: bestStreak,
      monthlyProgress: data.analytics.goals?.monthlyProgress || 0,
    },
    storageBreakdown: [
      { name: 'Notes', value: storageMb * 0.7 },
      { name: 'Images', value: storageMb * 0.2 },
      { name: 'Templates', value: storageMb * 0.1 },
    ],
    templates: data.analytics.templates || [],
    recentActivity: data.analytics.recentActivity || [],
    favorites: data.analytics.favorites || [],
    weeklyInsights: data.analytics.weeklyInsights || {
      mostProductiveDay: 'Monday',
      totalWords: 0,
      notesCreated: 0,
      todosCompleted: 0,
    },
  };
};
