import { CopyDockData, Notebook, Note, YearPlan, AnalyticsData } from '../types';

const STORAGE_KEY = 'copyDockData';

export const getInitialData = (): CopyDockData => {
  return {
    notebooks: [],
    notes: [],
    analytics: {
      notebookCount: 0,
      streak: 0,
      totalNotes: 0,
      storageMb: 0,
      storageTotalMb: 10,
      activity: [],
      today: {
        notes: 0,
        todos: 0,
        templates: 0,
        captures: 0,
      },
      content: {
        totalWords: 0,
        avgWordsPerNote: 0,
        breakdown: [],
      },
      goals: {
        currentStreak: 0,
        bestStreak: 0,
        monthlyProgress: 0,
      },
      storageBreakdown: [],
      templates: [],
      recentActivity: [],
      favorites: [],
      weeklyInsights: {
        mostProductiveDay: 'Monday',
        totalWords: 0,
        notesCreated: 0,
        todosCompleted: 0,
      },
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
  if (!todoSystem || todoSystem.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentStreak = 0;
  let checkDate = new Date(today);

  // Go backwards from today
  for (let i = 0; i < 365; i++) {
    const year = checkDate.getFullYear();
    const month = checkDate.getMonth();
    const day = checkDate.getDate();

    const yearData = todoSystem.find(y => y.year === year);
    if (!yearData) {
      // No data for this year - if it's not today, break the streak
      if (i > 0) break;
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    const monthData = yearData.months[month];
    if (!monthData || !monthData.days) {
      // No data for this month - if it's not today, break the streak
      if (i > 0) break;
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    const dayData = monthData.days.find(d => d.day === day);
    // Check if at least one task is completed for this day
    const hasCompletedTask = dayData?.hours?.some(h => h.completed);

    if (hasCompletedTask) {
      currentStreak++;
    } else if (i > 0) {
      // Only break if it's not today (allow today to have no tasks yet)
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

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
