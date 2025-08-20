import React, { useState, useEffect, useRef } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Star, Trash2, Target, Calendar, Copy, RotateCcw, ChevronLeft, ChevronRight, Moon, Coffee, Utensils, Play, Pause, SkipForward, Zap, Battery, BatteryLow, Timer, TrendingUp, Brain, Flame, AlertCircle, Shuffle } from 'lucide-react';

const AdvancedLifePlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('30');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskType, setNewTaskType] = useState('task');
  const [newTaskEnergy, setNewTaskEnergy] = useState('medium');
  const [startTime, setStartTime] = useState('09:00');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Pomodoro Timer State
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [pomodoroMode, setPomodoroMode] = useState('work'); // 'work' or 'break'
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const timerRef = useRef(null);

  // Streak and analytics
  const [streakData, setStreakData] = useState({ current: 0, best: 0, lastDate: null });

  // Default life tasks template with energy levels
  const defaultLifeTasks = [
    { text: 'Sleep', timeEstimate: 480, priority: 'high', type: 'life', startTime: '23:00', recurring: 'daily', energy: 'low' },
    { text: 'Morning routine', timeEstimate: 60, priority: 'medium', type: 'life', startTime: '07:00', recurring: 'daily', energy: 'medium' },
    { text: 'Breakfast', timeEstimate: 30, priority: 'medium', type: 'life', startTime: '08:00', recurring: 'daily', energy: 'low' },
    { text: 'Lunch', timeEstimate: 45, priority: 'medium', type: 'life', startTime: '12:30', recurring: 'daily', energy: 'low' },
    { text: 'Dinner', timeEstimate: 60, priority: 'medium', type: 'life', startTime: '18:30', recurring: 'daily', energy: 'low' },
    { text: 'Evening wind down', timeEstimate: 60, priority: 'low', type: 'life', startTime: '22:00', recurring: 'daily', energy: 'low' }
  ];

  // Load data from memory
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('dailyPlannerTasks') || '{}');
    const savedStreak = JSON.parse(localStorage.getItem('streakData') || '{"current": 0, "best": 0, "lastDate": null}');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    setTasks(savedTasks);
    setStreakData(savedStreak);
    setDarkMode(savedDarkMode);
  }, []);

  // Save data to memory
  useEffect(() => {
    localStorage.setItem('dailyPlannerTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('streakData', JSON.stringify(streakData));
  }, [streakData]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Pomodoro timer effect
  useEffect(() => {
    if (pomodoroActive && pomodoroTime > 0) {
      timerRef.current = setTimeout(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      // Pomodoro completed
      setPomodoroActive(false);
      if (pomodoroMode === 'work') {
        setPomodoroMode('break');
        setPomodoroTime(5 * 60); // 5 minute break
      } else {
        setPomodoroMode('work');
        setPomodoroTime(25 * 60); // Back to 25 minutes
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [pomodoroActive, pomodoroTime, pomodoroMode]);

  // Update streak when tasks are completed
  useEffect(() => {
    const todaysTasks = getTodaysTasks();
    const completedToday = todaysTasks.filter(task => task.completed).length;
    const totalToday = todaysTasks.length;
    
    if (totalToday > 0 && completedToday / totalToday >= 0.8) { // 80% completion
      const today = new Date().toISOString().split('T')[0];
      if (streakData.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const newCurrent = streakData.lastDate === yesterdayStr ? streakData.current + 1 : 1;
        const newBest = Math.max(newCurrent, streakData.best);
        
        setStreakData({
          current: newCurrent,
          best: newBest,
          lastDate: today
        });
      }
    }
  }, [tasks, selectedDate]);

  const getTodaysTasks = () => {
    return tasks[selectedDate] || [];
  };

  const initializeDay = (date) => {
    if (!tasks[date] || tasks[date].length === 0) {
      const newTasks = defaultLifeTasks.map((task, index) => ({
        id: Date.now() + index,
        ...task,
        completed: false,
        createdAt: new Date().toLocaleTimeString()
      }));
      setTasks(prev => ({ ...prev, [date]: newTasks }));
    }
  };

  useEffect(() => {
    initializeDay(selectedDate);
  }, [selectedDate]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        timeEstimate: parseInt(newTaskTime),
        priority: newTaskPriority,
        type: newTaskType,
        energy: newTaskEnergy,
        startTime: startTime,
        createdAt: new Date().toLocaleTimeString()
      };
      
      setTasks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), task]
      }));
      
      setNewTask('');
      setNewTaskTime('30');
      setStartTime('09:00');
    }
  };

  const toggleTask = (id) => {
    setTasks(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(task => task.id !== id)
    }));
  };

  // Auto-schedule tasks
  const autoSchedule = () => {
    const todaysTasks = getTodaysTasks();
    const unscheduledTasks = todaysTasks.filter(task => !task.startTime || task.type === 'task');
    const scheduledTasks = todaysTasks.filter(task => task.startTime && task.type !== 'task');
    
    // Sort by priority and energy
    const sortedUnscheduled = [...unscheduledTasks].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      const energyOrder = { high: 3, medium: 2, low: 1 };
      return energyOrder[b.energy] - energyOrder[a.energy];
    });

    // Find available time slots
    let currentTime = 9 * 60; // Start at 9 AM (in minutes)
    const endTime = 22 * 60; // End at 10 PM
    
    // Get blocked times from scheduled tasks
    const blockedTimes = scheduledTasks.map(task => {
      if (!task.startTime) return null;
      const [hours, minutes] = task.startTime.split(':').map(Number);
      const start = hours * 60 + minutes;
      const end = start + task.timeEstimate;
      return { start, end };
    }).filter(Boolean).sort((a, b) => a.start - b.start);

    // Schedule unscheduled tasks
    const updatedTasks = [...scheduledTasks];
    
    for (const task of sortedUnscheduled) {
      let scheduled = false;
      
      // Find next available slot
      for (let i = 0; i <= blockedTimes.length; i++) {
        const slotStart = i === 0 ? currentTime : blockedTimes[i - 1].end + 15; // 15 min buffer
        const slotEnd = i === blockedTimes.length ? endTime : blockedTimes[i].start - 15;
        
        if (slotEnd - slotStart >= task.timeEstimate) {
          const hours = Math.floor(slotStart / 60);
          const minutes = slotStart % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          updatedTasks.push({
            ...task,
            startTime: timeString
          });
          
          blockedTimes.splice(i, 0, {
            start: slotStart,
            end: slotStart + task.timeEstimate
          });
          
          scheduled = true;
          break;
        }
      }
      
      if (!scheduled) {
        updatedTasks.push(task); // Keep unscheduled if no slot found
      }
    }
    
    setTasks(prev => ({
      ...prev,
      [selectedDate]: updatedTasks
    }));
  };

  // Get next action
  const getNextAction = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const todaysTasks = getTodaysTasks();
    const incompleteTasks = todaysTasks.filter(task => !task.completed && task.startTime);
    
    // Find current or next task
    const upcomingTasks = incompleteTasks.filter(task => {
      const [hours, minutes] = task.startTime.split(':').map(Number);
      const taskTime = hours * 60 + minutes;
      return taskTime >= currentTimeInMinutes - 30; // Include tasks that started up to 30 min ago
    }).sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    return upcomingTasks[0] || null;
  };

  // Quick wins (tasks under 15 minutes)
  const getQuickWins = () => {
    const todaysTasks = getTodaysTasks();
    return todaysTasks.filter(task => !task.completed && task.timeEstimate <= 15);
  };

  // Pomodoro functions
  const startPomodoro = (taskId = null) => {
    setCurrentTaskId(taskId);
    setPomodoroActive(true);
  };

  const pausePomodoro = () => {
    setPomodoroActive(false);
  };

  const resetPomodoro = () => {
    setPomodoroActive(false);
    setPomodoroTime(pomodoroMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const skipPomodoro = () => {
    setPomodoroTime(0);
  };

  // Navigation functions
  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Helper functions
  const getPriorityColor = (priority) => {
    const colors = {
      high: darkMode ? 'border-l-red-400 bg-red-900/20' : 'border-l-red-400 bg-red-50',
      medium: darkMode ? 'border-l-yellow-400 bg-yellow-900/20' : 'border-l-yellow-400 bg-yellow-50',
      low: darkMode ? 'border-l-green-400 bg-green-900/20' : 'border-l-green-400 bg-green-50'
    };
    return colors[priority] || (darkMode ? 'border-l-gray-400 bg-gray-800' : 'border-l-gray-400 bg-gray-50');
  };

  const getEnergyIcon = (energy) => {
    switch (energy) {
      case 'high': return <Zap className="w-4 h-4 text-red-500" />;
      case 'medium': return <Battery className="w-4 h-4 text-yellow-500" />;
      case 'low': return <BatteryLow className="w-4 h-4 text-green-500" />;
      default: return <Battery className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'life': return <Moon className="w-4 h-4 text-blue-500" />;
      case 'work': return <Target className="w-4 h-4 text-purple-500" />;
      case 'personal': return <Coffee className="w-4 h-4 text-green-500" />;
      default: return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatPomodoroTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    const allDates = Object.keys(tasks);
    const last7Days = allDates.slice(-7);
    
    let totalTasks = 0;
    let completedTasks = 0;
    let totalTime = 0;
    const typeBreakdown = { work: 0, personal: 0, life: 0, task: 0 };
    
    last7Days.forEach(date => {
      if (tasks[date]) {
        tasks[date].forEach(task => {
          totalTasks++;
          totalTime += task.timeEstimate;
          typeBreakdown[task.type] = (typeBreakdown[task.type] || 0) + task.timeEstimate;
          if (task.completed) completedTasks++;
        });
      }
    });
    
    return {
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      avgTimePerDay: Math.round(totalTime / 7),
      typeBreakdown,
      totalTasks,
      completedTasks
    };
  };

  // Get current time conflicts
  const getTimeConflicts = () => {
    const todaysTasks = getTodaysTasks();
    const conflicts = [];
    
    for (let i = 0; i < todaysTasks.length; i++) {
      for (let j = i + 1; j < todaysTasks.length; j++) {
        const task1 = todaysTasks[i];
        const task2 = todaysTasks[j];
        
        if (task1.startTime && task2.startTime) {
          const start1 = task1.startTime.split(':').map(Number);
          const start2 = task2.startTime.split(':').map(Number);
          const time1 = start1[0] * 60 + start1[1];
          const time2 = start2[0] * 60 + start2[1];
          
          const end1 = time1 + task1.timeEstimate;
          const end2 = time2 + task2.timeEstimate;
          
          if ((time1 < end2 && end1 > time2)) {
            conflicts.push({ task1: task1.text, task2: task2.text, time: task1.startTime });
          }
        }
      }
    }
    
    return conflicts;
  };

  const todaysTasks = getTodaysTasks();
  const sortedTasks = [...todaysTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed - b.completed;
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const totalTasks = todaysTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPlannedTime = todaysTasks.reduce((sum, task) => sum + task.timeEstimate, 0);
  const remainingTime = 1440 - totalPlannedTime;

  const nextAction = getNextAction();
  const quickWins = getQuickWins();
  const analytics = calculateAnalytics();
  const conflicts = getTimeConflicts();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const themeClasses = darkMode 
    ? 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
    : 'min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900';

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div className={themeClasses}>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header with Date Navigation */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={goToPreviousDay} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h1 className="text-3xl font-bold">{formatDate(selectedDate)}</h1>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`text-sm bg-transparent border-none cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </div>
              <button onClick={goToNextDay} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? <Moon className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 rounded-lg border transition-colors text-sm flex items-center gap-2 ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
          
          {/* Streak Display */}
          <div className="flex justify-center mb-4">
            <div className={`px-6 py-2 rounded-full border ${cardClasses} flex items-center gap-2`}>
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">{streakData.current} day streak</span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>(Best: {streakData.best})</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 justify-center mb-6 flex-wrap">
            <button onClick={goToToday} className={`px-4 py-2 rounded-lg border transition-colors text-sm ${cardClasses}`}>
              Today
            </button>
            <button onClick={autoSchedule} className={`px-4 py-2 rounded-lg border transition-colors text-sm flex items-center gap-2 ${cardClasses}`}>
              <Shuffle className="w-4 h-4" />
              Auto-Schedule
            </button>
            <button onClick={() => setShowCopyModal(true)} className={`px-4 py-2 rounded-lg border transition-colors text-sm flex items-center gap-2 ${cardClasses}`}>
              <Copy className="w-4 h-4" />
              Copy Day
            </button>
          </div>

          {/* Time Conflicts Warning */}
          {conflicts.length > 0 && (
            <div className="mb-4">
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Schedule Conflicts Detected!</span>
                <span className="text-sm">({conflicts.length} overlapping tasks)</span>
              </div>
            </div>
          )}

          {/* Day Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`rounded-xl shadow-sm border p-4 ${cardClasses}`}>
              <div className="text-2xl font-bold text-indigo-600">{formatTime(totalPlannedTime)}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Planned</div>
            </div>
            <div className={`rounded-xl shadow-sm border p-4 ${cardClasses}`}>
              <div className="text-2xl font-bold text-purple-600">{formatTime(remainingTime)}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Free Time</div>
            </div>
            <div className={`rounded-xl shadow-sm border p-4 ${cardClasses}`}>
              <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complete</div>
            </div>
            <div className={`rounded-xl shadow-sm border p-4 ${cardClasses}`}>
              <div className="text-2xl font-bold text-orange-600">{quickWins.length}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quick Wins</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`rounded-xl shadow-sm border p-4 ${cardClasses}`}>
            <div className={`flex justify-between items-center text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Daily Progress</span>
              <span>{completedTasks} of {totalTasks} tasks</span>
            </div>
            <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mb-8">
            <div className={`rounded-xl shadow-sm border p-6 ${cardClasses}`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                7-Day Analytics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.completionRate}%</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatTime(analytics.avgTimePerDay)}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg per Day</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.totalTasks}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analytics.completedTasks}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pomodoro Timer */}
            <div className={`rounded-xl shadow-sm border p-6 ${cardClasses}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Pomodoro
              </h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-2">
                  {formatPomodoroTime(pomodoroTime)}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {pomodoroMode === 'work' ? 'Focus Time' : 'Break Time'}
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => pomodoroActive ? pausePomodoro() : startPomodoro()}
                  className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  {pomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetPomodoro}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={skipPomodoro}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              {currentTaskId && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  Working on: {todaysTasks.find(t => t.id === currentTaskId)?.text}
                </div>
              )}
            </div>

            {/* Next Action */}
            {nextAction && (
              <div className={`rounded-xl shadow-sm border p-6 ${cardClasses}`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  Next Action
                </h3>
                <div className={`p-4 rounded-lg border-l-4 border-l-blue-400 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <div className="font-medium">{nextAction.text}</div>
                  <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {nextAction.startTime} • {formatTime(nextAction.timeEstimate)}
                  </div>
                  <button
                    onClick={() => startPomodoro(nextAction.id)}
                    className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Start Focus Session
                  </button>
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {quickWins.length > 0 && (
              <div className={`rounded-xl shadow-sm border p-6 ${cardClasses}`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Wins
                </h3>
                <div className="space-y-2">
                  {quickWins.slice(0, 3).map(task => (
                    <div key={task.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="flex-shrink-0"
                        >
                          <Circle className="w-4 h-4 text-gray-400 hover:text-green-500" />
                        </button>
                        <div className="flex-grow">
                          <div className="text-sm font-medium">{task.text}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTime(task.timeEstimate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Task Form */}
            <div className={`rounded-xl shadow-sm border p-6 ${cardClasses}`}>
              <h2 className="text-lg font-semibold mb-4">Add Task</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="What needs to be done?"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration</label>
                    <select
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                      <option value="180">3 hours</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="task">Task</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="life">Life/Health</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Energy</label>
                    <select
                      value={newTaskEnergy}
                      onChange={(e) => setNewTaskEnergy(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={addTask}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Task
                </button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-3">
            <div className="space-y-3">
              {sortedTasks.length === 0 ? (
                <div className={`text-center py-12 rounded-xl shadow-sm border ${cardClasses}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tasks planned for this day</p>
                  <button 
                    onClick={() => initializeDay(selectedDate)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Add default life tasks
                  </button>
                </div>
              ) : (
                sortedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-xl shadow-sm border-l-4 transition-all duration-200 hover:shadow-md ${
                      getPriorityColor(task.priority)
                    } ${task.completed ? 'opacity-75' : ''} ${cardClasses}`}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 transition-colors duration-200"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-indigo-500" />
                        )}
                      </button>
                      
                      <div className="flex-grow">
                        <p className={`font-medium ${task.completed ? 'line-through' : ''} ${
                          darkMode ? (task.completed ? 'text-gray-500' : 'text-white') : (task.completed ? 'text-gray-500' : 'text-gray-800')
                        }`}>
                          {task.text}
                        </p>
                        <div className={`flex items-center gap-4 mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {task.startTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.startTime}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(task.timeEstimate)}
                          </div>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(task.type)}
                            {task.type}
                          </div>
                          <div className="flex items-center gap-1">
                            {getEnergyIcon(task.energy)}
                            {task.energy} energy
                          </div>
                          {task.recurring && (
                            <div className="flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              {task.recurring}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {!task.completed && (
                          <button
                            onClick={() => startPomodoro(task.id)}
                            className="p-2 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
                            title="Start Pomodoro"
                          >
                            <Timer className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Copy Day Modal */}
        {showCopyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl p-6 max-w-md w-full ${cardClasses}`}>
              <h3 className="text-lg font-semibold mb-4">Copy Day</h3>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select a date to copy tasks from:</p>
              <input
                type="date"
                onChange={(e) => {
                  copyDay(e.target.value, selectedDate);
                }}
                className={`w-full px-3 py-2 border rounded-lg mb-4 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCopyModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Footer */}
        {totalTasks > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-xl shadow-sm">
              {completionPercentage === 100 ? (
                <div>
                  <h3 className="text-xl font-bold mb-2">🎉 Amazing work!</h3>
                  <p>You've completed all your tasks for today. Time to celebrate!</p>
                </div>
              ) : completionPercentage >= 80 ? (
                <div>
                  <h3 className="text-xl font-bold mb-2">🔥 You're crushing it!</h3>
                  <p>Almost there! {streakData.current > 0 && `Keep that ${streakData.current}-day streak alive!`}</p>
                </div>
              ) : completionPercentage >= 50 ? (
                <div>
                  <h3 className="text-xl font-bold mb-2">💪 Strong progress!</h3>
                  <p>More than halfway there. You've got momentum!</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold mb-2">🚀 Every step counts!</h3>
                  <p>Start with a quick win and build that momentum. You've got this!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedLifePlanner;